import seedrandom from 'seedrandom'

import { GameDeck } from '#c/game/Deck.js'
import { PlayPlayer } from '#c/game/Player.js'

import type { CardData } from '#c/types/cards.js'
import type { GameData } from '#c/types/data.js'
import type { PRNG } from '#c/types/external.js'

export class PlayGame {
	rng: PRNG
	data: GameData
	deck: GameDeck
	players: PlayPlayer[]
	turnIndex = 0
	moves: [string, any[]][] = []

	constructor(gameData: GameData, cards: CardData[]) {
		this.rng = seedrandom(gameData.id)
		this.data = gameData
		this.deck = new GameDeck(this.rng, gameData.players.length, cards)
		this.players = gameData.players.map((playerData, index) => new PlayPlayer(this.rng, index, playerData, gameData.players.length))
	}

	currentPlayer() {
		return this.players[this.turnIndex % this.players.length]
	}

	acquireFromShopAt(shopIndex: number | null) {
		const card = shopIndex === null ? this.deck.pulsars[0] : this.deck.shop[shopIndex]
		if (!card) {
			console.log('Invalid card buy', shopIndex, shopIndex === null ? this.deck.pulsars : this.deck.shop)
			return false
		}
		const player = this.currentPlayer()
		if (!player.buy(card)) {
			console.log('Unable to purchase', player, shopIndex, card)
			return false
		}
		this.deck.sold(shopIndex)
		return true
	}
}
