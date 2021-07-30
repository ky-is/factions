<template>
	<template v-if="quantity === -1">
		{{ resource === CardResource.DRAW ? 'draw' : 'gain' }} that many {{ resource }}s
	</template>
	<div v-else class="resource-icon" :class="resource" :title="`${quantity} ${resource}`">
		<span class="background" :class="bg">{{ background }}</span>
		<span class="quantity">{{ quantity }}</span>
	</div>
</template>

<script setup lang="ts">
import { CardResource } from '#c/types/cards.js'
import { defineProps } from 'vue'

const props = defineProps<{
	resource: string
	quantity: number | undefined
	bg?: string
}>()

const background = props.resource === CardResource.DRAW
	? '🎴' // 🎟🗳📤📮
	: props.resource === CardResource.ECONOMY
		? '💰' // 🪙 🧧
		: props.resource === CardResource.DAMAGE
			? '💥'
			: props.resource === CardResource.HEALING
				? '💗' //⛑🏥❤️‍🩹
				: props.resource === CardResource.DEFENSE
					? '☗' //⛑🏥❤️‍🩹
					: `?${props.resource}?`
</script>

<style scoped lang="postcss">
.resource-icon {
	@apply inline-block relative font-mono text-center;
	width: 2.3vw;
	max-height: 2.3vw;
}
.defense {
	margin-top: 0.4vw;
}
.economy {
	margin-top: -0.1vw;
}
.background {
	font-size: 1.75vw;
}
.defense .background {
	font-size: 175%;
	line-height: 1vw;
}
.quantity {
	margin-top: 0.3vw;
	margin-left: 0.05vw;
}
.damage .quantity {
	margin-left: 0.2vw;
}
.economy .quantity {
	margin-top: 0.5vw;
}
.defense .quantity {
	margin-top: -0.2vw;
}

.quantity {
	@apply absolute inset-0 text-center text-white font-black;
	text-shadow: -1px -1px 0 #000, 0 -1px 0 #000, 1px -1px 0 #000, 1px 0 0 #000, 1px 1px 0 #000, 0 1px 0 #000, -1px 1px 0 #000, -1px 0 0 #000;
}
</style>
