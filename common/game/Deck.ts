import type { CardData } from '#c/types/cards'
import type { PRNG } from '#c/types/external'

import { shuffle } from '#c/utils'

export class GameDeck {
	cards: CardData[]
	shop: CardData[]
	scrap: CardData[] = []

	constructor(rng: PRNG, cards: CardData[]) {
		this.cards = shuffle(rng, cards)
		this.shop = this.deal(5)
	}

	deal(amount: number): CardData[] {
		return this.cards.splice(0, amount)
	}
}
