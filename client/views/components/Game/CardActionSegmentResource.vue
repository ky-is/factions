<template>
	<div class="resource-icon" :class="resource" :title="`${quantity} ${resource}`">
		<div class="background">{{ background }}</div>
		<div class="quantity">{{ quantity }}</div>
	</div>
</template>

<script setup lang="ts">
import { CardResource } from '#c/types/cards.js'
import { defineProps } from 'vue'

const props = defineProps<{
	resource: string
	quantity: number | undefined
}>()

const background = props.resource === CardResource.DRAW
	? '🎴' // 🎟🗳📤📮
	: props.resource === CardResource.ECONOMY
		? '💰' // 🪙 🧧
		: props.resource === CardResource.DAMAGE
			? '💥'
			: props.resource === CardResource.HEALING
				? '💗' //⛑🏥❤️‍🩹
				: '??'
</script>

<style scoped lang="postcss">
.resource-icon {
	@apply inline-block relative font-mono;
	width: 2.3vw;
	line-height: 125%;
	padding-top: 0.5vw;
}
.background {
	font-size: 175%;
}
.damage .background {
	margin-left: -0.2vw;
}
.quantity {
	margin-top: 0.5vw;
}
.economy .quantity {
	margin-top: 0.8vw;
}

.quantity {
	@apply absolute inset-0 text-center text-white font-black;
	text-shadow: -1px -1px 0 #000, 0 -1px 0 #000, 1px -1px 0 #000, 1px 0 0 #000, 1px 1px 0 #000, 0 1px 0 #000, -1px 1px 0 #000, -1px 0 0 #000;
}
</style>
