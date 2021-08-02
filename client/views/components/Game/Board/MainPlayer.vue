<template>
	<div class="flex">
		<div class="flex flex-col">
			<div class="flex">
				<PlayerStats :player="player" :isTurn="isTurn" />
				<CardVue v-for="(card, index) in player.played" :key="index" :card="card" class="card-small" />
			</div>
			<div class="flex">
				<CardVue v-for="(card, index) in player.hand" :key="index" :card="card" :index="index" :player="player" :isTurn="isTurn" />
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

import { defineProps } from 'vue'

import type { PlayPlayer } from '#c/game/Play'

const props = defineProps<{
	player: PlayPlayer
	isTurn: boolean
}>()

function onPlayAll() {
	for (let index = props.player.hand.length - 1; index >= 0; index -= 1) {
		props.player.play(index)
	}
}

function onEndTurn() {
	console.log('End turn')
}
</script>
