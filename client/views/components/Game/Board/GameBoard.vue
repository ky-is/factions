<template>
	<div v-if="turnPlayer" class="text-large">
		<div class="flex justify-around">
			<OpponentPlayer v-for="player in opponentPlayers" :key="player.id" :player="player" :isTurn="turnPlayer.id === player.id" @attack="onAttack(player.index)" />
		</div>
		<ShopBoard :deck="game.deck" :turnPlayer="turnPlayer" />
		<div class="flex">
			<MainPlayer v-if="localPlayer" :player="localPlayer" :isTurn="turnPlayer.id === localPlayer.id" />
		</div>
	</div>
</template>

<script setup lang="ts">
import MainPlayer from '#p/views/components/Game/Board/MainPlayer.vue'
import OpponentPlayer from '#p/views/components/Game/Board/OpponentPlayer.vue'
import ShopBoard from '#p/views/components/Game/Board/Shop.vue'

import { computed, defineProps, onBeforeMount, onBeforeUnmount } from 'vue'

import { PlayGame } from '#c/game/Game'
import type { GameData } from '#c/types/data'
import type { CardData } from '#c/types/cards.js'

import { useStore } from '#p/models/store'
import { registerGame, deregisterGame, emitGame } from '#p/helpers/bridge.js'

const { state } = useStore()

const props = defineProps<{
	data: GameData
	cards: CardData[]
}>()

const game = new PlayGame(props.data, props.cards) //TODO computed watch

onBeforeMount(() => game && registerGame(game))
onBeforeUnmount(deregisterGame)

const turnPlayer = computed(() => game?.currentPlayer())

const localPlayer = game?.players.find(player => player.id === state.user.id)
const opponentPlayers = game?.players.filter(player => player.id !== state.user.id)

function onAttack(playerIndex: number) {
	const damage = turnPlayer.value?.turn.damage
	emitGame('attack', playerIndex, damage)
}
</script>
