import type { Socket } from 'socket.io'

import { Game } from '#s/game/Game.js'

import type { SocketUser } from '#s/sockets/SocketUser.js'

export function registerLobby(socket: Socket) {
	socket.on('lobby-join', (joining) => {
		if (joining) {
			socket.join('lobby')
		} else {
			socket.leave('lobby')
		}
		if (typeof joining === 'string') {
			//TODO
		}
		socket.emit('lobby-games', []) //TODO
	})
	socket.on('lobby-create', () => {
		const user = socket.data.user as SocketUser
		if (user.game) {
			console.log('ERR: User already in game', user.id, user.game.id)
			return user.game.emitJoin(socket)
		}
		new Game('factions', 2, user)
	})
}
