<template>
	<div class="text-large">
		<template v-if="!game">
			Unknown game
		</template>
		<template v-else>
			<div class="flex justify-around">
				<OpponentPlayerVue v-for="player in opponentPlayer" :key="player.id" :player="player" :game="game" @attack="onAttack(player)" />
			</div>
			<ShopBoardVue :deck="game.deck" :turnPlayer="game.players[game.turnIndex]" />
			<div class="flex justify-around">
				<MainPlayerVue v-if="localPlayer" :player="localPlayer" />
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import MainPlayerVue from '#p/views/components/Game/Board/MainPlayer.vue'
import OpponentPlayerVue from '#p/views/components/Game/Board/MainPlayer.vue'
import ShopBoardVue from '#p/views/components/Game/Board/Shop.vue'

import { PlayGame } from '#c/game/Play'
import type { PlayPlayer } from '#c/game/Play'
import type { GameData } from '#c/types/data'

import { sampleCards } from '#p/helpers/parseSample'
import { useStore } from '#p/models/store'

const { state } = useStore()

const game = state.game ? new PlayGame(state.game as GameData, sampleCards) : null

const localPlayer = game?.players.find(player => player.id === state.user.id)
const opponentPlayer = game?.players.filter(player => player.id !== state.user.id)

function onAttack(player: PlayPlayer) {
	if (!game) {
		return
	}
	game.players[game.turnIndex].attack(player)
}
</script>
