import type { Router } from 'vue-router'

import type { ActionResolution } from '#c/types/cards.js'
import type { SocketResponse } from '#c/types/socket.js'

import { socket } from '#p/models/api'

export function ioLobbyJoin(router: Router, status: boolean | string) {
	socket.emit('lobby-join', status, (error?: SocketResponse) => {
		if (error) {
			console.log('lobby-join', error.message)
			router.replace({ name: 'Lobby' })
		}
	})
}

export function ioPlayCard(handIndex: number, resolutions: ActionResolution[]) {
	socket.emit('factions-play', handIndex, resolutions, (error?: SocketResponse) => {
		if (error) {
			console.log('factions-play', error.message)
		}
	})
}
