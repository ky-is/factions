<template>
	<ActionSegmentResource :resource="CardResource.HEALING" :quantity="player.stats.health" />
	<div v-if="isTurn" class="flex flex-col">
		<ActionSegmentResource :resource="CardResource.ECONOMY" :quantity="player.turn.economy" />
		<ActionSegmentResource :resource="CardResource.DAMAGE" :quantity="player.turn.damage" />
		<ActionSegmentResource v-show="player.turn.healing > 0" :resource="CardResource.HEALING" :quantity="player.turn.healing" />
	</div>
</template>

<script setup lang="ts">
import ActionSegmentResource from '#p/views/components/Game/Card/ActionSegmentResource.vue'

import { defineProps } from 'vue'

import { CardResource } from '#c/types/cards.js'
import type { PlayPlayer } from '#c/game/Player.js'

const props = defineProps<{
	player: PlayPlayer
	isTurn: boolean
}>()
</script>
