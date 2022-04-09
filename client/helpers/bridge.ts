import type { Router } from 'vue-router'

import type { ActionResolution } from '#c/types/cards.js'
import type { SocketError } from '#c/types/socket.js'
import type { PlayGame } from '#c/game/Game.js'
import type { PlayPlayer } from '#c/game/Player.js'

import { socket } from '#p/models/api.js'
import type { ResolveCard } from '#p/helpers/ResolveCard.js'
import { state } from '#p/models/store.js'

function routeToLobby(router: Router, gid: string | undefined) {
	let previousGID: string | undefined = state.previousRoute?.params.id as string
	if (!previousGID?.length) {
		previousGID = undefined
	}
	if (state.previousRoute?.name === 'Lobby' && previousGID == gid) {
		router.back()
	} else {
		router.replace({ name: 'Lobby', params: { id: gid } })
	}
}

export function ioLobbyJoin(router: Router, status: boolean | string) {
	socket.emit('lobby-join', status, ({ gid, error }: { gid?: string, error?: SocketError }) => {
		if (error) {
			console.log('lobby-join', error.message)
		}
		routeToLobby(router, gid)
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

export function registerGame(game: PlayGame, resolver: ResolveCard, localPlayer: PlayPlayer) {
	socket.on('factions-play', (handCardIndex: number, resolutions: ActionResolution[]) => {
		const player = game.currentPlayer()
		player.playCardAt(handCardIndex, resolutions)
		if (player === localPlayer) {
			return resolver.resumeResolving()
		}
	})
	socket.on('factions-action', (playedCardIndex: number, cardActionIndex: number, resolutions: ActionResolution[]) => {
		const player = game.currentPlayer()
		player.playPendingAction(playedCardIndex, cardActionIndex, resolutions)
		if (player === localPlayer) {
			return resolver.resumeResolving()
		}
	})
	socket.on('factions-buy', (shopIndex: number | null) => {
		game.acquireFromShopAt(game.currentPlayer(), shopIndex)
	})
	socket.on('factions-attack', (playerIndex: number, playedCardIndex: number | null, damage: number) => {
		const target = game.players[playerIndex]
		game.currentPlayer().attack(target, playedCardIndex, damage)
	})
	socket.on('factions-end', () => {
		game.endTurn()

		const player = game.currentPlayer()
		player.startTurn()
		if (player === localPlayer) {
			return resolver.resumeResolving()
		}
	})
}

export function deregisterGame() {
	socket.off('factions-play')
	socket.off('factions-action')
	socket.off('factions-buy')
	socket.off('factions-attack')
	socket.off('factions-end')
}
