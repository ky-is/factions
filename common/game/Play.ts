import seedrandom from 'seedrandom'
import { shallowReactive } from 'vue'

import { GameDeck } from '#c/game/Deck.js'
import type { GameData, PlayerData } from '#c/types/data.js'
import type { PRNG } from '#c/types/external.js'
import { ActionActivation, PredicateConjunction } from '#c/types/cards.js'
import type { CardAction, CardData, CardFaction, ActionResolution, ActionPredicate, ActionSegment, ActionFleetBonus, ActionMoveUnit } from '#c/types/cards.js'
import { getStartingDeck } from '#c/cards.js'
import { containsAtLeastOne, shuffle } from '#c/utils.js'

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
		availableActions: [] as CardAction[],
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

	startTurn() {
		this.turn.economy = 0
		this.turn.damage = 0
		this.turn.moveUnits = []
		this.turn.actionDiscarded = 0
		this.turn.fleetBonuses = []
		this.turn.availableActions = []
		this.turn.alliances = []
	}

	buy(card: CardData) {
		const cost = card.cost ?? 0
		if (this.turn.economy < cost) {
			return false
		}
		this.turn.economy -= cost ?? 0
		//TODO straight to play option
		this.discard.push(card)
		return true
	}

	attack(player: PlayPlayer) {
		if (this.turn.damage > 0) {
			player.stats.health -= this.turn.damage
			this.turn.damage = 0
		}
	}

	endTurn() {
		this.dealHand()
	}

	dealHand(size?: number) {
		shuffle(this.rng, this.deck)
		const amountOfCards = size ?? 5
		const remainingCurrentCount = this.deck.length
		const remainingAfterCount = amountOfCards - remainingCurrentCount
		if (remainingCurrentCount > 0) {
			this.hand.push(...this.deck.splice(0, amountOfCards))
		}
		if (remainingAfterCount > 0 && this.discard.length) {
			this.deck.push(...this.discard.splice(0))
			this.dealHand(remainingAfterCount)
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
		if (predicate.conjunction === PredicateConjunction.OR && predicate.children) {
			const resolution = resolutions.shift()
			const index = resolution?.or
			if (index === undefined) {
				return console.log('Invalid resolution', predicate, resolution, resolutions)
			}
			this.runPredicate(predicate.children[index], resolutions)
		} else if (predicate.children) {
			predicate.children.forEach(child => this.runPredicate(child, resolutions))
		} else if (predicate.segments) {
			const isOptional = predicate.conditional === true
			if (!isOptional && predicate.conditional) {
				//TODO
			}
			predicate.segments.forEach(segment => this.runSegment(segment, resolutions))
		}
	}

	private runUnmatchedFactionActions(newFactions: CardFaction[]) {
		for (let index = this.turn.availableActions.length - 1; index >= 0; index += 1) {
			const action = this.turn.availableActions[index]
			if (action.factions && containsAtLeastOne(newFactions, action.factions.concat(this.turn.alliances))) {
				this.runPredicate(action.predicate, []) //TODO
				this.turn.availableActions.splice(index, 1)
			}
		}
	}

	playCardAt(index: number, resolutions: ActionResolution[]) {
		const card = this.hand[index]
		if (!card) {
			return console.log('Card unavailable', this.hand, index)
		}
		const playedFactions = this.played.flatMap(card => card.factions)
		for (const action of card.actions) {
			if (action.activation === ActionActivation.ON_SCRAP || (action.factions && !containsAtLeastOne(playedFactions, action.factions))) {
				this.turn.availableActions.push(action)
			} else {
				this.runPredicate(action.predicate, [...resolutions])
			}
		}
		this.runUnmatchedFactionActions(card.factions)
		this.hand.splice(index, 1)
		this.played.push(card)
	}
}

export interface GameStatus {
}

export class PlayGame {
	rng: PRNG
	data: GameData
	deck: GameDeck
	players: PlayPlayer[]
	turnIndex = 0

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
