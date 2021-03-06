import type { Socket } from 'socket.io'

import type { UserData } from '#c/types/data'

import { SocketUser } from '#s/sockets/SocketUser'

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
	const user = socket.data.user as SocketUser
	user.game?.emitLobbyStatus(false, socket)
	socket.on('disconnect', () => {
		user.attemptToLeaveGame()
		user.sockets.delete(socket)
		if (!user.sockets.size) {
			socketUsers.delete(user.id)
		}
	})
}
