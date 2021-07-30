<template>
	<input type="file" @dragover.prevent="onDragOver" @drop.prevent="onDrop" @change.prevent="onChange">
	<div class="text-large">
		<ShopBoardVue v-if="deck" :deck="deck" />
		<MainPlayerVue v-if="mainPlayer" :player="mainPlayer" />
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import MainPlayerVue from '#p/views/components/Game/Board/MainPlayer.vue'
import ShopBoardVue from '#p/views/components/Game/Board/Shop.vue'

import { loadCards } from '#p/helpers/parse'
import { GameDeck } from '#c/game/Deck.js'
import storage from '#p/models/storage.js'
import { PlayPlayer } from '#c/game/Play.js'

const deck = ref<GameDeck | null>(null)
const mainPlayer = ref<PlayPlayer | null>(null)

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
	deck.value = new GameDeck(cards)
	mainPlayer.value = new PlayPlayer(0, { id: '0', name: 'test' }, 2)
}
</script>
