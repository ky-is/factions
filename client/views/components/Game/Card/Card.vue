<template>
	<button :class="[ card.type === CardType.STATION ? 'card-horizontal' : 'card-vertical', availableGold !== undefined ? 'for-sale' : null ]" class="card-container" :disabled="card.cost !== undefined && availableGold !== undefined && availableGold < card.cost">
		<div class="w-full flex">
			<CardFactions :factions="card.factions" class=" flex-col" />
			<div class="flex-grow text-left">{{ card.name }}</div>
			<ActionSegmentResource v-if="card.defense" :resource="CardResource.DEFENSE" :quantity="card.defense" :bg="card.isShield ? 'text-gray-900' : 'text-gray-400'" />
			<div v-if="card.cost" class="cost-icon card-icon">
				<span class="text-yellow-700">{{ card.cost }}</span>
			</div>
		</div>
		<CardAction v-for="(action, actionIndex) in card.actions" :key="actionIndex" :action="action" />
		<div class="flex-grow" />
		<div v-if="resolve" class="w-full text-center">
			<button v-if="isTurn" class="button-secondary bg-white" @click="onPlay">Play card</button>
		</div>
	</button>
</template>

<script setup lang="ts">
import CardFactions from '#p/views/components/Game/Card/CardFactions.vue'
import CardAction from '#p/views/components/Game/Card/CardAction.vue'
import ActionSegmentResource from '#p/views/components/Game/Card/ActionSegmentResource.vue'

import { defineProps } from 'vue'

import { CardResource, CardType } from '#c/types/cards'
import type { CardData } from '#c/types/cards'
import type { ResolveCard } from '#p/helpers/ResolveCard.js'

const props = defineProps<{
	card: CardData
	isTurn?: boolean
	index?: number
	resolve?: ResolveCard
	availableGold?: number
}>()

function onPlay() {
	props.resolve!.resolveCardAt(props.index!)
}
</script>

<style scoped lang="postcss">
.card-container {
	@apply text-left flex flex-col;
}
.card-container:not(.for-sale), .for-sale:disabled {
	@apply cursor-default;
}

.cost-icon {
	@apply bg-yellow-200 border-2 border-yellow-700;
}

.for-sale:disabled .cost-icon {
	@apply opacity-50;
}
</style>
