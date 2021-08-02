import seedrandom from 'seedrandom'
import { shallowReactive } from 'vue'

import { GameDeck } from '#c/game/Deck.js'
import type { GameData, PlayerData } from '#c/types/data.js'
import type { PRNG } from '#c/types/external.js'
import { ActionActivation, PredicateConjunction } from '#c/types/cards.js'
import type { CardAction, CardData, CardFaction, ActionPredicate, ActionSegment, ActionFleetBonus, ActionMoveUnit } from '#c/types/cards.js'
import { getStartingDeck } from '#c/cards.js'
import { shuffle } from '#c/utils.js'

function checkFactions(availableFactions: CardFaction[], checkFactions: CardFaction[]) {
	for (const faction of checkFactions) {
		if (!availableFactions.includes(faction)) {
			return false
		}
	}
	return true
}

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
		predicate: null as ActionPredicate | null,
		segments: [] as ActionSegment[],
	})
	playing: {
		card: CardData | undefined
		resolvingPredicate: ActionPredicate | undefined
		resolvingSegment: ActionSegment | undefined
	}

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
		this.playing = shallowReactive({
			card: undefined,
			resolvingPredicate: undefined,
			resolvingSegment: undefined,
		})
	}

	startTurn() {
		this.turn.economy = 0
		this.turn.damage = 0
		this.turn.moveUnits = []
		this.turn.actionDiscarded = 0
		this.turn.fleetBonuses = []
		this.turn.predicate = null
		this.turn.segments = []
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

	private runSegment(segment: ActionSegment, optional: boolean) {
		if (segment.alliances) {
			this.checkUnmatchedFactionActions(segment.alliances)
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
			return false
		}
		if (segment.copy) {
			return false
		}
		if (segment.destroyStations) {
			return false
		}
		if (segment.discard) {
			return false
		}
		return true
	}

	resumePredicate() {
		const turnPredicate = this.turn.predicate
		if (!turnPredicate) {
			return
		}
		if (turnPredicate.conjunction === PredicateConjunction.OR) {
			this.playing.resolvingPredicate = turnPredicate
		} else if (turnPredicate.children) {
			turnPredicate.children.forEach(child => this.runPredicate(child))
		} else if (this.turn.segments) {
			if (turnPredicate.conditional && turnPredicate.conditional !== true) {
				//TODO
			}
			const isOptional = turnPredicate.conditional === true
			while (this.turn.segments.length) {
				const segment = this.turn.segments.shift()!
				if (!this.runSegment(segment, isOptional)) {
					break
				}
			}
		}
	}

	private runPredicate(predicate: ActionPredicate) {
		this.turn.predicate = predicate
		if (predicate.segments) {
			this.turn.segments = [...predicate.segments]
		}
		this.resumePredicate()
	}

	private activate(action: CardAction) {
		action.played = true
		this.runPredicate(action.predicate)
	}

	private checkUnmatchedFactionActions(newFactions: CardFaction[]) {
		for (const oldCard of this.played) {
			for (const oldAction of oldCard.actions) {
				if (!oldAction.played && oldAction.factions && checkFactions(newFactions, oldAction.factions)) {
					this.activate(oldAction)
				}
			}
		}
	}

	play(index: number) {
		const card = this.hand[index]
		if (!card) {
			return console.log('Card unavailable', this.hand, index)
		}
		const playedFactions = this.played.flatMap(card => card.factions)
		this.checkUnmatchedFactionActions(card.factions)
		for (const action of card.actions) {
			action.played = false
			if (action.activation === ActionActivation.ON_SCRAP) {
				continue
			}
			if (action.factions && !checkFactions(playedFactions, action.factions)) {
				continue
			}
			this.activate(action)
		}
		this.hand.splice(index, 1)
		this.played.push(card)
	}
}

export interface GameStatus {
	turnIndex: number
}

export class PlayGame {
	rng: PRNG
	data: GameData
	deck: GameDeck
	players: PlayPlayer[]
	status: GameStatus

	constructor(gameData: GameData, cards: CardData[]) {
		this.rng = seedrandom(gameData.id)
		this.data = gameData
		this.deck = new GameDeck(this.rng, gameData.players.length, cards)
		this.players = gameData.players.map((playerData, index) => new PlayPlayer(this.rng, index, playerData, gameData.players.length))
		this.status = {
			turnIndex: 0,
		}
	}
}
