import { ActionActivation, CardType, PredicateConjunction } from '#c/types/cards'
import type { CardData } from '#c/types/cards'

const miner: CardData = {
	name: 'Miner',
	factions: [],
	type: CardType.BASIC,
	actions: [{
		predicate: {
			segments: [{
				resources: {
					economy: 1,
				},
			}],
		},
	}],
}

// const miner: CardData = { //SAMPLE
// 	name: 'Miner',
// 	factions: [],
// 	type: CardType.BASIC,
// 	actions: [{
// 		predicate: {
// 			conjunction: PredicateConjunction.OR,
// 			children: [{
// 				segments: [{
// 					resources: {
// 						economy: 1,
// 					},
// 				}],
// 			}, {
// 				segments: [{
// 					resources: {
// 						damage: 1,
// 					},
// 				}],
// 			}],
// 		},
// 	}],
// }

const pewPew: CardData = {
	name: 'Pew-Pew',
	factions: [],
	type: CardType.BASIC,
	actions: [{
		predicate: {
			segments: [{
				resources: {
					damage: 1,
				},
			}],
		},
	}],
}

const pulsar: CardData = {
	name: 'Pulsar',
	cost: 2,
	factions: [],
	type: CardType.BASIC,
	actions: [
		{
			predicate: {
				segments: [{
					resources: {
						economy: 2,
					},
				}],
			},
		},
		{
			activation: ActionActivation.ON_SCRAP,
			predicate: {
				segments: [{
					resources: {
						damage: 2,
					},
				}],
			},
		},
	],
}

export function getPulsarsFor(playerCount: number): CardData[] {
	return Array(playerCount * 5).fill(pulsar)
}

export function getStartingDeck() {
	return [ miner, miner, miner, miner, miner, miner, miner, miner, pewPew, pewPew ]
}
