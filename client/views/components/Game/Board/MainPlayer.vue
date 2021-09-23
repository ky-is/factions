<template>
	<div class="flex">
		<ResolveBoardVue v-if="resolvingPredicate" :resolving="resolvingPredicate" :resolver="resolver" />
		<div class="flex flex-col">
			<div class="flex">
				<PlayerStats :player="player" :isTurn="isTurn" />
				<CardVue v-for="(card, index) in player.played" :key="index" :card="card" :index="index" :player="player" :resolver="resolver" :isTurn="isTurn" played class="card-small" />
			</div>
			<div class="flex">
				<CardVue v-for="(card, index) in player.hand" :key="index" :card="card" :index="index" :player="player" :resolver="resolver" :isTurn="isTurn" />
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
import PlayerStats from '#p/views/components/Game/Board/PlayerStats.vue'
import ResolveBoardVue from '#p/views/components/Game/Board/ResolveBoard.vue'
import CardVue from '#p/views/components/Game/Card/Card.vue'

import { computed, defineProps } from 'vue'

import type { PlayPlayer } from '#c/game/Player.js'

import { emitGame } from '#p/helpers/bridge.js'
import type { ResolveCard } from '#p/helpers/ResolveCard.js'

const props = defineProps<{
	player: PlayPlayer
	resolver: ResolveCard
	isTurn: boolean
}>()

const resolvingPredicate = computed(() => props.resolver.predicate.value)

function onPlayAll() {
	props.resolver.startResolvingAll()
}

function onEndTurn() {
	//TODO confirm unused gold/damage
	emitGame('end')
}
</script>
