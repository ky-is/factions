import { shallowReactive } from 'vue'

import { getPulsarsFor } from '#c/cards/default'
import type { CardData } from '#c/types/cards'
import type { PRNG } from '#c/types/external'

import { shuffle } from '#c/utils'

export class GameDeck {
	cards: CardData[]
	shop: CardData[]
	pulsars: CardData[]
	scrap: CardData[] = shallowReactive([])

	constructor(rng: PRNG, playerCount: number, cards: CardData[]) {
		this.cards = shallowReactive(shuffle(rng, cards))
		this.shop = shallowReactive(this.deal(5))
		this.pulsars = shallowReactive(getPulsarsFor(playerCount))
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
