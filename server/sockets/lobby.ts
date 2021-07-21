import type { Socket } from 'socket.io'

import { isGameFull } from '#c/game.js'

import { Game, getGame, emitLobby } from '#s/game/Game.js'

import type { SocketUser } from '#s/sockets/SocketUser.js'

export function registerLobby(socket: Socket) {
	socket.on('lobby-join', (joining) => {
		if (joining) {
			const user = socket.data.user as SocketUser
			if (joining === true) {
				if (user.game && !user.game.started) {
					user.leaveGame()
				}
				socket.join('lobby')
				emitLobby(socket)
			} else if (typeof joining === 'string') {
				const game = getGame(joining)
				if (!game) {
					return console.log('ERR: Game does not exist', user.name, joining)
				}
				if (game.started) {
					return console.log('ERR: Game already started', user.name, joining)
				}
				if (isGameFull(game)) {
					return console.log('ERR: Game is full', user.name, joining)
				}
				game.join(user)
			}
		} else {
			socket.leave('lobby')
		}
	})
	socket.on('lobby-create', () => {
		const user = socket.data.user as SocketUser
		if (user.game) {
			user.game.emitLobbyStatus(socket)
			return console.log('ERR: User already in game', user.id, user.game.id)
		}
		new Game('factions', 2, user)
	})
}
