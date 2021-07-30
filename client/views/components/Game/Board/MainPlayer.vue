<template>
	<div class="game-container  flex">
		<div class="flex">
			<CardVue v-for="(card, index) in handCards" :key="index" :card="card" />
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
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineProps, reactive } from 'vue'

import { } from '#c/cards'

import CardVue from '#p/views/components/Game/Card/Card.vue'
import type { PlayPlayer } from '#c/game/Play.js'

const props = defineProps<{
	player: PlayPlayer
}>()

const deckCards = reactive(props.player.cards)
const handCards = reactive(props.player.hand)
const discardCards = reactive(props.player.discard)
</script>
