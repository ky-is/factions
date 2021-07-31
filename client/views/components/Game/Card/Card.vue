<template>
	<div :class="card.type === CardType.STATION ? 'card-horizontal' : 'card-vertical'" class="flex flex-col">
		<div class="flex">
			<div class="flex flex-col">
				<FactionVue v-for="faction in card.factions" :key="faction" :faction="faction" />
			</div>
			<div class="min-w-32 flex-grow">{{ card.name }}</div>
			<ActionSegmentResource v-if="card.defense" :resource="CardResource.DEFENSE" :quantity="card.defense" :bg="card.isShield ? 'text-gray-900' : 'text-gray-400'" />
			<div v-if="card.cost" class="card-icon bg-yellow-200 border-2 border-yellow-700"><span class="text-yellow-700">{{ card.cost }}</span></div>
		</div>
		<CardActionVue v-for="(action, index) in card.actions" :key="index" :action="action" />
		<div class="flex-grow" />
		<div v-if="player" class="text-center">
			<button class="button-secondary bg-white" @click="onPlay">Play card</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import FactionVue from '#p/views/components/Game/Card/CardFaction.vue'
import CardActionVue from '#p/views/components/Game/Card/CardAction.vue'
import ActionSegmentResource from '#p/views/components/Game/Card/ActionSegmentResource.vue'

import { defineProps } from 'vue'

import { CardResource, CardType } from '#c/types/cards'
import type { CardData } from '#c/types/cards'
import type { PlayPlayer } from '#c/game/Play'

const props = defineProps<{
	card: CardData
	player?: PlayPlayer
}>()

function onPlay() {
	props.player?.play(props.card)
}
</script>
