import { shallowRef } from 'vue'

import type { PlayPlayer } from '#c/game/Player'
import { ActionActivation, PredicateConjunction } from '#c/types/cards.js'
import type { ActionPredicate, ActionResolution, ActionSegment, CardAction, CardFaction } from '#c/types/cards.js'
import { containsAtLeastOne, nonEmpty } from '#c/utils.js'

import { emitGame } from '#p/helpers/bridge.js'

export class ResolveCard {
	actions: CardAction[] = []
	predicates: ActionPredicate[] = []
	resolutions: ActionResolution[] = []
	predicate = shallowRef<ActionPredicate | null>(null)
	activeCardIndex = shallowRef<number | null>(null)
	actionIndex: number | null = null
	playAllIndex = -1

	private reset() {
		this.resolutions = []
		this.predicate.value = null
		this.activeCardIndex.value = null
		this.actionIndex = null
	}

	private resolveSegment(segment: ActionSegment) {
		if (segment.acquire) {
			console.log(segment)
			return false
		}
		if (segment.copy) {
			console.log(segment)
			return false
		}
		if (segment.destroyStations) {
			console.log(segment)
			return false
		}
		if (segment.discard) {
			console.log(segment)
			return false
		}
		return true
	}

	resolveFactionActions(player: PlayPlayer) {
		const availableCardActions = player.turn.availableCardActions
		if (!availableCardActions.length) {
			return false
		}
		const playedFactions = [...player.turn.alliances, ...player.played.flatMap(card => card.factions)]
		const scores: {[faction: string]: number} = {}
		playedFactions.forEach(faction => {
			if (!scores[faction]) {
				scores[faction] = 1
			} else {
				scores[faction] += 1
			}
		})
		for (let index = availableCardActions.length - 1; index >= 0; index -= 1) {
			const [card, action] = availableCardActions[index]
			if (!nonEmpty(action.factions)) {
				continue
			}
			const otherPlayedFactions = Object.keys(scores).filter(faction => {
				let score = scores[faction]
				if (card.factions.includes(faction as CardFaction)) {
					score -= 1
				}
				return score > 0
			})
			if (containsAtLeastOne(otherPlayedFactions, action.factions)) {
				const playedCardIndex = player.played.indexOf(card)
				if (playedCardIndex === -1) {
					console.log('Invalid action played index', player.played, card)
				} else if (this.resolvePendingAction(player, playedCardIndex, action)) {
					return true
				}
			}
		}
		return false
	}

	startResolvingAll(player: PlayPlayer) {
		this.playAllIndex = player.hand.length - 1
		this.resolveCardAt(player, this.playAllIndex)
	}

	private resolvePredicate(predicate: ActionPredicate) {
		this.predicate.value = predicate
		if (predicate.conjunction === PredicateConjunction.OR) {
			return false
		} else if (predicate.children) {
			this.predicates.unshift(...predicate.children)
			this.continueResolvingPredicates()
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
					console.log('Unresolved segment', segment)
					return false
				}
				predicate.pendingSegments.shift()
			}
		}
		this.predicate.value = null
		return true
	}

	resolveOr(player: PlayPlayer, index: number) {
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
	}

	resumeResolving(player: PlayPlayer) {
		if (!this.resolveFactionActions(player)) {
			if (this.playAllIndex > 0) {
				this.playAllIndex -= 1
				return this.resolveCardAt(player, this.playAllIndex)
			}
		}
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

	resolvePendingAction(player: PlayPlayer, playedCardIndex: number, action: CardAction) {
		this.activeCardIndex.value = playedCardIndex
		const availableCardActions = player.turn.availableCardActions
		const actionCard = player.played[playedCardIndex]
		const actionIndex = availableCardActions.findIndex(([checkCard, checkAction]) => actionCard === checkCard && action == checkAction)
		if (actionIndex === -1) {
			console.log('Invalid available action to resolve')
			return false
		}
		this.actionIndex = actionIndex
		this.actions.push(action)
		this.continueResolving()
		return true
	}

	resolveCardAt(player: PlayPlayer, index: number) {
		this.activeCardIndex.value = index
		this.resolutions = []
		const card = player.hand[index]
		if (card == null) {
			console.log('Card unavailable', player.hand, index)
			return true
		}
		this.actions.push(...card.actions)
		this.continueResolving()
	}
}
