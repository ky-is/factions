import type { Socket, BroadcastOperator } from 'socket.io'

import type { UserData } from '#c/types.js'
import type { Game } from '#s/game/Game.js'
import { useSocket } from '#s/helpers/socket.js'

export class SocketUser {
	id: string
	name: string
	to: BroadcastOperator<any>
	game: Game | null = null
	sockets = new Set<Socket>()

	constructor(userData: UserData) {
		this.id = userData.id
		this.name = userData.name
		this.to = useSocket().to(this.id)
	}

	join(room: string) {
		this.sockets.forEach(socket => {
			socket.join(room)
		})
	}
}
