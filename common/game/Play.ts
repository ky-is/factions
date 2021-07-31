import { GameDeck } from '#c/game/Deck'
import type { GameData, PlayerData } from '#c/types/data'
import { ActionActivation, PredicateConjunction } from '#c/types/cards'
import type { CardAction, CardData, CardFaction, ActionPredicate, ActionSegment, ActionFleetBonus, ActionMoveUnit } from '#c/types/cards'
import { getStartingDeck } from '#c/cards'
import { shuffle } from '#c/utils'

function checkFactions(availableFactions: CardFaction[], checkFactions: CardFaction[]) {
	for (const faction of checkFactions) {
		if (!availableFactions.includes(faction)) {
			return false
		}
	}
	return true
}

export class PlayPlayer {
	index: number
	id: string
	name: string
	deck: CardData[]
	hand: CardData[] = []
	played: CardData[] = []
	discard: CardData[] = []
	health: number
	turn = {
		economy: 0,
		damage: 0,
		moveUnits: [] as ActionMoveUnit[],
		actionDiscarded: 0,
		fleetBonuses: [] as ActionFleetBonus[],
		predicate: null as ActionPredicate | null,
		segments: [] as ActionSegment[],
	}
	playingCard?: CardData
	resolvingPredicate?: ActionPredicate
	resolvingSegment?: ActionSegment

	constructor(index: number, { id, name }: PlayerData, numberOfPlayers: number) {
		this.index = index
		this.id = id
		this.name = name
		this.health = 50
		this.deck = getStartingDeck()
		const startAdvantage = index < numberOfPlayers - 1 ? numberOfPlayers - index : 0
		this.dealHand(5 - startAdvantage)
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

	endTurn() {
		this.dealHand()
	}

	dealHand(size?: number) {
		shuffle(this.deck)
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
				this.health += segment.resources.healing * multiplier
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
			this.resolvingPredicate = turnPredicate
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

	play(card: CardData) {
		const index = this.hand.findIndex(handCard => handCard.name === card.name)
		if (index === -1) {
			return
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

export class PlayGame {
	data: GameData
	deck: GameDeck
	players: PlayPlayer[]

	constructor(gameData: GameData, cards: CardData[]) {
		this.data = gameData
		this.deck = new GameDeck(cards)
		this.players = gameData.players.map((playerData, index) => new PlayPlayer(index, playerData, gameData.players.length))
	}
}
