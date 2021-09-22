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

import type { ActionPredicate } from '#c/types/cards.js'
import type { PlayPlayer } from '#c/game/Player.js'

import type { ResolveCard } from '#p/helpers/ResolveCard.js'

const props = defineProps<{
	player: PlayPlayer
	resolver: ResolveCard
	resolving: ActionPredicate
}>()

function onResolve(index: number) {
	props.resolver.resolveOr(props.player, index)
}
</script>
