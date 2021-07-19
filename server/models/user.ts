import { APIError } from '#s/helpers/errors.js'
import sql from '#s/helpers/sql.js'

import type { UserPasscodeData, UserSessionData, SessionData } from '#c/types'

const sessionDataColumns = sql('id', 'user_id')
const userDataColumns = sql('id', 'name')

async function newSessionFor(userID: string) {
	const [ session ] = await sql<[SessionData]>`
		INSERT INTO user_session(user_id)
		VALUES (${userID})
		RETURNING ${sessionDataColumns}
	`
	return session
}

export async function authUser(email: string, passcode: string) {
	const [ passcodeUser ] = await sql<[UserPasscodeData?]>`
		SELECT passcode, passcode_attempts
		FROM users
		WHERE email = ${email} AND passcode != NULL
	`
	if (!passcodeUser) {
		throw new APIError('Invalid account for authorization.', true)
	}
	if (passcodeUser.passcode_attempts > 3) {
		throw new APIError('Too many invalid passcode attempts, please try signing in again.', true)
	}
	if (passcodeUser.passcode !== passcode) {
		await sql`
			UPDATE users
			SET passcode_attempts = passcode_attempts + 1, updated_at = CURRENT_TIMESTAMP
			WHERE email = ${email}
		`
		throw new APIError('Invalid passcode', false)
	}
	const [ user ] = await sql<[UserSessionData]>`
		UPDATE users
		SET passcode = NULL, passcode_attempts = 0, updated_at = CURRENT_TIMESTAMP
		WHERE email = ${email} AND passcode = ${passcode}
		RETURNING ${userDataColumns}
	`
	return user
}

export async function createUser(email: string, name: string) {
	const [ user ] = await sql<[UserSessionData]>`
		INSERT INTO users(email, name)
		VALUES (${email}, ${name})
		RETURNING ${userDataColumns}
	`
	if (!user.id) {
		throw new APIError('User already exists, please try signing in instead.', true)
	}
	const session = await newSessionFor(user.id)
	return { user, session }
}

export async function createSession(user: UserSessionData) {
	return newSessionFor(user.id)
}

export async function userForEmail(email: string) {
	try {
		const [ user ] = await sql<[UserSessionData?]>`
			SELECT ${userDataColumns}
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
		if (session?.user_id) {
			const [ user ] = await sql<[UserSessionData?]>`
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
	return sql<UserSessionData[]>`
		SELECT ${userDataColumns}
		FROM users
		WHERE id IN (${userIDs})
	`
}
