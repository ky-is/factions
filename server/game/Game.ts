import type { Socket } from 'socket.io'

import type { GameData } from '#c/types.js'

import { useSocket } from '#s/helpers/socket.js'
import type { SocketUser } from '#s/sockets/SocketUser.js'

let gameNumber = 0

const games: Game[] = [] //eslint-disable-line no-use-before-define

export function getGamesData() {
	return games.map(game => game.lobbyData())
}

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
		games.push(this)
	}

	join(user: SocketUser) {
		if (this.players.includes(user)) {
			return console.log('ERR: already joined', user.id, this.id)
		}
		console.log('join game', user.name, this.id)
		this.players.push(user)
		user.game = this
		user.join(this.id)
		useSocket().to(this.id).emit('lobby-status', this.lobbyData())
	}

	updateLobby() {
		useSocket().to('lobby').emit('lobby-games', getGamesData())
	}

	leave(user: SocketUser) {
		if (this.started) {
			//TODO
		} else {
			user.game = null
			this.players = this.players.filter(player => player !== user)
			user.leave(this.id)
			useSocket().to(this.id).emit('lobby-status', this.lobbyData())
			this.updateLobby()

			if (!this.players.length) {
				games.filter(game => game === this)
			}
		}
	}

	emitJoin(socket: Socket) {
		socket.emit('lobby-status', this.lobbyData())
	}

	lobbyData(): GameData {
		return {
			id: this.id,
			type: this.type,
			size: this.size,
			host: this.host,
			started: this.started,
			finished: this.finished,
			players: this.players.map(player => ({ id: player.id, name: player.name, connected: !!player.sockets.size })),
		}
	}
}
