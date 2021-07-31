<template>
	<div class="game-container  flex">
		<div class="flex">
			<CardVue v-for="(card, index) in shopCards" :key="index" :card="card" :availableGold="turnPlayer.turn.economy" @click="onPurchase(index)" />
		</div>
		<div class="flex flex-col">
			<CardVue :card="pulsars[0]" class="card-small" :availableGold="turnPlayer.turn.economy" @click="onPurchase(null)" />
			<div class="card-stack card-small card-horizontal">
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
import CardVue from '#p/views/components/Game/Card/Card.vue'

import { defineProps, reactive } from 'vue'

import type { GameDeck } from '#c/game/Deck'
import type { PlayPlayer } from '#c/game/Play'
import { getPulsarsFor } from '#c/cards'

const props = defineProps<{
	deck: GameDeck
	turnPlayer: PlayPlayer
}>()

const pulsars = reactive(getPulsarsFor(2))

const deckCards = reactive(props.deck.cards)
const shopCards = reactive(props.deck.shop)
const scrappedCards = reactive(props.deck.scrap)

function onPurchase(index: number | null) {
	const card = index === null ? pulsars[0] : shopCards[index]
	if (!card || !props.turnPlayer.buy(card)) {
		return
	}
	if (index === null) {
		pulsars.shift()
	} else {
		shopCards[index] = props.deck.deal(1)[0]
	}
}
</script>
