<template>
	<input type="file" @dragover.prevent="onDragOver" @drop.prevent="onDrop" @change.prevent="onChange">
	<div v-if="deck" class="text-large">
		<div class="flex justify-around">
			<OpponentPlayerVue :player="opponentPlayer" :isTurn="false" @attack="onAttack(opponentPlayer)" />
		</div>
		<ShopBoardVue :deck="deck" :turnPlayer="mainPlayer" />
		<div class="flex justify-around">
			<MainPlayerVue :player="mainPlayer" :isTurn="true" />
		</div>
	</div>
</template>

<script setup lang="ts">
import MainPlayerVue from '#p/views/components/Game/Board/MainPlayer.vue'
import OpponentPlayerVue from '#p/views/components/Game/Board/OpponentPlayer.vue'
import ShopBoardVue from '#p/views/components/Game/Board/Shop.vue'

import { shallowRef } from 'vue'

import { loadCards } from '#c/cards/parse'
import { GameDeck } from '#c/game/Deck'
import storage from '#p/models/storage'
import { PlayPlayer } from '#c/game/Player'
import { PlayGame } from '#c/game/Game.js'

const deck = shallowRef<GameDeck | null>(null)
const mainPlayer = shallowRef<PlayPlayer>(null as any)
const opponentPlayer = shallowRef<PlayPlayer>(null as any)

const saved = storage.get('TEST')
if (saved) {
	updateDeck(saved)
}

function onDragOver(event: DragEvent) {
	event.dataTransfer!.dropEffect = 'link'
}

function onDrop(event: DragEvent) {
	if (!event.dataTransfer) {
		return
	}
	handleFiles(event.dataTransfer.files)
}

function onChange(event: Event) {
	const target = event.target
	if (!target) {
		return
	}
	handleFiles((target as any).files)
}

async function handleFiles(files: FileList) {
	const fileText = await files[0].text()
	storage.set('TEST', fileText)
	updateDeck(fileText)
}

function updateDeck(raw: string) {
	const cards = loadCards(raw)
	const game = new PlayGame({ id: 'TEST', title: 'test', type: 'factions', size: 2, host: '0', started: true, finished: false, players: [{id: '0', name: 'main'}, {id: '1', name: 'oppo'}] }, cards)
	deck.value = game.deck
	mainPlayer.value = game.players[0]
	opponentPlayer.value = game.players[1]
}

function onAttack(player: PlayPlayer) {
	mainPlayer.value?.attack(player, mainPlayer.value.turn.damage)
}
</script>
