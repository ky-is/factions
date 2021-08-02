import { getPulsarsFor } from '#c/cards.js'
import type { CardData } from '#c/types/cards.js'
import type { PRNG } from '#c/types/external.js'

import { shuffle } from '#c/utils.js'

export class GameDeck {
	cards: CardData[]
	shop: CardData[]
	pulsars: CardData[]
	scrap: CardData[] = []

	constructor(rng: PRNG, playerCount: number, cards: CardData[]) {
		this.cards = shuffle(rng, cards)
		this.shop = this.deal(5)
		this.pulsars = getPulsarsFor(playerCount)
	}

	deal(amount: number): CardData[] {
		return this.cards.splice(0, amount)
	}

	sold(index: number | null) {
		if (index === null) {
			this.pulsars.shift()
		} else {
			this.shop[index] = this.deal(1)[0]
		}
	}
}
