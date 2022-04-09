import { prng_alea as seedrandom } from 'esm-seedrandom' //TODO monitoring original repo for module support
import { shallowRef } from 'vue'

import { GameDeck } from '#c/game/Deck'
import { PlayPlayer } from '#c/game/Player'

import type { CardData } from '#c/types/cards'
import type { GameData } from '#c/types/data'
import type { PRNG } from '#c/types/external'
import { TESTING } from '#c/utils'

export class PlayGame {
	rng: PRNG
	deck: GameDeck
	players: PlayPlayer[]
	turnIndex = shallowRef(0)
	moves: [string, any[]][] = []

	constructor(gameData: GameData, cards: CardData[]) {
		this.rng = seedrandom(gameData.id)
		this.deck = new GameDeck(this.rng, gameData.players.length, cards)
		this.players = gameData.players.map((playerData, index) => new PlayPlayer(this.rng, index, playerData, gameData.players.length))
		if (TESTING) { //SAMPLE
			const cardIndex = 2
			this.players[0].hand.push(cards[cardIndex], cards[cardIndex + 1])
		}
	}

	currentPlayer() {
		return this.players[this.turnIndex.value % this.players.length]
	}

	acquireFromShopAt(player: PlayPlayer, shopIndex: number | null) {
		const card = shopIndex === null ? this.deck.pulsars[0] : this.deck.shop[shopIndex]
		if (card == null) {
			console.log('Invalid card buy', shopIndex, shopIndex === null ? this.deck.pulsars : this.deck.shop)
			return false
		}
		if (!player.buy(card)) {
			console.log('Unable to purchase', player, shopIndex, card)
			return false
		}
		this.deck.sold(shopIndex)
		return true
	}

	endTurn() {
		this.currentPlayer().endTurn()
		this.turnIndex.value += 1
	}
}
