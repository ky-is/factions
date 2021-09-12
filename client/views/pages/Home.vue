<template>
	<h2>Home</h2>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useStore } from '#p/models/store.js'

const { state } = useStore()

const isConnected = computed<boolean>(() => state.connected)

watch(isConnected, () => {
	if (isConnected.value) {
		useRouter().push({ name: 'Lobby' })
	}
}, { immediate: true })
</script>
