<template>
	<div class="flex">
		<div class="flex flex-col">
			<div class="flex">
				<button type="button" @click="onAttack">
					<ActionSegmentResource :resource="CardResource.HEALING" :quantity="player.health" />
					<div class="flex flex-col">
						<ActionSegmentResource :resource="CardResource.ECONOMY" :quantity="turn.economy" />
						<ActionSegmentResource :resource="CardResource.DAMAGE" :quantity="turn.damage" />
						<ActionSegmentResource :resource="CardResource.HEALING" :quantity="turn.healing" />
					</div>
				</button>
				<CardVue v-for="(card, index) in playedCards" :key="index" :card="card" class="card-small" />
				<div class="card-stack card-small card-horizontal">
					<div>{{ handCards.length }}</div>
					<div>hand</div>
				</div>
			</div>
		</div>
		<div class="flex flex-col">
			<div class="card-stack card-small card-vertical">
				<div>{{ deckCards.length }}</div>
				<div>Deck</div>
			</div>
			<div class="card-stack card-small card-horizontal">
				<div>{{ discardCards.length }}</div>
				<div>Discard</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import CardVue from '#p/views/components/Game/Card/Card.vue'
import ActionSegmentResource from '#p/views/components/Game/Card/ActionSegmentResource.vue'

import { defineEmits, defineProps, reactive } from 'vue'

import type { PlayPlayer } from '#c/game/Play'
import { CardResource } from '#c/types/cards'

const props = defineProps<{
	player: PlayPlayer
}>()

const emit = defineEmits(['attack'])

const deckCards = reactive(props.player.deck)
const handCards = reactive(props.player.hand)
const playedCards = reactive(props.player.played)
const discardCards = reactive(props.player.discard)
const turn = reactive(props.player.turn)

function onAttack() {
	emit('attack')
}
</script>
