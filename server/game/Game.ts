import { TESTING } from '#c/utils'

import type { GameData } from '#c/types/data'
import type { SocketError } from '#c/types/socket'
import { PlayGame } from '#c/game/Game'
import { isGameFull } from '#c/game/utils'

import { emit } from '#s/helpers/io'
import type { EmitTarget } from '#s/helpers/io'
import type { SocketUser } from '#s/sockets/SocketUser'
import { loadCards } from '#c/cards/parse'

let gameNumber = 0

const games: Game[] = [] //eslint-disable-line no-use-before-define

export function getGame(id: string) {
	return games.find(game => game.id === id)
}

export function getAvailableGame() {
	return games.find(game => game.autostart && !game.play && !isGameFull(game))
}

export function emitLobbyGames(target?: EmitTarget) {
	emit(target ?? 'lobby', 'lobby-games', games.map(game => game.lobbyData(false)))
}

export class Game {
	id: string
	title: string
	size: number
	host: string
	type: string
	mode?: string
	cardsText?: string
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

	emit(event: string, target: EmitTarget | undefined, ...data: any[]) {
		emit(target ?? this.id, event, ...data)
	}
	emitLobbyStatus(withCards: boolean, target?: EmitTarget) {
		this.emit('lobby-status', target, this.lobbyData(withCards))
	}

	recordPlay(callback: (error?: SocketError) => void, event: string, ...data: any[]) {
		this.play?.moves.push([event, data])
		this.emit(`factions-${event}`, undefined, ...data)
		callback()
	}

	hasPlayer(user: SocketUser) {
		return this.players.some(player => player.id === user.id)
	}

	join(user: SocketUser) {
		if (!this.hasPlayer(user)) {
			this.players.push(user)
		}
		user.game = this
		user.join(this.id)
		if (!this.autostart || this.cardsText == null || !isGameFull(this) || !this.start()) {
			this.emitLobbyStatus(false)
		}
	}

	destroy() {
		console.log('destroy game', this.id)
		games.splice(games.indexOf(this), 1)
		emitLobbyGames()
	}
	leave(user: SocketUser) {
		let destroying = false
		if (this.play) {
			if (!this.players.some(player => player.id !== user.id && player.sockets.size)) {
				//TODO make the last player the winner after a set amount of time
				destroying = true
			} else {
				return false
			}
		}
		user.leave(this.id)
		user.game = null
		if (!destroying) {
			this.players = this.players.filter(player => player.id !== user.id)
			destroying = !this.players.length
		}
		if (destroying) {
			this.destroy()
			emitLobbyGames()
		} else {
			this.emitLobbyStatus(false)
		}
		return true
	}

	start() {
		if (this.cardsText == null) {
			return false
		}
		this.play = new PlayGame(this.lobbyData(true), loadCards(this.cardsText))
		this.emitLobbyStatus(true)
		return true
	}

	lobbyData(withCards: boolean): GameData {
		return {
			id: this.id,
			title: this.title,
			type: this.type,
			size: this.size,
			host: this.host,
			hasCards: this.cardsText != null,
			cards: withCards ? this.cardsText : undefined,
			players: this.players.map(player => ({ id: player.id, name: player.name, connected: !!player.sockets.size })),
			started: !!this.play,
			finished: this.finished,
		}
	}
}
