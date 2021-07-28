<template>
	<BoardVue v-if="cards" :cards="cards" />
	<div v-else>
		<input type="file" @dragover.prevent="onDragOver" @drop.prevent="onDrop" @change.prevent="onChange">
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import BoardVue from '#p/views/components/Game/Board.vue'

import { loadCards } from '#p/helpers/parse'
import type { CardData } from '#c/types/cards'

const cards = ref<CardData[] | null>(null)

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
	cards.value = loadCards(fileText)
}
</script>
