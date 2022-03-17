import { shallowRef } from 'vue'

import type { PlayPlayer } from '#c/game/Player'
import { ActionActivation, PredicateConjunction } from '#c/types/cards.js'
import type { ActionPredicate, ActionResolution, ActionSegment, CardAction, CardFaction } from '#c/types/cards.js'
import { containsAtLeastOne, nonEmpty } from '#c/utils.js'

import { emitGame } from '#p/helpers/bridge.js'

export class ResolveCard {
	player: PlayPlayer
	actions: CardAction[] = []
	predicates: ActionPredicate[] = []
	resolutions: ActionResolution[] = []
	predicate = shallowRef<ActionPredicate | null>(null)
	activeCardIndex = shallowRef<number | null>(null)
	actionIndex: number | null = null
	playAllIndex = -1

	constructor(player: PlayPlayer) {
		this.player = player
	}

	private reset() {
		this.resolutions = []
		this.predicate.value = null
		this.activeCardIndex.value = null
		this.actionIndex = null
	}

	private resolveSegment(segment: ActionSegment) {
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

	private getPlayedFactionCounts() {
		const playedFactions = [...this.player.turn.alliances, ...this.player.played.flatMap(card => card.factions)]
		const playedFactionCounts: {[faction: string]: number} = {}
		playedFactions.forEach(faction => {
			if (!playedFactionCounts[faction]) {
				playedFactionCounts[faction] = 1
			} else {
				playedFactionCounts[faction] += 1
			}
		})
		return playedFactionCounts
	}

	private resolvePendingActions() {
		const availableCardActions = this.player.turn.availableCardActions
		if (!availableCardActions.length) {
			return false
		}
		const playedFactionCounts = this.getPlayedFactionCounts()
		for (let index = availableCardActions.length - 1; index >= 0; index -= 1) {
			const [card, action] = availableCardActions[index]
			const playedCardIndex = this.player.played.indexOf(card)
			if (nonEmpty(action.factions)) {
				const otherPlayedFactions = Object.keys(playedFactionCounts).filter(faction => {
					let factionCount = playedFactionCounts[faction]
					if (card.factions.includes(faction as CardFaction)) {
						factionCount -= 1
					}
					return factionCount > 0
				})
				if (containsAtLeastOne(otherPlayedFactions, action.factions)) {
					if (playedCardIndex === -1) {
						console.log('Invalid action played index', this.player.played, card)
					} else if (this.resolvePendingAction(playedCardIndex, action)) {
						return true
					}
				}
			} else if (action.activation !== ActionActivation.ON_SCRAP) {
				if (this.resolvePendingAction(playedCardIndex, action)) {
					return true
				}
			}
		}
		return false
	}

	startResolvingAll() {
		this.playAllIndex = this.player.hand.length - 1
		this.resolveCardAt(this.playAllIndex)
	}

	private resolvePredicate(predicate: ActionPredicate) {
		this.predicate.value = predicate
		if (predicate.conjunction === PredicateConjunction.OR) {
			return false
		} else if (predicate.children) {
			this.predicates.unshift(...predicate.children)
			this.predicate.value = null
			return this.continueResolvingPredicates()
		} else if (predicate.segments) {
			const conditional = predicate?.conditional
			const isOptional = conditional === true
			if (!isOptional && conditional) {
				//TODO check if condition is met
			}
			if (!nonEmpty(predicate.pendingSegments)) {
				predicate.pendingSegments = [...predicate.segments]
			}
			while (predicate.pendingSegments.length) {
				const segment = predicate.pendingSegments[0]
				if (!this.resolveSegment(segment)) {
					return false
				}
				predicate.pendingSegments.shift()
			}
		}
		this.predicate.value = null
		return true
	}

	resolveOr(index: number) {
		const predicate = this.predicate.value
		const childPredicate = predicate?.children?.[index]
		if (!childPredicate) {
			return console.error('Invalid child', predicate, index)
		}
		this.resolutions.push({
			or: index,
		})
		if (this.resolvePredicate(childPredicate)) {
			this.continueResolving()
		}
	}

	private async continueResolving() {
		if (!this.continueResolvingPredicates()) {
			return
		}
		if (!this.continueResolvingActions()) {
			return
		}
		// return console.log(this.resolutions) //SAMPLE
		if (this.actionIndex !== null) {
			await emitGame('action', this.activeCardIndex.value!, this.actionIndex, this.resolutions)
		} else {
			await emitGame('play', this.activeCardIndex.value!, this.resolutions)
		}
		this.reset()
		return this.continueResolvingPlayAll()
	}

	continueResolvingPlayAll() {
		if (this.playAllIndex > 0) {
			this.playAllIndex -= 1
			return this.resolveCardAt(this.playAllIndex)
		}
	}

	resumeResolving() {
		if (!this.resolvePendingActions()) {
			return false
		}
		return this.continueResolvingPlayAll()
	}

	private continueResolvingPredicates() {
		while (this.predicates.length) {
			const child = this.predicates[0]
			if (!this.resolvePredicate(child)) {
				return false
			}
			this.predicates.shift()
		}
		return true
	}
	private continueResolvingActions() {
		while (this.actions.length) {
			const action = this.actions.shift()!
			if (action.activation === ActionActivation.ON_SCRAP || nonEmpty(action.factions)) {
				continue
			}
			if (!this.resolvePredicate(action.predicate)) {
				return false
			}
		}
		return true
	}

	resolvePendingAction(playedCardIndex: number, action: CardAction) {
		this.activeCardIndex.value = playedCardIndex
		const availableCardActions = this.player.turn.availableCardActions
		const actionCard = this.player.played[playedCardIndex]
		const actionIndex = availableCardActions.findIndex(([checkCard, checkAction]) => actionCard === checkCard && action == checkAction)
		if (actionIndex === -1) {
			console.log('Invalid available action to resolve', playedCardIndex, action, availableCardActions)
			return false
		}
		this.actionIndex = actionIndex
		this.actions.push(action)
		this.continueResolving()
		return true
	}

	resolveCardAt(index: number) {
		this.activeCardIndex.value = index
		this.resolutions = []
		const card = this.player.hand[index]
		if (card == null) {
			console.log('Card unavailable', this.player.hand, index)
			return true
		}
		this.actions.push(...card.actions)
		this.continueResolving()
	}
}
