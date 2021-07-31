<template>
	<div class="flex">
		<div class="flex flex-col">
			<div class="flex">
				<CardVue v-for="(card, index) in playedCards" :key="index" :card="card" class="card-small" />
			</div>
			<div class="flex">
				<CardVue v-for="(card, index) in handCards" :key="index" :card="card" :player="player" />
			</div>
		</div>
		<div class="flex flex-col">
			<div class="card-stack card-small card-vertical">
				<div>{{ deckCards.length }}</div>
				<div>Deck</div>
			</div>
			<div class="card-stack card-small card-horizontal">
				<div>{{ discardCards.length }}</div>
				<div>discard</div>
			</div>
			<button v-if="handCards.length" class="card-stack card-small card-horizontal !bg-white border-[3px] border-gray-200 text-lg font-bold" @click="onPlayAll">
				Play all
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import CardVue from '#p/views/components/Game/Card/Card.vue'
import ActionSegmentResource from '#p/views/components/Game/Card/ActionSegmentResource.vue'

import { defineProps, reactive } from 'vue'

import type { PlayPlayer } from '#c/game/Play'

const props = defineProps<{
	player: PlayPlayer
}>()

const deckCards = reactive(props.player.deck)
const handCards = reactive(props.player.hand)
const playedCards = reactive(props.player.played)
const discardCards = reactive(props.player.discard)

function onPlayAll() {
	handCards.forEach(card => props.player.play(card)) //TODO
}
</script>
