import type { Socket, BroadcastOperator } from 'socket.io'

import type { UserData } from '#c/types.js'

import type { Game } from '#s/game/Game.js'
import { useIO } from '#s/helpers/io.js'

export class SocketUser {
	id: string
	name: string
	to: BroadcastOperator<any>
	game: Game | null = null
	sockets = new Set<Socket>()

	constructor(userData: UserData) {
		this.id = userData.id
		this.name = userData.name
		this.to = useIO(this.id)
	}

	join(room: string) {
		this.sockets.forEach(socket => {
			socket.join(room)
		})
	}

	leave(room: string) {
		this.sockets.forEach(socket => {
			socket.leave(room)
		})
	}

	leaveGame() {
		if (!this.game) {
			return
		}
		this.game.leave(this)
		// this.to.emit('lobby-left')
	}
}
