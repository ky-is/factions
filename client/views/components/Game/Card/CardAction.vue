<template>
	<div>
		<div v-if="activationIcon" class="inline-block">
			<div v-if="activationIcon" class="card-icon">{{ activationIcon }}</div>
		</div>
		<div v-if="action.factions" class="inline-block">
			<CardFactions :factions="action.factions" />
		</div>
		<ActionPredicateVue :predicate="action.predicate" />
	</div>
</template>

<script setup lang="ts">
import CardFactions from '#p/views/components/Game/Card/CardFactions.vue'
import ActionPredicateVue from '#p/views/components/Game/Card/ActionPredicate.vue'

import { defineProps } from 'vue'

import { ActionActivation } from '#c/types/cards'
import type { CardAction } from '#c/types/cards'

const props = defineProps<{
	action: CardAction
}>()

const activationIcon = props.action.activation === ActionActivation.ON_SCRAP
	? '🗑'
	: props.action.activation === ActionActivation.OPTIONAL
		? '？'
		: undefined
</script>
