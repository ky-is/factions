<template>
<div class="text-large">
	<template v-if="!gameData">
		Unknown game
	</template>
	<GameBoard v-else :data="gameData" :cards="cards" />
</div>
</template>

<script setup lang="ts">
import GameBoard from '#p/views/components/Game/Board/GameBoard.vue'

import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { TESTING } from '#c/utils'

import { loadCards } from '#c/cards/parse'

import { state } from '#p/models/store'

const router = useRouter()

const gameData = state.gameData

const cards = computed(() => (state.gameData?.cards != null ? loadCards(state.gameData.cards) : []))

onMounted(() => {
	if (TESTING && gameData == null) {
		router.replace({ name: 'Lobby' })
	}
})
</script>
