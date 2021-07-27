<template>
	<div :class="card.type === CardType.STATION ? 'card-horizontal' : 'card-vertical'">
		<div class="flex">
			<div class="flex flex-col">
				<FactionVue v-for="faction in card.factions" :key="faction" :faction="faction" />
				<div class="card-icon bg-gray-500">{{ card.cost }}</div>
			</div>
			<div class="min-w-32">{{ card.name }}</div>
		</div>
		<CardActionVue v-for="(action, index) in card.actions" :key="index" :action="action" />
	</div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

import { CardType } from '#c/types/cards'
import type { CardData } from '#c/types/cards'

import FactionVue from '#p/views/components/Game/CardFaction.vue'
import CardActionVue from '#p/views/components/Game/CardAction.vue'

const props = defineProps<{
	card: CardData
}>()
</script>
