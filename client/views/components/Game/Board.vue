<template>
	<div class="game-container  flex">
		<CardVue :card="pulsars[0]" class="card-small" />
		<div class="flex">
			<CardVue v-for="(card, index) in shopCards" :key="index" :card="card" />
		</div>
		<div class="flex flex-col">
			<div class="card-stack card-small card-vertical">
				<div>{{ deckCards.length }}</div>
				<div>Deck</div>
			</div>
			<div class="card-stack card-small card-horizontal">
				<div>{{ scrappedCards.length }}</div>
				<div>Scrap</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineProps, reactive } from 'vue'

import type { CardData } from '#c/types/cards'
import { getPulsarsFor } from '#c/cards'

import CardVue from '#p/views/components/Game/Card.vue'

import { Deck } from '#c/game/Deck'

const props = defineProps<{
	cards: CardData[]
}>()

const pulsars = reactive(getPulsarsFor(2))

const deck = new Deck(props.cards)
const deckCards = reactive(deck.cards as CardData[])
const shopCards = reactive(deck.shop as CardData[])
const scrappedCards = reactive(deck.scrap as CardData[])
</script>

<style lang="postcss">
.game-container {
	@apply text-base;
}
</style>
