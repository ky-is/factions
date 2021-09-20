import type { Router } from 'vue-router'

import type { ActionResolution } from '#c/types/cards.js'
import type { SocketError } from '#c/types/socket.js'
import type { PlayGame } from '#c/game/Game.js'

import { socket } from '#p/models/api.js'

export function ioLobbyJoin(router: Router, status: boolean | string) {
	socket.emit('lobby-join', status, (error?: SocketError) => {
		if (error) {
			console.log('lobby-join', error.message)
			router.replace({ name: 'Lobby' })
		}
	})
}

export function emitGame(action: string, ...params: any[]) {
	return new Promise<boolean>((resolve, reject) => {
		const event = `factions-${action}`
		socket.emit(event, ...params, (error?: SocketError) => {
			if (error) {
				if (error.message) {
					console.log(event, error.message)
				}
			}
			resolve(!error)
		})
	})
}

export function registerGame(game: PlayGame) {
	socket.on('factions-play', (handCardIndex: number, resolutions: ActionResolution[]) => {
		game.currentPlayer().playCardAt(handCardIndex, resolutions)
	})
	socket.on('factions-action', (playedCardIndex: number, actionIndex: number, resolutions: ActionResolution[]) => {
		game.currentPlayer().playPendingAction(playedCardIndex, actionIndex, resolutions)
	})
	socket.on('factions-buy', (shopIndex: number | null) => {
		game.acquireFromShopAt(shopIndex)
	})
	socket.on('factions-attack', (playerIndex: number, damage: number) => {
		const target = game.players[playerIndex]
		game.currentPlayer().attack(target, damage)
	})
	socket.on('factions-end', () => {
		game.endTurn()
	})
}

export function deregisterGame() {
	socket.off('factions-play')
	socket.off('factions-action')
	socket.off('factions-buy')
	socket.off('factions-attack')
	socket.off('factions-end')
}
