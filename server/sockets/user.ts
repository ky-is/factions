import type { Socket } from 'socket.io'

import type { UserData } from '#c/types.js'

import { SocketUser } from '#s/sockets/SocketUser.js'

const socketUsers = new Map<string, SocketUser>()

function newSocketUser(userData: UserData) {
	const socketUser = new SocketUser(userData)
	socketUsers.set(userData.id, socketUser)
	return socketUser
}

export function authorizeUser(socket: Socket, userData: UserData) {
	const userID = userData.id
	const socketUser = socketUsers.get(userID) ?? newSocketUser(userData)
	socketUser.sockets.add(socket)
	socket.join(userID)
	socket.data.user = socketUser
}

export function registerUser(socket: Socket) {
	socket.on('disconnect', () => {
		const user = socket.data.user as SocketUser
		user.leaveGame()
		user.sockets.delete(socket)
		if (!user.sockets.size) {
			socketUsers.delete(user.id)
		}
	})
}
