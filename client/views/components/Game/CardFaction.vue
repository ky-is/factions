<template>
	<div class="card-icon" :class="color" />
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

import { CardFaction } from '#c/types/cards.js'

const props = defineProps<{
	faction: CardFaction
}>()

const color = computed(() => {
	return props.faction === CardFaction.PINK
		? 'bg-pink-500'
		: props.faction === CardFaction.GOLD
			? 'bg-yellow-500'
			: props.faction === CardFaction.GREEN
				? 'bg-green-500'
				: props.faction === CardFaction.BLUE
					? 'bg-blue-500'
					: 'bg-grey-500'
})
</script>
