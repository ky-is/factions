import { shallowRef } from 'vue'

import type { PlayPlayer } from '#c/game/Player'
import { ActionActivation, ActionPredicate, CardFaction, PredicateConjunction } from '#c/types/cards.js'
import type { ActionResolution, ActionSegment, CardAction } from '#c/types/cards.js'
import { containsAtLeastOne } from '#c/utils.js'

import { emitGame } from '#p/helpers/bridge.js'

export class ResolveCard {
	player: PlayPlayer
	actions: CardAction[] = []
	predicates: ActionPredicate[] = []
	resolutions: ActionResolution[] = []
	predicate = shallowRef<ActionPredicate | null>(null)
	handIndex = shallowRef<number | null>(null)
	playAllIndex = -1

	constructor(player: PlayPlayer) {
		this.player = player
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

	private resolveUnmatchedFactionActions(newFactions: CardFaction[]) {
		const availableActions = this.player.turn.availableActions
		for (let index = availableActions.length - 1; index >= 0; index -= 1) {
			const action = availableActions[index]
			if (action.factions && containsAtLeastOne(newFactions, action.factions.concat(this.player.turn.alliances))) {
				if (!this.resolvePredicate(action.predicate)) {
					return
				}
			}
		}
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
				//TODO
			}
			if (!predicate.pendingSegments?.length) {
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

	resolveOr(index: number) {
		const predicate = this.predicate.value
		const childPredicate = predicate?.children?.[index]
		if (!childPredicate) {
			return console.error('Invalid child', predicate, index)
		}
		this.resolutions.push({
			or: index
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
		await emitGame('play', this.handIndex.value!, this.resolutions)
		if (this.playAllIndex > 0) {
			this.playAllIndex -= 1
			return this.resolveCardAt(this.playAllIndex)
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
		const playedFactions = this.player.played.flatMap(card => card.factions)
		while (this.actions.length) {
			const action = this.actions.shift()!
			if (action.activation === ActionActivation.ON_SCRAP || (action.factions && !containsAtLeastOne(playedFactions, action.factions))) {
			} else if (!this.resolvePredicate(action.predicate)) {
				return false
			}
		}
		return true
	}

	resolveCardAt(index: number) {
		this.handIndex.value = index
		this.resolutions = []
		const card = this.player.hand[index]
		if (!card) {
			console.log('Card unavailable', this.player.hand, index)
			return true
		}
		this.actions.push(...card.actions)
		this.continueResolving()
	}
}
