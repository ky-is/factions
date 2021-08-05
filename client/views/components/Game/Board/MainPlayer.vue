<template>
	<div class="flex">
		<div v-if="resolvingPredicate" class=" absolute inset-0  flex flex-col justify-center items-center">
			<div v-if="resolvingPredicate.children" class="text-center p-8 space-y-4 bg-white shadow-xl rounded-xl">
				Choose an option:
				<div class="space-x-4  flex">
					<template v-for="(predicate, index) in resolvingPredicate.children" :key="index">
						<button class="w-32 h-32 rounded-lg border-2" @click="onResolve(index)">
							<ActionPredicateVue :predicate="predicate" />
						</button>
					</template>
				</div>
			</div>
			<div v-else-if="resolvingPredicate.segments" class="text-center p-8 space-y-4 bg-white shadow-xl rounded-xl">
				{{ resolvingPredicate.segments[0] }}
			</div>
		</div>
		<div class="flex flex-col">
			<div class="flex">
				<PlayerStats :player="player" :isTurn="isTurn" />
				<CardVue v-for="(card, index) in player.played" :key="index" :card="card" class="card-small" />
			</div>
			<div class="flex">
				<CardVue v-for="(card, index) in player.hand" :key="index" :card="card" :index="index" :resolve="resolveCard" :isTurn="isTurn" />
			</div>
		</div>
		<div class="flex flex-col">
			<div class="card-stack card-small card-vertical">
				<div>{{ player.deck.length }}</div>
				<div>Deck</div>
			</div>
			<div class="card-stack card-small card-horizontal">
				<div>{{ player.discard.length }}</div>
				<div>Discard</div>
			</div>
			<template v-if="isTurn">
				<button v-if="player.hand.length" class="card-stack card-small card-horizontal !bg-white border-[3px] border-gray-200 text-lg font-bold" @click="onPlayAll">
					Play all
				</button>
				<button v-else class="card-stack card-small card-horizontal !bg-white border-[3px] border-gray-200 text-lg font-bold" @click="onEndTurn">
					End turn
				</button>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import CardVue from '#p/views/components/Game/Card/Card.vue'
import PlayerStats from '#p/views/components/Game/Board/PlayerStats.vue'
import ActionPredicateVue from '#p/views/components/Game/Card/ActionPredicate.vue'

import { computed, defineProps } from 'vue'

import type { PlayPlayer } from '#c/game/Player'
import { ResolveCard } from '#p/helpers/ResolveCard.js'

const props = defineProps<{
	player: PlayPlayer
	isTurn: boolean
}>()

const resolveCard = new ResolveCard(props.player)
const resolvingPredicate = computed(() => resolveCard.predicate.value)

function onPlayAll() {
	for (let index = props.player.hand.length - 1; index >= 0; index -= 1) {
		if (!resolveCard.resolveCardAt(index)) {
			break
		}
	}
}

function onEndTurn() {
	console.log('End turn')
}

function onResolve(index: number) {
	resolveCard.resolveOr(index)
}
</script>
