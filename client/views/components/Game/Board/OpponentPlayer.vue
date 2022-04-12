<template>
<div class="flex">
	<div class="flex flex-col">
		<div class="flex">
			<button type="button" @click="onAttack(null)">
				<PlayerStats :player="player" :isTurn="isTurn" />
			</button>
			<CardVue v-for="(card, index) in player.played" :key="index" :card="card" class="card-small" @attack="onAttack(index)" />
			<div class="card-stack card-small card-vertical">
				<div>{{ player.hand.length }}</div>
				<div>Hand</div>
			</div>
		</div>
	</div>
	<div class="flex flex-col">
		<div class="card-stack card-small card-horizontal">
			<div>{{ player.deck.length }}</div>
			<div>Deck</div>
		</div>
		<div class="card-stack card-small card-horizontal">
			<div>{{ player.discard.length }}</div>
			<div>Discard</div>
		</div>
	</div>
</div>
</template>

<script setup lang="ts">
import CardVue from '#p/views/components/Game/Card/Card.vue'
import PlayerStats from '#p/views/components/Game/Board/PlayerStats.vue'

import { defineEmits, defineProps } from 'vue'

import type { PlayPlayer } from '#c/game/Player'

const props = defineProps<{
	player: PlayPlayer
	isTurn: boolean
}>()

const emit = defineEmits(['attack'])

function onAttack(playedCardIndex: number | null) {
	emit('attack', playedCardIndex)
}
</script>
