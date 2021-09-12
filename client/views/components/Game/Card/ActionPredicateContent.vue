<template>
	<template v-if="predicate.children">
		<template v-for="(child, index) in predicate.children" :key="index">
			<template v-if="predicate.conjunction && index === predicate.children.length - 1">
				<template v-if="predicate.conjunction === PredicateConjunction.IF_END || predicate.conjunction === PredicateConjunction.CONDITIONAL_END">
					<CardActionConditional v-if="predicate.conditional" :conditional="predicate.conditional" />
				</template>
			</template>
			<ActionPredicateVue :predicate="child" />
			<template v-if="predicate.conjunction && index < predicate.children.length - 1">
				<template v-if="predicate.conjunction === PredicateConjunction.AND">then</template>
				<span v-else-if="predicate.conjunction === PredicateConjunction.OR" class="text-secondary smallcaps"> OR </span>
			</template>
		</template>
	</template>
	<template v-if="predicate.segments">
		<template v-for="(segment, index) in predicate.segments" :key="index">
			<template v-if="predicate.conditional && predicate.segments.length === 1">
				<CardActionConditional :conditional="predicate.conditional" />
			</template>
			<ActionSegment :segment="segment" />
			<template v-if="predicate.conditional && index < predicate.segments.length - 1">
				<CardActionConditional :conditional="predicate.conditional" />
			</template>
		</template>
	</template>
</template>

<script setup lang="ts">
import ActionSegment from '#p/views/components/Game/Card/ActionSegment.vue'
import CardActionConditional from '#p/views/components/Game/Card/ActionConditional.vue'

import { defineAsyncComponent, defineProps } from 'vue'

const ActionPredicateVue = defineAsyncComponent<any>(() => import('./ActionPredicate.vue'))

import { PredicateConjunction } from '#c/types/cards'
import type { ActionPredicate } from '#c/types/cards'

const props = defineProps<{
	predicate: ActionPredicate
}>()
</script>
