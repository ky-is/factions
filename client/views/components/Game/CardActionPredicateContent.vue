<template>
	<template v-if="predicate.children">
		<template v-for="(child, index) in predicate.children" :key="index">
			<ActionPredicateVue :predicate="child" />
			<template v-if="index < predicate.children.length - 1">
				<template v-if="predicate.conjunction === PredicateConjunction.AND">then</template>
				<div v-else-if="predicate.conjunction !== undefined">{{ predicate.conjunction }}</div>
			</template>
		</template>
	</template>
	<template v-if="predicate.segments">
		<template v-for="(segment, index) in predicate.segments" :key="index">
			<ActionSegmentVue :segment="segment" />
			<template v-if="index < predicate.segments.length - 1">
				<template v-if="predicate.conditional === true">
					Optional:
				</template>
				<template v-else-if="predicate.conditional !== undefined">
					{{ predicate.conditional }}
				</template>
			</template>
		</template>
	</template>
</template>

<script setup lang="ts">
import { defineAsyncComponent, defineProps } from 'vue'

import { PredicateConjunction } from '#c/types/cards'
import type { ActionPredicate } from '#c/types/cards'

import ActionSegmentVue from '#p/views/components/Game/CardActionSegment.vue'
const ActionPredicateVue = defineAsyncComponent<any>(() => import('./CardActionPredicate.vue'))

const props = defineProps<{
	predicate: ActionPredicate
}>()
</script>
