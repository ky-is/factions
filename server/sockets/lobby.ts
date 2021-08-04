import type { Socket } from 'socket.io'

import { isGameFull, isGameHost } from '#c/game.js'
import type { SocketResponse } from '#c/types/socket.js'

import { Game, getGame, emitLobbyGames, getAvailableGame } from '#s/game/Game.js'

import type { SocketUser } from '#s/sockets/SocketUser.js'

export function registerLobby(socket: Socket) {
	socket.on('lobby-join', (joining, callback: (response: SocketResponse) => void) => {
		if (joining) {
			emitLobbyGames(socket)
			const user = socket.data.user as SocketUser
			if (joining === true) {
				if (user.game && !user.game.play) {
					user.leaveGame()
					socket.join('lobby')
				}
			} else if (typeof joining === 'string') {
				const game = getGame(joining)
				let error: string
				if (!game) {
					error = 'Game does not exist'
				} else if (game.play) {
					error = 'Game already started'
				} else if (isGameFull(game)) {
					error = 'Game is full'
				} else {
					socket.leave('lobby')
					game.join(user)
					return
				}
				socket.join('lobby')
				return callback({ message: error })
			}
		} else {
			socket.leave('lobby')
		}
	})
	socket.on('lobby-autojoin', () => {
		const user = socket.data.user as SocketUser
		if (user.game) {
			user.game.emitLobbyStatus(socket)
			return console.log('ERR: User already in game', user.id, user.game.id)
		}
		const game = getAvailableGame()
		if (game) {
			game.join(user)
		} else {
			new Game('factions', 2, user, true)
		}
	})
	socket.on('lobby-create', () => {
		const user = socket.data.user as SocketUser
		if (user.game) {
			user.game.emitLobbyStatus(socket)
			return console.log('ERR: User already in game', user.id, user.game.id)
		}
		new Game('factions', 2, user, false)
	})
	socket.on('lobby-start', () => {
		const user = socket.data.user as SocketUser
		const game = user.game
		if (!game) {
			return console.log('ERR: Unknown game start', user.id, game)
		}
		if (!isGameHost(game, user)) {
			return console.log('ERR: Only the host may begin', user.id, game.host)
		}
		if (!isGameFull(game)) {
			return console.log('ERR: Lobby is not full', user.id, game.id)
		}
		game.start()
	})
}
