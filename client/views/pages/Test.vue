<template>
	<input type="file" @dragover.prevent="onDragOver" @drop.prevent="onDrop" @change.prevent="onChange">
	<div class="text-large">
		<div class="flex justify-around">
			<OpponentPlayerVue v-if="opponentPlayer" :player="opponentPlayer" :isTurn="false" @attack="onAttack(opponentPlayer)" />
		</div>
		<ShopBoardVue v-if="deck" :deck="deck" :turnPlayer="mainPlayer" />
		<div class="flex justify-around">
			<MainPlayerVue v-if="mainPlayer" :player="mainPlayer" :isTurn="true" />
		</div>
	</div>
</template>

<script setup lang="ts">
import MainPlayerVue from '#p/views/components/Game/Board/MainPlayer.vue'
import OpponentPlayerVue from '#p/views/components/Game/Board/OpponentPlayer.vue'
import ShopBoardVue from '#p/views/components/Game/Board/Shop.vue'

import { ref } from 'vue'
import seedrandom from 'seedrandom'

import { loadCards } from '#p/helpers/parse'
import { GameDeck } from '#c/game/Deck'
import storage from '#p/models/storage'
import { PlayPlayer } from '#c/game/Play'

const deck = ref<GameDeck | null>(null)
const mainPlayer = ref<PlayPlayer | null>(null)
const opponentPlayer = ref<PlayPlayer | null>(null)

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
	const rng = seedrandom()
	deck.value = new GameDeck(rng, 2, cards)
	mainPlayer.value = new PlayPlayer(rng, 0, { id: '0', name: 'test' }, 2)
	opponentPlayer.value = new PlayPlayer(rng, 1, { id: '1', name: 'oppo' }, 2)
}

function onAttack(player: PlayPlayer) {
	mainPlayer.value?.attack(player)
}
</script>
