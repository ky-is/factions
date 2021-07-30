<template>
	<template v-if="segment.resources">
		<CardActionSegmentResource v-for="(quantity, resource) in segment.resources" :key="resource" :resource="resource" :quantity="quantity" />
	</template>
	<template v-if="segment.discard">
		<CardActionSegmentDiscard :discard="segment.discard" />
	</template>
	<template v-if="segment.moveUnit">
		<CardActionSegmentMoveUnit :moveUnit="segment.moveUnit" />
	</template>
	<template v-if="segment.multiplier">
		<CardActionSegmentMultiplier :multiplier="segment.multiplier" />
	</template>
	<template v-if="segment.copy">
		copy a {{ segment.copy.type }} you {{ segment.copy.predicate === ActionActivationPredicate.PLAYED ? 'played this turn' : 'have in play' }}
		{{ segment.copyFaction ? 'this card also gains its faction' : null }}
	</template>
	<template v-if="segment.acquire">
		<CardActionSegmentAcquire :acquire="segment.acquire" />
	</template>
	<template v-if="segment.fleetBonus">
		all your {{ segment.fleetBonus.type ?? 'card' }}s gain <CardActionSegmentResource :resource="segment.fleetBonus.resource" :quantity="segment.fleetBonus.amount" />
	</template>
	<template v-if="segment.destroyStations">
		destroy {{ segment.destroyStations > 1 ? segment.destroyStations : 'a' }} station
	</template>
	<template v-if="segment.alliances">
		Allied to {{ segment.alliances.length === 4 ? 'all' : segment.alliances }} factions
	</template>
</template>

<script setup lang="ts">
import CardActionSegmentAcquire from '#p/views/components/Game/Card/ActionSegmentAcquire.vue'
import CardActionSegmentDiscard from '#p/views/components/Game/Card/ActionSegmentDiscard.vue'
import CardActionSegmentMoveUnit from '#p/views/components/Game/Card/ActionSegmentMoveUnit.vue'
import CardActionSegmentMultiplier from '#p/views/components/Game/Card/ActionSegmentMultiplier.vue'
import CardActionSegmentResource from '#p/views/components/Game/Card/ActionSegmentResource.vue'

import { defineProps } from 'vue'

import { ActionActivationPredicate } from '#c/types/cards'
import type { ActionSegment } from '#c/types/cards'

const props = defineProps<{
	segment: ActionSegment
}>()
</script>
