<template>
	<input type="file" @dragover.prevent="onDragOver" @drop.prevent="onDrop" @change.prevent="onChange">
	<GameBoard v-if="data && cards" :data="data" :cards="cards" />
</template>

<script setup lang="ts">
import GameBoard from '#p/views/components/Game/Board/GameBoard.vue'

import { shallowRef } from 'vue'

import { loadCards } from '#c/cards/parse.js'
import type { GameData } from '#c/types/data.js'
import type { CardData } from '#c/types/cards.js'

import storage from '#p/models/storage.js'
import { state } from '#p/models/store.js'

const cards = shallowRef<CardData[] | null>(null)
const data = shallowRef<GameData | null>(null)

const saved: string = storage.get('TSV')
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
	storage.set('TSV', fileText)
	updateDeck(fileText)
}

function updateDeck(raw: string) {
	cards.value = loadCards(raw)
	data.value = { id: 'TEST', title: 'test', type: 'factions', size: 2, host: state.user.id, started: true, hasCards: true, cards: raw, finished: false, players: [{id: state.user.id, name: 'me'}, {id: '1', name: 'oppo'}] }
}
</script>
