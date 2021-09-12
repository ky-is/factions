<template>
	<div class="text-large">
		<template v-if="!gameData">
			Unknown game
		</template>
		<GameBoard v-else :data="gameData" :cards="sampleCards" />
	</div>
</template>

<script setup lang="ts">
import GameBoard from '#p/views/components/Game/Board/GameBoard.vue'

import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { TESTING } from '#c/utils.js'

import type { GameData } from '#c/types/data.js'
import { sampleCards } from '#c/cards/parseSample.js'

import { useStore } from '#p/models/store.js'

const router = useRouter()
const { state } = useStore()

const gameData = state.game as GameData | null

onMounted(() => {
	if (!gameData && TESTING) {
		router.replace({ name: 'Lobby' })
	}
})
</script>
