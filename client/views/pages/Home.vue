<template>
<h2>Home</h2>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'

import { state } from '#p/models/store'

const isConnected = computed(() => state.connected)

watch(isConnected, () => {
	if (isConnected.value) {
		useRouter().push({ name: 'Lobby' })
	}
}, { immediate: true })
</script>
