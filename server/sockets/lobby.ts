import type { Socket } from 'socket.io'

import { isGameFull, isGameHost } from '#c/game/utils'
import type { SocketError } from '#c/types/socket'

import { Game, getGame, emitLobbyGames, getAvailableGame } from '#s/game/Game'

import type { SocketUser } from '#s/sockets/SocketUser'

function joinMainLobby(socket: Socket) {
	socket.join('lobby')
	emitLobbyGames(socket)
}

export function registerLobby(socket: Socket) {
	socket.on('lobby-join', (joining: boolean | string, callback: (any: any) => void) => {
		console.log('lobby-join', joining)
		const user = socket.data.user as SocketUser
		if (joining === false) {
			user.attemptToLeaveGame()
			socket.leave('lobby')
			return callback({})
		} else if (joining === true) {
			if (user.game) {
				let gid
				if (user.attemptToLeaveGame()) {
					joinMainLobby(socket)
					gid = undefined
				} else {
					gid = user.game.id
				}
				return callback({ gid })
			} else {
				joinMainLobby(socket)
			}
		} else {
			const game = getGame(joining)
			let error: string | undefined
			if (!game) {
				error = 'Game does not exist'
				user.attemptToLeaveGame()
			} else {
				if (!game.hasPlayer(user)) {
					if (game.play) {
						error = 'Game already started'
					} else if (isGameFull(game)) {
						error = 'Game is full'
					}
				}
				if (!error) {
					socket.leave('lobby')
					game.join(user)
					return callback({ gid: game.id })
				}
			}
			joinMainLobby(socket)
			return callback({ message: error })
		}
	})
	socket.on('lobby-autojoin', () => {
		const user = socket.data.user as SocketUser
		console.log('lobby-autojoin', user.game?.id)
		if (user.game) {
			user.game.emitLobbyStatus(false, socket)
			return console.log('ERR: User already in game', user.id, user.game.id)
		}
		const game = getAvailableGame()
		if (game) {
			game.join(user)
		} else {
			new Game('factions', 2, user, true)
		}
	})
	socket.on('lobby-create', (callback: (any: any) => void) => {
		const user = socket.data.user as SocketUser
		console.log('lobby-create', user.game?.id)
		if (user.game) {
			user.game.emitLobbyStatus(false, socket)
			console.log('ERR: User already in game', user.id, user.game.id)
			return callback({ error: `ERR: User already in game ${user.id} ${user.game.id}` })
		}
		new Game('factions', 2, user, false)
	})
	socket.on('lobby-tsv', (tsvText: string) => {
		const user = socket.data.user as SocketUser
		const game = user.game
		if (!game) {
			return console.log('ERR: Unknown game tsv', user.id, game)
		}
		if (!isGameHost(user.game, user)) {
			return console.log('ERR: Only the host set cards', user.id, game.host)
		}
		const cardsText = tsvText.replace(/\n /g, ' ').trim()
		if (!cardsText.length) {
			return console.log('ERR: Empty cards', tsvText)
		}
		game.cardsText = cardsText
		game.emitLobbyStatus(false)
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
		if (!game.start()) {
			return console.log('ERR: Game not ready', user.id, game.id)
		}
	})
}
