<template>
	<div class="flex">
		<div v-if="activationIcon" class="card-icon">
			activationIcon
		</div>
		<div v-if="action.factions" class="flex">
			<FactionVue v-for="faction in action.factions" :key="faction" :faction="faction" />
		</div>
		<ActionPredicateVue :predicate="action.predicate" />
	</div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

import { ActionActivation } from '#c/types/cards'
import type { CardAction } from '#c/types/cards'

import FactionVue from '#p/views/components/Game/CardFaction.vue'
import ActionPredicateVue from '#p/views/components/Game/CardActionPredicate.vue'

const props = defineProps<{
	action: CardAction
}>()

const activationIcon = props.action.activation === ActionActivation.ON_SCRAP
	? '🗑'
	: props.action.activation === ActionActivation.OPTIONAL
		? '？'
		: undefined

</script>
