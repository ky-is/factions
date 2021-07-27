<template>
	<BoardVue v-if="cards" :cards="cards" />
	<div v-else>
		<input type="file" @dragover.prevent="onDragOver" @drop.prevent="onDrop">
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import BoardVue from '#p/views/components/Game/Board.vue'

import { loadCards } from '#p/helpers/parse'
import type { CardData } from '#c/types/cards'

const cards = ref<CardData[] | null>(null)

function onDragOver(event: DragEvent) {
	event.dataTransfer!.dropEffect = 'link';
}
async function onDrop(event: DragEvent) {
	if (!event.dataTransfer) {
		return
	}
  const file = event.dataTransfer.files[0]
	const fileText = await file.text()
	cards.value = loadCards(fileText)
}
</script>
