<template>
	<button :class="[ card.type === CardType.STATION ? 'card-horizontal' : 'card-vertical', availableGold !== undefined ? 'for-sale' : null ]" class="card-container" :disabled="card.cost !== undefined && availableGold !== undefined && availableGold < card.cost">
		<div class="w-full flex">
			<CardFactionsVue :factions="card.factions" class=" flex-col" />
			<div class="flex-grow text-left">{{ card.name }}</div>
			<button v-if="card.defense"
				:class="isOpponent ? undefined : 'cursor-default'"
				@click="isOpponent ? onAttack() : undefined"
			>
				<ActionSegmentResource :resource="CardResource.DEFENSE" :quantity="card.defense" :bg="card.isShield ? 'text-gray-900' : 'text-gray-400'" />
			</button>
			<div v-if="card.cost" class="cost-icon card-icon">
				<span class="text-yellow-700">{{ card.cost }}</span>
			</div>
		</div>
		<button v-for="(action, actionIndex) in card.actions" :key="actionIndex"
			:class="played && action.activation === ActionActivation.ON_SCRAP ? undefined : 'cursor-default'"
			@click="played && action.activation === ActionActivation.ON_SCRAP ? onDiscard(action) : undefined"
		>
			<CardActionVue :action="action" />
		</button>
		<div class="flex-grow" />
		<div v-if="resolver && !played" class="w-full text-center">
			<button v-if="isTurn" class="button-secondary bg-white" @click="onPlay">Play card</button>
		</div>
	</button>
</template>

<script setup lang="ts">
import CardFactionsVue from '#p/views/components/Game/Card/CardFactions.vue'
import CardActionVue from '#p/views/components/Game/Card/CardAction.vue'
import ActionSegmentResource from '#p/views/components/Game/Card/ActionSegmentResource.vue'

import { defineEmits, defineProps } from 'vue'

import { ActionActivation, CardResource, CardType } from '#c/types/cards.js'
import type { CardAction, CardData } from '#c/types/cards.js'
import type { PlayPlayer } from '#c/game/Player.js'

import type { ResolveCard } from '#p/helpers/ResolveCard.js'

const props = defineProps<{
	card: CardData
	isTurn?: boolean
	index?: number
	player?: PlayPlayer
	resolver?: ResolveCard
	availableGold?: number
	played?: boolean
}>()

const emit = defineEmits(['attack'])

const isOpponent = props.resolver === undefined && props.availableGold === undefined

function onPlay() {
	props.resolver!.resolveCardAt(props.player!, props.index!)
}

function onDiscard(action: CardAction) {
	props.resolver!.resolvePendingAction(props.player!, props.index!, action)
}

function onAttack() {
	emit('attack', null)
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
