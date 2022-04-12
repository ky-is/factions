<template>
<template v-if="segment.resources">
	<ActionSegmentResource v-for="(quantity, resource) in segment.resources" :key="resource" :resource="resource" :quantity="quantity" />
</template>
<ActionSegmentDiscard v-if="segment.discard" :discard="segment.discard" />
<ActionSegmentMoveUnit v-if="segment.moveUnit" :moveUnit="segment.moveUnit" />
<ActionSegmentMultiplier v-if="segment.multiplier" :multiplier="segment.multiplier" />
<template v-if="segment.copy">
	copy a {{ segment.copy.type }} you {{ segment.copy.predicate === ActionActivationPredicate.PLAYED ? 'played this turn' : 'have in play' }}
	{{ segment.copyFaction ? 'this card also gains its faction' : null }}
</template>
<ActionSegmentAcquire v-if="segment.acquire" :acquire="segment.acquire" />
<template v-if="segment.fleetBonus">
	all your {{ segment.fleetBonus.type ?? 'card' }}s gain <ActionSegmentResource :resource="segment.fleetBonus.resource" :quantity="segment.fleetBonus.amount" />
</template>
<template v-if="segment.destroyStations">
	destroy {{ segment.destroyStations > 1 ? segment.destroyStations : 'a' }} station
</template>
<template v-if="segment.alliances">
	Allied to {{ segment.alliances.length === 4 ? 'all' : segment.alliances }} factions
</template>
</template>

<script setup lang="ts">
import ActionSegmentAcquire from '#p/views/components/Game/Card/ActionSegmentAcquire.vue'
import ActionSegmentDiscard from '#p/views/components/Game/Card/ActionSegmentDiscard.vue'
import ActionSegmentMoveUnit from '#p/views/components/Game/Card/ActionSegmentMoveUnit.vue'
import ActionSegmentMultiplier from '#p/views/components/Game/Card/ActionSegmentMultiplier.vue'
import ActionSegmentResource from '#p/views/components/Game/Card/ActionSegmentResource.vue'

import { defineProps } from 'vue'

import { ActionActivationPredicate } from '#c/types/cards'
import type { ActionSegment } from '#c/types/cards'

const props = defineProps<{
	segment: ActionSegment
}>()
</script>
