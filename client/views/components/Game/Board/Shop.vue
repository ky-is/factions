<template>
	<div class="game-container  flex">
		<div class="flex">
			<CardVue v-for="(card, index) in shopCards" :key="index" :card="card" />
		</div>
		<div class="flex flex-col">
			<CardVue :card="pulsars[0]" class="card-small" />
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

import type { GameDeck } from '#c/game/Deck'
import { getPulsarsFor } from '#c/cards'

import CardVue from '#p/views/components/Game/Card/Card.vue'

const props = defineProps<{
	deck: GameDeck
}>()

const pulsars = reactive(getPulsarsFor(2))

const deckCards = reactive(props.deck.cards)
const shopCards = reactive(props.deck.shop)
const scrappedCards = reactive(props.deck.scrap)
</script>
