import type { GameData } from '#c/types/data.js'
import { PlayGame } from '#c/game/Play.js'
import { isGameFull } from '#c/game.js'

import { emit } from '#s/helpers/io.js'
import type { EmitTarget } from '#s/helpers/io.js'
import type { SocketUser } from '#s/sockets/SocketUser.js'

let gameNumber = 0

const games: Game[] = [] //eslint-disable-line no-use-before-define

export function getGame(id: string) {
	return games.find(game => game.id === id)
}

export function getAvailableGame() {
	return games.find(game => game.autostart && !game.play && !isGameFull(game))
}

export function emitLobbyGames(target?: EmitTarget) {
	emit(target ?? 'lobby', 'lobby-games', games.map(game => game.lobbyData()))
}

export class Game {
	id: string
	title: string
	size: number
	host: string
	type: string
	mode?: string
	autostart: boolean
	players: SocketUser[] = []
	play?: PlayGame
	finished = false

	constructor(type: string, size: number, host: SocketUser, autostart: boolean) {
		gameNumber += 1
		this.id = `g-${gameNumber}` //TODO uuid
		this.title = `${type} / ${host.name}`
		this.size = size
		this.host = host.id
		this.type = type
		this.autostart = autostart
		this.join(host)
		games.push(this)
		emitLobbyGames()
	}

	emitLobbyStatus(target?: EmitTarget) {
		emit(target ?? this.id, 'lobby-status', this.lobbyData())
	}

	join(user: SocketUser) {
		if (this.players.includes(user)) {
			return console.log('ERR: already joined', user.id, this.id)
		}
		console.log('join game', user.name, this.id)
		this.players.push(user)
		user.game = this
		user.join(this.id)
		if (this.autostart && isGameFull(this)) {
			this.start()
		} else {
			this.emitLobbyStatus()
		}
	}

	leave(user: SocketUser) {
		if (this.play) {
			//TODO
		} else {
			user.game = null
			this.players = this.players.filter(player => player !== user)
			user.leave(this.id)
			this.emitLobbyStatus()

			if (!this.players.length) {
				console.log('destroy game', this.id)
				games.splice(games.indexOf(this), 1)
			} else {
				console.log('leave game', user.name, this.id)
			}
			emitLobbyGames()
		}
	}

	start() {
		this.play = new PlayGame(this.lobbyData(), []) //TODO
		this.emitLobbyStatus()
	}

	lobbyData(): GameData {
		return {
			id: this.id,
			title: this.title,
			type: this.type,
			size: this.size,
			host: this.host,
			started: !!this.play,
			finished: this.finished,
			players: this.players.map(player => ({ id: player.id, name: player.name, connected: !!player.sockets.size })),
		}
	}
}
