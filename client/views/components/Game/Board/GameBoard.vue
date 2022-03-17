<template>
	<div v-if="turnPlayer" class="text-large">
		<div class="flex justify-around">
			<OpponentPlayer v-for="player in opponentPlayers" :key="player.id" :player="player" :isTurn="turnPlayer.id === player.id" @attack="onAttack(player.index, $event)" />
		</div>
		<ShopBoard :deck="game.deck" :turnPlayer="turnPlayer" />
		<div class="flex">
			<MainPlayer v-if="localPlayer && resolver" :player="localPlayer" :resolver="resolver" :isTurn="turnPlayer.id === localPlayer.id" />
		</div>
	</div>
</template>

<script setup lang="ts">
import MainPlayer from '#p/views/components/Game/Board/MainPlayer.vue'
import OpponentPlayer from '#p/views/components/Game/Board/OpponentPlayer.vue'
import ShopBoard from '#p/views/components/Game/Board/Shop.vue'

import { computed, defineProps, onBeforeMount, onBeforeUnmount } from 'vue'

import type { GameData } from '#c/types/data.js'
import type { CardData } from '#c/types/cards.js'

import { commit, getters, state } from '#p/models/store.js'
import { registerGame, deregisterGame, emitGame } from '#p/helpers/bridge.js'
import { ResolveCard } from '#p/helpers/ResolveCard.js'

const props = defineProps<{
	data: GameData
	cards: CardData[]
}>()

const game = commit.createGame(props.data, props.cards)

const turnPlayer = computed(() => game?.currentPlayer())

const localPlayer = getters.localPlayer
const opponentPlayers = getters.opponentPlayers

const resolver = localPlayer.value && new ResolveCard(localPlayer.value)

onBeforeMount(() => resolver != null && localPlayer.value && registerGame(game, resolver, localPlayer.value))
onBeforeUnmount(deregisterGame)

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
