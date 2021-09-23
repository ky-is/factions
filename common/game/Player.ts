import { shallowReactive } from 'vue'

import type { PlayerData } from '#c/types/data.js'
import type { PRNG } from '#c/types/external.js'
import { ActionActivation, PredicateConjunction } from '#c/types/cards.js'
import type { CardAction, CardData, CardFaction, ActionResolution, ActionPredicate, ActionSegment, ActionFleetBonus, ActionMoveUnit } from '#c/types/cards.js'
import { getStartingDeck } from '#c/cards/default.js'
import { shuffle, TESTING } from '#c/utils.js'

export class PlayPlayer {
	rng: PRNG
	index: number
	id: string
	name: string
	deck: CardData[]
	hand: CardData[] = shallowReactive([])
	played: CardData[] = shallowReactive([])
	discard: CardData[] = shallowReactive([])
	stats: {
		health: number
	}
	turn = shallowReactive({
		economy: 0,
		damage: 0,
		healing: 0,
		moveUnits: [] as ActionMoveUnit[],
		actionDiscarded: 0,
		fleetBonuses: [] as ActionFleetBonus[],
		availableCardActions: [] as [CardData, CardAction][],
		alliances: [] as CardFaction[],
	})

	constructor(rng: PRNG, index: number, { id, name }: PlayerData, numberOfPlayers: number) {
		this.rng = rng
		this.index = index
		this.id = id
		this.name = name
		this.stats = shallowReactive({
			health: 50,
		})
		this.deck = shallowReactive(getStartingDeck())
		const startAdvantage = index < numberOfPlayers - 1 ? numberOfPlayers - index : 0
		this.dealHand(5 - startAdvantage)
	}

	private removeFromPlay(playedCardIndex: number) {
		this.discard.push(this.played[playedCardIndex])
		this.played.splice(playedCardIndex, 1)
	}

	endTurn() {
		for (let index = this.played.length - 1; index >= 0; index -= 1) {
			const card = this.played[index]
			if (!card.defense) {
				this.removeFromPlay(index)
			}
		}
		this.dealHand()
		this.turn.economy = 0
		this.turn.damage = 0
		this.turn.moveUnits = []
		this.turn.actionDiscarded = 0
		this.turn.fleetBonuses = []
		this.turn.availableCardActions = []
		this.turn.alliances = []
	}

	buy(card: CardData) {
		const cost = card.cost ?? 0
		if (this.turn.economy < cost) {
			console.log('Insufficient funds', this.turn.economy, cost)
			if (!TESTING) {
				return false
			}
		}
		this.turn.economy -= cost ?? 0
		//TODO straight to play option
		this.discard.push(card)
		return true
	}

	attack(target: PlayPlayer, playedCardIndex: number | undefined, damage: number) {
		if (damage > this.turn.damage) {
			console.log('Too much damage', this.turn.damage, damage, 'for', playedCardIndex)
			if (!TESTING) {
				return false
			}
		}
		if (playedCardIndex !== undefined) {
			const card = target.played[playedCardIndex]
			if (!card?.defense) {
				console.log('Invalid card target', card, target.played, playedCardIndex)
				return false
			}
			if (card.defense > damage) {
				console.log('Insufficient damage', card.defense)
				return false
			}
			target.removeFromPlay(playedCardIndex)
		} else {
			target.stats.health -= damage
		}
		this.turn.damage -= damage
		return true
	}

	private dealHand(size?: number) {
		shuffle(this.rng, this.deck)
		const requestedNumberOfCards = size ?? 5
		const remainingCurrentCount = this.deck.length
		const dealFromRemainingDeckCount = Math.min(requestedNumberOfCards, remainingCurrentCount)
		if (dealFromRemainingDeckCount > 0) {
			this.hand.push(...this.deck.splice(0, dealFromRemainingDeckCount))
		}
		const requestedSecondDealCount = requestedNumberOfCards - dealFromRemainingDeckCount
		if (requestedSecondDealCount > 0) {
			if (this.discard.length) {
				this.deck.push(...this.discard.splice(0))
				this.dealHand(requestedSecondDealCount)
			} else {
				console.log('No discarded cards remaming to deal')
			}
		}
	}

	private runSegment(segment: ActionSegment, resolutions: ActionResolution[]) {
		if (segment.alliances) {
			this.turn.alliances.push(...segment.alliances)
		}
		if (segment.resources) {
			const multiplier = 1
			if (segment.multiplier) {
				//TODO
			}
			if (segment.resources.damage) {
				this.turn.damage += segment.resources.damage * multiplier
			}
			if (segment.resources.economy) {
				this.turn.economy += segment.resources.economy * multiplier
			}
			if (segment.resources.healing) {
				const health = segment.resources.healing * multiplier
				this.turn.healing += health
				this.stats.health += health
			}
			if (segment.resources.draw) {
				this.dealHand(segment.resources.draw)
			}
		}
		if (segment.fleetBonus) {
			this.turn.fleetBonuses.push(segment.fleetBonus)
		}
		if (segment.moveUnit) {
			this.turn.moveUnits.push(segment.moveUnit)
		}
		if (segment.acquire) {
			const resolution = resolutions.shift()
			console.log(resolution)
		}
		if (segment.copy) {
			const resolution = resolutions.shift()
			console.log(resolution)
		}
		if (segment.destroyStations) {
			const resolution = resolutions.shift()
			console.log(resolution)
		}
		if (segment.discard) {
			const resolution = resolutions.shift()
			console.log(resolution)
		}
		return true
	}

	private runPredicate(predicate: ActionPredicate, resolutions: ActionResolution[]) {
		// let skipLast = false
		if (predicate.conditional != null && predicate.conditional !== true) {
			//TODO skipLast
		}
		if (predicate.children) {
			if (predicate.conjunction === PredicateConjunction.OR) {
				const resolution = resolutions.shift()
				const index = resolution?.or
				if (index === undefined) {
					return console.log('Invalid resolution', predicate, resolution, resolutions)
				}
				this.runPredicate(predicate.children[index], resolutions)
			} else {
				predicate.children.forEach(child => this.runPredicate(child, resolutions))
			}
		} else if (predicate.segments) {
			predicate.segments.forEach(segment => this.runSegment(segment, resolutions))
		}
	}

	playPendingAction(playedCardIndex: number, cardActionIndex: number, resolutions: ActionResolution[] | undefined) {
		const cardAction = this.turn.availableCardActions[cardActionIndex]
		if (cardAction == null) {
			return console.log('Action unavailable', this.turn.availableCardActions, cardActionIndex)
		}
		const [card, action] = cardAction
		this.runPredicate(action.predicate, resolutions ? [...resolutions] : []) //TODO verify shallow copy
		if (action.activation === ActionActivation.ON_SCRAP) {
			this.played.splice(playedCardIndex, 1) //TODO add to scrap pile
		}
		this.turn.availableCardActions.splice(cardActionIndex, 1)
	}

	playCardAt(index: number, resolutions: ActionResolution[] | undefined) {
		const card = this.hand[index]
		if (card == null) {
			return console.log('Card unavailable', this.hand, index)
		}
		for (const action of card.actions) {
			if (action.factions && action.factions.length || action.activation === ActionActivation.ON_SCRAP) {
				this.turn.availableCardActions.push([card, action])
			} else {
				this.runPredicate(action.predicate, resolutions ? [...resolutions] : [])
			}
		}
		this.hand.splice(index, 1)
		this.played.push(card)
	}
}
