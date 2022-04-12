<template>
<div class="game-container  flex">
	<div class="flex">
		<CardVue v-for="(card, index) in deck.shop" :key="index" :card="card" :availableGold="turnPlayer.turn.economy" @click="onPurchase(index)" />
	</div>
	<div class="flex flex-col">
		<CardVue :card="deck.pulsars[0]" class="card-small" :availableGold="turnPlayer.turn.economy" @click="onPurchase(null)" />
		<div class="card-stack card-small card-horizontal">
			<div>{{ deck.cards.length }}</div>
			<div>Deck</div>
		</div>
		<div class="card-stack card-small card-horizontal">
			<div>{{ deck.scrap.length }}</div>
			<div>Scrap</div>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import CardVue from '#p/views/components/Game/Card/Card.vue'

import { defineProps } from 'vue'

import type { GameDeck } from '#c/game/Deck'
import type { PlayPlayer } from '#c/game/Player'

import { emitGame } from '#p/helpers/bridge'

const props = defineProps<{
	deck: GameDeck
	turnPlayer: PlayPlayer
}>()

function onPurchase(index: number | null) {
	emitGame('buy', index)
}
</script>
