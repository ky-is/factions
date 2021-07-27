import type { CardData } from '#c/types/cards.js'

import { shuffle } from '#c/utils.js'

export class Deck {
	cards: CardData[]
	shop: CardData[]
	scrap: CardData[] = []

	constructor(cards: CardData[]) {
		this.cards = shuffle(cards)
		this.shop = this.deal(5)
	}

	deal(amount: number): CardData[] {
		return this.cards.splice(0, amount)
	}
}
