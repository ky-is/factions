import type { Socket } from 'socket.io'

import type { ActionResolution } from '#c/types/cards.js'
import type { SocketResponse } from '#c/types/socket.js'

import type { SocketUser } from '#s/sockets/SocketUser.js'

export function registerGame(socket: Socket) {
	socket.on('factions-play', (handIndex: number, resolutions: ActionResolution[], callback: (response: SocketResponse) => void) => {
		const user = socket.data.user as SocketUser
		const game = user.game
		const play = game?.play
		if (!game || !play) {
			return callback({ message: 'Invalid game' })
		}
		const currentPlayer = play.currentPlayer()
		if (currentPlayer.id !== user.id) {
			return callback({ message: 'Not your turn' })
		}
		currentPlayer.playCardAt(handIndex, resolutions)
		game.emit('factions-play', undefined, handIndex, resolutions)
	})
}
