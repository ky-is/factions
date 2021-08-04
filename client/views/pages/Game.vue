<template>
	<div class="text-large">
		<template v-if="!game">
			Unknown game
		</template>
		<template v-else-if="turnPlayer">
			<div class="flex justify-around">
				<OpponentPlayerVue v-for="player in opponentPlayers" :key="player.id" :player="player" :isTurn="turnPlayer.id === player.id" @attack="onAttack(player)" />
			</div>
			<ShopBoardVue :deck="game.deck" :turnPlayer="turnPlayer" />
			<div class="flex">
				<MainPlayerVue v-if="localPlayer" :player="localPlayer" :isTurn="turnPlayer.id === localPlayer.id" />
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import MainPlayerVue from '#p/views/components/Game/Board/MainPlayer.vue'
import OpponentPlayerVue from '#p/views/components/Game/Board/OpponentPlayer.vue'
import ShopBoardVue from '#p/views/components/Game/Board/Shop.vue'

import { computed, onBeforeMount, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { PlayGame } from '#c/game/Play'
import type { PlayPlayer } from '#c/game/Play'
import type { GameData } from '#c/types/data'
import type { ActionResolution } from '#c/types/cards'
import { TESTING } from '#c/utils'

import { socket } from '#p/models/api'
import { sampleCards } from '#p/helpers/parseSample'
import { useStore } from '#p/models/store'

const router = useRouter()
const { state } = useStore()

const game = state.game ? new PlayGame(state.game as GameData, sampleCards) : null

onBeforeMount(() => {
	socket.on('factions-play', (handIndex: number, resolutions: ActionResolution[], c: any) => {
		console.log(handIndex, resolutions, c)
		if (!game) {
			return console.log('No game')
		}
		game.currentPlayer().playCardAt(handIndex, resolutions)
	})
})
onMounted(() => {
	if (!game && TESTING) {
		router.replace({ name: 'Lobby' })
	}
})
onBeforeUnmount(() => {
	socket.off('factions-play')
})

const turnPlayer = computed(() => game?.currentPlayer())

const localPlayer = game?.players.find(player => player.id === state.user.id)
const opponentPlayers = game?.players.filter(player => player.id !== state.user.id)

function onAttack(player: PlayPlayer) {
	if (!game) {
		return
	}
	turnPlayer.value?.attack(player)
}
</script>
