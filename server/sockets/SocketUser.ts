import type { Socket, BroadcastOperator } from 'socket.io'

import type { UserData } from '#c/types/data'

import type { Game } from '#s/game/Game'
import { useIO } from '#s/helpers/io'

export class SocketUser {
	id: string
	name: string
	to: BroadcastOperator<any, any>
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

	attemptToLeaveGame() {
		if (!this.game) {
			return true
		}
		const result = this.game.leave(this)
		// this.to.emit('lobby-left') //TODO
		return result
	}
}
