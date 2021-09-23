<template>
	<div v-if="turnPlayer" class="text-large">
		<div class="flex justify-around">
			<OpponentPlayer v-for="player in opponentPlayers" :key="player.id" :player="player" :isTurn="turnPlayer.id === player.id" @attack="onAttack(player.index, $event)" />
		</div>
		<ShopBoard :deck="game.deck" :turnPlayer="turnPlayer" />
		<div class="flex">
			<MainPlayer v-if="localPlayer" :player="localPlayer" :resolver="resolver" :isTurn="turnPlayer.id === localPlayer.id" />
		</div>
	</div>
</template>

<script setup lang="ts">
import MainPlayer from '#p/views/components/Game/Board/MainPlayer.vue'
import OpponentPlayer from '#p/views/components/Game/Board/OpponentPlayer.vue'
import ShopBoard from '#p/views/components/Game/Board/Shop.vue'

import { computed, defineProps, onBeforeMount, onBeforeUnmount } from 'vue'

import { PlayGame } from '#c/game/Game'
import type { GameData } from '#c/types/data.js'
import type { CardData } from '#c/types/cards.js'

import { useStore } from '#p/models/store.js'
import { registerGame, deregisterGame, emitGame } from '#p/helpers/bridge.js'
import { ResolveCard } from '#p/helpers/ResolveCard.js'

const { state } = useStore()

const props = defineProps<{
	data: GameData
	cards: CardData[]
}>()

const game = new PlayGame(props.data, props.cards) //TODO computed watch
const resolver = new ResolveCard()

onBeforeMount(() => registerGame(game, resolver))
onBeforeUnmount(deregisterGame)

const turnPlayer = computed(() => game?.currentPlayer())

const localPlayer = game?.players.find(player => player.id === state.user.id)
const opponentPlayers = game?.players.filter(player => player.id !== state.user.id)

function onAttack(playerIndex: number, playedCardIndex: number | null) {
	const damage = turnPlayer.value?.turn.damage
	if (damage < 1) {
		return console.log('No damage', playerIndex, playedCardIndex, damage)
	}
	if (playedCardIndex !== null) {
		const card = game.players[playerIndex]?.played[playedCardIndex]
		if (card == null || !card.defense) {
			return
		}
		if (card.defense > damage) {
			return window.alert('You do not have enough damage to kill this station!')
		}
	}
	emitGame('attack', playerIndex, playedCardIndex, damage)
}
</script>
