<template>
	<input type="file" @dragover.prevent="onDragOver" @drop.prevent="onDrop" @change.prevent="onChange">
	<div class="text-large">
		<BoardVue v-if="deck" :deck="deck" />
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import BoardVue from '#p/views/components/Game/Board.vue'

import { loadCards } from '#p/helpers/parse'
import { GameDeck } from '#c/game/Deck.js'
import storage from '#p/models/storage.js'

const saved = storage.get('TEST')
const deck = ref<GameDeck | null>(saved ? createDeck(saved) : null)

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
	deck.value = createDeck(fileText)
}

function createDeck(raw: string) {
	const cards = loadCards(raw)
	return new GameDeck(cards)
}
</script>
