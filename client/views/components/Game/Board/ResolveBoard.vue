<template>
	<div v-if="resolving" class=" absolute inset-0  flex flex-col justify-center items-center">
		<div v-if="resolving.children" class="text-center p-8 space-y-4 bg-white shadow-xl rounded-xl">
			Choose an option:
			<div class="space-x-4  flex">
				<template v-for="(predicate, index) in resolving.children" :key="index">
					<button class="w-32 h-32 rounded-lg border-2" @click="onResolve(index)">
						<ActionPredicateVue :predicate="predicate" />
					</button>
				</template>
			</div>
		</div>
		<div v-else-if="resolving.segments" class="text-center p-8 space-y-4 bg-white shadow-xl rounded-xl">
			{{ resolving.segments[0] }}
		</div>
	</div>
</template>

<script setup lang="ts">
import ActionPredicateVue from '#p/views/components/Game/Card/ActionPredicate.vue'

import { defineProps } from 'vue'

import type { ResolveCard } from '#p/helpers/ResolveCard.js'
import type { ActionPredicate } from '#c/types/cards.js'

const props = defineProps<{
	resolving: ActionPredicate
	resolveCard: ResolveCard
}>()

function onResolve(index: number) {
	props.resolveCard.resolveOr(index)
}
</script>
