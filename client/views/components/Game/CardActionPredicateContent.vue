<template>
	<template v-if="predicate.conditional === true">
		Optional:
	</template>
	<template v-else-if="predicate.conditional">
		{{ predicate.conditional }}
	</template>
	<template v-if="predicate.children">
		<ActionPredicateVue v-for="(child, index) in predicate.children" :key="index" :predicate="child" />
	</template>
	<template v-if="predicate.segments">
		<ActionSegmentVue v-for="(segment, index) in predicate.segments" :key="index" :segment="segment" />
	</template>
</template>

<script setup lang="ts">
import { defineAsyncComponent, defineProps } from 'vue'

import type { ActionPredicate } from '#c/types/cards'

import ActionSegmentVue from '#p/views/components/Game/CardActionSegment.vue'
const ActionPredicateVue = defineAsyncComponent<any>(() => import('./CardActionPredicate.vue'))

const props = defineProps<{
	predicate: ActionPredicate
}>()
</script>
