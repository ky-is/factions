<template>
	<div class="card-icon  text-large" :class="[ backgroundColor, faction.toLowerCase() ]">
		<div class="icon">{{ icon }}</div>
	</div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

import { CardFaction } from '#c/types/cards'

const props = defineProps<{
	faction: CardFaction
}>()

const backgroundColor = computed(() => {
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

const icon = computed(() => {
	return props.faction === CardFaction.PINK
		? '⚙'// ''
		: props.faction === CardFaction.GOLD
			? '⤲' //❃✵
			: props.faction === CardFaction.GREEN
				? '⚘' //✇
				: props.faction === CardFaction.BLUE
					? '⚚' // '☽'
					: ''
})
</script>

<style scoped lang="postcss">
.card-icon {
	@apply mr-0.5 font-mono text-white;
}

.pink .icon {
	margin-top: -0.07vw;
	margin-left: 0.03vw;
}
</style>
