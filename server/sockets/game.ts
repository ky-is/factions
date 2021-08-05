import type { Socket } from 'socket.io'

import { TESTING } from '#c/utils.js'

import type { ActionResolution } from '#c/types/cards.js'
import type { SocketError } from '#c/types/socket.js'

import type { SocketUser } from '#s/sockets/SocketUser.js'
import type { Game } from '#s/game/Game.js'
import type { PlayGame } from '#c/game/Game.js'
import type { PlayPlayer } from '#c/game/Player.js'


function validateTurnAction(socket: Socket, event: string, ...data: any[]): string | [Game, PlayGame, PlayPlayer] {
	const user = socket.data.user as SocketUser
	const game = user.game
	const play = game?.play
	if (!game || !play) {
		if (TESTING) {
			socket.emit(`factions-${event}`, ...data)
			return ''
		}
		return 'Invalid game'
	}
	const turnPlayer = play.currentPlayer()
	if (turnPlayer.id !== user.id) {
		return 'Not your turn'
	}
	return [ game, play, turnPlayer ]
}

export function registerGame(socket: Socket) {
	socket.on('factions-play', (handIndex: number, resolutions: ActionResolution[], callback: (error?: SocketError) => void) => {
		const turnData = validateTurnAction(socket, 'play', handIndex)
		if (typeof turnData === 'string') {
			return callback({ message: turnData })
		}
		const [ game, play, turnPlayer ] = turnData
		turnPlayer.playCardAt(handIndex, resolutions)
		game.recordPlay(callback, 'play', handIndex, resolutions)
	})

	socket.on('factions-buy', (shopIndex: number | null, callback: (error?: SocketError) => void) => {
		const turnData = validateTurnAction(socket, 'buy', shopIndex)
		if (typeof turnData === 'string') {
			return callback({ message: turnData })
		}
		const [ game, play, turnPlayer ] = turnData
		if (!play.acquireFromShopAt(shopIndex)) {
			return callback({ message: 'Unable to purchase' })
		}
		game.recordPlay(callback, 'buy', shopIndex)
	})

	socket.on('factions-attack', (playerIndex: number, damage: number, callback: (error?: SocketError) => void) => {
		const turnData = validateTurnAction(socket, 'attack', playerIndex, damage)
		if (typeof turnData === 'string') {
			return callback({ message: turnData })
		}
		const [ game, play, turnPlayer ] = turnData
		const target = play.players[playerIndex]
		if (!turnPlayer.attack(target, damage)) {
			return callback({ message: 'Invalid damage' })
		}
		game.recordPlay(callback, 'attack', playerIndex, damage)
	})

	socket.on('factions-end', (callback: (error?: SocketError) => void) => {
		const turnData = validateTurnAction(socket, 'end')
		if (typeof turnData === 'string') {
			return callback({ message: turnData })
		}
		const [ game, play, turnPlayer ] = turnData
		play.endTurn()
		game.recordPlay(callback, 'end')
	})
}
