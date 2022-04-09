import { io } from 'socket.io-client'

import type { UserData, SessionData } from '#c/types/data'
import { TESTING } from '#c/utils'

import { state, updateUsers, commit } from '#p/models/store'

const ENDPOINT_URL = TESTING ? 'http://localhost:3101' : 'https://factions.ky.is'

export const socket = io(ENDPOINT_URL, { autoConnect: false })

socket.on('connect', () => {
	commit.connected(true)
})
socket.on('disconnect', (reason) => {
	console.log('disconnect', reason)
	commit.connected(false)
})
socket.on('connect_error', error => {
	console.log('connect_error', error)
})
socket.on('reconnect_error', error => {
	console.log('reconnect_error', error)
})

export function connect(sessionID: string) {
	socket.auth = { sessionID }
	socket.connect()
}

async function ajax<Response>(endpointComponents: [string, string?, string?], body?: object) {
	const sessionID: string = state.user.sid
	return fetch(
		`${TESTING ? '' : ENDPOINT_URL}/api/${endpointComponents.join('/')}`,
		{
			method: body ? 'POST' : 'GET',
			headers: {
				'Authorization': sessionID ? `Bearer ${sessionID}` : '',
				// 'Authorization': `Bearer 42634bc0-0ee8-4d53-a792-5ea5c459e7c8`, //SAMPLE
				'Content-Type': 'application/json',
			},
			body: body ? JSON.stringify(body) : undefined,
		})
		.then(response => {
			return response.json()
		})
		.then(json => {
			if (json.users != null) {
				updateUsers(json.users, json.addUsers)
			}
			// console.log(endpointComponents, json) //SAMPLE
			return json as Response
		})
		.catch(error => {
			if ('cancel' in error) {
				console.log(error.message, error.cancel)
				throw undefined
			}
			console.log(error)
			throw error
		})
}

export function emailStatus(email: string) {
	type UserSessionResponse = { email: string, exists: boolean }
	return ajax<UserSessionResponse>([ 'user', 'email', email ])
}

type SigninResponse = { user: UserData, session: SessionData, message?: string, cancel?: boolean }

export function registerEmail(email: string, name: string) {
	return ajax<SigninResponse>([ 'user', 'register', email ], { name })
}

export function signinPasscode(email: string, passcode: string) {
	return ajax<SigninResponse>([ 'user', 'signin', email ], { passcode })
}
