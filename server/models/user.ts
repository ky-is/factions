import { createTransport } from 'nodemailer'
import type { UserPasscodeData, UserData, SessionData } from '#c/types/data'
import { now, randomRange, SECONDS_IN_DAY, SECONDS_IN_MINUTE } from '#c/utils'

import { APIError } from '#s/helpers/errors'
import sql from '#s/helpers/sql'

const sessionDataColumns = sql('id', 'user_id')
const userDataColumns = sql('id', 'name', 'email')

async function newSessionFor(userID: string) {
	const [ session ] = await sql<[SessionData]>`
		INSERT INTO user_session(user_id)
		VALUES (${userID})
		RETURNING ${sessionDataColumns}
	`
	return session
}

export async function authUser(email: string, passcode: string) {
	if (!email || !passcode) {
		throw new APIError('Invalid sign in.', true)
	}
	const [ passcodeUser ] = await sql<[UserPasscodeData?]>`
		SELECT passcode, passcode_tries, EXTRACT(EPOCH FROM passcode_at)::int AS passcode_at
		FROM users
		WHERE email = ${email} AND passcode IS NOT NULL
	`
	if (!passcodeUser) {
		throw new APIError('Invalid account for authorization.', true)
	}
	if (passcodeUser.passcode_at != null && now() > passcodeUser.passcode_at + SECONDS_IN_DAY) {
		console.log(now(), passcodeUser.passcode_at, typeof passcodeUser.passcode_at, passcodeUser.passcode_at + SECONDS_IN_DAY)
		throw new APIError('Passcode expired, please try signing in again.', true)
	}
	if (passcodeUser.passcode_tries > 3) {
		throw new APIError('Too many invalid passcode attempts, please try signing in again.', true)
	}
	if (passcodeUser.passcode !== passcode) {
		await sql`
			UPDATE users
			SET passcode_tries = passcode_tries + 1, updated_at = CURRENT_TIMESTAMP
			WHERE email = ${email}
		`
		throw new APIError('Invalid passcode', false)
	}
	const [ user ] = await sql<[UserData]>`
		UPDATE users
		SET passcode = NULL, passcode_tries = 0, passcode_at = NULL, updated_at = CURRENT_TIMESTAMP
		WHERE email = ${email} AND passcode = ${passcode}
		RETURNING ${userDataColumns}
	`
	const session = await newSessionFor(user.id)
	return { user, session }
}

export async function createUser(email: string, name: string) {
	const [ user ] = await sql<[UserData?]>`
		INSERT INTO users(email, name)
		VALUES (${email}, ${name})
		RETURNING ${userDataColumns}
	`
	if (!user) {
		throw new APIError('User already exists, please try signing in instead.', true)
	}
	const session = await newSessionFor(user.id)
	return { user, session }
}

export async function createSession(user: UserData) {
	return newSessionFor(user.id)
}

export async function refreshPasscode(user: UserData) {
	if (user.passcode_at !== undefined && user.passcode_at + 5 * SECONDS_IN_MINUTE > now()) {
		return
	}
	const PASSCODE_LENGTH = 4
	const passcode = randomRange(Math.pow(10, PASSCODE_LENGTH - 1), Math.pow(10, PASSCODE_LENGTH) - 1)
	await sql`
		UPDATE users
		SET passcode = ${passcode}, passcode_tries = 0, passcode_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
		WHERE id = ${user.id}
	`

	const nodemailerTransporter = createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_ADDRESS,
			pass: process.env.EMAIL_PASSWORD,
		},
	})
	try {
		await nodemailerTransporter.sendMail({
			from: process.env.EMAIL_ADDRESS,
			to: user.email,
			subject: `(${passcode}) Enter your Factions passcode to sign in`,
			html: `${passcode}`,
			text: `${passcode}`,
		})
	} catch (error) {
		console.log(error)
	}
}

export async function userForEmail(email: string) {
	try {
		const [ user ] = await sql<[UserData?]>`
			SELECT ${userDataColumns}, EXTRACT(EPOCH FROM passcode_at) AS passcode_at
			FROM users
			WHERE email = ${email}
		`
		return user
	} catch (error) {
		console.log(error)
	}
	return undefined
}

export async function getUserForSession(sessionID: string) {
	try {
		const [ session ] = await sql<[SessionData?]>`
			UPDATE user_session
			SET updated_at = CURRENT_TIMESTAMP
			WHERE id = ${sessionID}
			RETURNING user_id
		`
		if (session) {
			const [ user ] = await sql<[UserData?]>`
				SELECT ${userDataColumns}
				FROM users
				WHERE id = ${session.user_id}
			`
			return user
		}
	} catch (error) {
		console.log(error)
	}
	return undefined
}

export async function getUsers(userIDs: string[]) {
	return sql<UserData[]>`
		SELECT ${userDataColumns}
		FROM users
		WHERE id IN (${userIDs})
	`
}
