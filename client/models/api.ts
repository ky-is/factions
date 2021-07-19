import { state, updateUsers } from '#p/models/store'

import type { UserSessionData, SessionData } from '#c/types'

import { io } from 'socket.io-client'

const socket = io('http://localhost:3101', { autoConnect: false })

socket.on("connect_error", error => {
	console.log(error)
})

export function connect(sessionID: string) {
	socket.auth = { sessionID }
	socket.connect()
}

async function ajax<Response>(endpointComponents: [string, string?, string?], body?: object) {
	const sessionID = state.user.sid
	return fetch(
		`/api/${endpointComponents.join('/')}`,
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
			if (json.users) {
				updateUsers(json.users, json.addUsers)
			}
			// console.log(endpointComponents, json) //SAMPLE
			return json as Response
		})
		.catch(error => {
			if (error.cancel) {
				console.log('Cancellation error')
			}
			console.log(error.message)
		})
}

export function emailStatus(email: string) {
	type UserSessionResponse = { user: UserSessionData, session: SessionData }
	return ajax<UserSessionResponse>([ 'user', 'email', email ])
}
