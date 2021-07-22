<template>
	<div class="flex">
		<div>Scouts</div>
		<div v-for="card in 5" :key="card">
			{{ card }}
		</div>
		<div>Deck</div>
		<div>Scrap</div>
	</div>
</template>

<script setup lang="ts">
import { useStore } from '#p/models/store'

const { state } = useStore()
</script>
