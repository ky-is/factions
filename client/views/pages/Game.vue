<template>
	<div class="text-large">
		<template v-if="!game">
			Unknown game
		</template>
		<ShopBoardVue v-else :deck="game.deck" />
	</div>
</template>

<script setup lang="ts">
import ShopBoardVue from '#p/views/components/Game/Board/Shop.vue'

import { PlayGame } from '#c/game/Play.js'
import type { GameData } from '#c/types/data.js'

import { sampleCards } from '#p/helpers/parseSample'
import { useStore } from '#p/models/store'

const { state } = useStore()

const game = state.game ? new PlayGame(state.game as GameData, sampleCards) : null
</script>
