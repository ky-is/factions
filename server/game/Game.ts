import type { Socket } from 'socket.io'

import type { GameData } from '#c/types.js'

import { useSocket } from '#s/helpers/socket.js'
import type { SocketUser } from '#s/sockets/SocketUser.js'

let gameNumber = 0

export class Game {
	id: string
	size: number
	host: string
	type: string
	mode?: string
	players: SocketUser[] = []
	started = false
	finished = false

	constructor(type: string, size: number, host: SocketUser) {
		gameNumber += 1
		this.id = `g-${gameNumber}` //TODO uuid
		this.size = size
		this.host = host.id
		this.type = type
		console.log('Create game', this.id)
		this.join(host)
	}

	join(user: SocketUser) {
		if (this.players.includes(user)) {
			return console.log('ERR: already joined', user.id, this.id)
		}
		console.log('join game', user.name, this.id)
		this.players.push(user)
		user.game = this
		user.join(this.id)
		useSocket().to(this.id).emit('lobby-joined', this.lobbyData())
	}

	emitJoin(socket: Socket) {
		socket.emit('lobby-joined', this.lobbyData())
	}

	lobbyData(): GameData {
		return {
			id: this.id,
			size: this.size,
			host: this.host,
			started: this.started,
			finished: this.finished,
			players: this.players.map(player => ({ id: player.id, name: player.name })),
		}
	}
}
