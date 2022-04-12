import type { Socket } from 'socket.io'

import { TESTING } from '#c/utils'

import type { ActionResolution } from '#c/types/cards'
import type { SocketError } from '#c/types/socket'

import type { SocketUser } from '#s/sockets/SocketUser'
import type { Game } from '#s/game/Game'
import type { PlayGame } from '#c/game/Game'
import type { PlayPlayer } from '#c/game/Player'

function validateTurnAction(socket: Socket, event: string, ...data: any[]): string | [Game, PlayGame, PlayPlayer] {
	const user = socket.data.user as SocketUser
	const game = user.game
	const play = game?.play
	if (!game || !play) {
		if (TESTING) { //TODO handle /test mode
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
	socket.on('factions-action', (playedCardIndex: number, actionIndex: number, resolutions: ActionResolution[], callback: (error?: SocketError) => void) => {
		const turnData = validateTurnAction(socket, 'action', playedCardIndex)
		if (typeof turnData === 'string') {
			return callback({ message: turnData })
		}
		const [ game, play, turnPlayer ] = turnData
		turnPlayer.playPendingAction(playedCardIndex, actionIndex, resolutions)
		game.recordPlay(callback, 'action', playedCardIndex, actionIndex, resolutions)
	})

	socket.on('factions-buy', (shopIndex: number | null, callback: (error?: SocketError) => void) => {
		const turnData = validateTurnAction(socket, 'buy', shopIndex)
		if (typeof turnData === 'string') {
			return callback({ message: turnData })
		}
		const [ game, play, turnPlayer ] = turnData
		if (!play.acquireFromShopAt(turnPlayer, shopIndex)) {
			return callback({ message: 'Unable to purchase' })
		}
		game.recordPlay(callback, 'buy', shopIndex)
	})

	socket.on('factions-attack', (playerIndex: number, playedCardIndex: number | null, damage: number, callback: (error?: SocketError) => void) => {
		const turnData = validateTurnAction(socket, 'attack', playerIndex, playedCardIndex, damage)
		if (typeof turnData === 'string') {
			return callback({ message: turnData })
		}
		const [ game, play, turnPlayer ] = turnData
		const targetPlayer = play.players[playerIndex]
		if (!turnPlayer.attack(targetPlayer, playedCardIndex, damage)) {
			return callback({ message: 'Invalid damage' })
		}
		game.recordPlay(callback, 'attack', playerIndex, playedCardIndex, damage)
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
