import type { Socket } from 'socket.io'

import { Game, getGamesData } from '#s/game/Game.js'

import type { SocketUser } from '#s/sockets/SocketUser.js'

export function registerLobby(socket: Socket) {
	socket.on('lobby-join', (joining) => {
		if (joining) {
			if (joining === true) {
				const user = socket.data.user as SocketUser
				if (user.game && !user.game.started) {
					user.leaveGame()
				}
			}
			socket.join('lobby')
			socket.emit('lobby-games', getGamesData())

			if (typeof joining === 'string') {
				//TODO
			}
		} else {
			socket.leave('lobby')
		}
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
