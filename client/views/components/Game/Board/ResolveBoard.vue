<template>
	<div v-if="resolving" class="absolute inset-0 z-20  flex flex-col justify-center items-center">
		<div v-if="resolving.children" class="overlay">
			Choose an option:
			<div class="space-x-4  flex">
				<template v-for="(predicate, index) in resolving.children" :key="index">
					<button class="w-32 h-32 rounded-lg border-2" @click="onResolve(index)">
						<ActionPredicateVue :predicate="predicate" />
					</button>
				</template>
			</div>
		</div>
		<div v-else-if="resolving.segments" class="overlay">
			{{ resolving.segments[0] }}
		</div>
		<div v-else class="overlay">
			{{ resolving }}
		</div>
	</div>
</template>

<script setup lang="ts">
import ActionPredicateVue from '#p/views/components/Game/Card/ActionPredicate.vue'

import { defineProps } from 'vue'

import type { ActionPredicate } from '#c/types/cards'

import type { ResolveCard } from '#p/helpers/ResolveCard'

const props = defineProps<{
	resolver: ResolveCard
	resolving: ActionPredicate
}>()

function onResolve(index: number) {
	props.resolver.resolveOr(index)
}
</script>

<style lang="postcss" scoped>
.overlay {
	@apply text-center p-8 space-y-4 bg-white shadow-xl rounded-xl;
}
</style>
