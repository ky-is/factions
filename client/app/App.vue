<template>
	<main class="select-none" :class="{ container: route.name !== 'Game' && route.name !== 'Test' }">
		<RouterView v-if="route.name === 'Test'" />
		<SignIn v-else-if="!state.user.sid" />
		<div v-else-if="!state.connected && !state.gameData">Loading...</div>
		<RouterView v-else />
	</main>
</template>

<script setup lang="ts">
import SignIn from '#p/views/components/SignIn.vue'

import { watchEffect, onBeforeUnmount, onBeforeMount } from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'

import type { GameData } from '#c/types/data'

import { connect, socket } from '#p/models/api'
import { state, commit } from '#p/models/store'

const route = useRoute()
const router = useRouter()

// Connect after signin
watchEffect(() => {
	if (state.user.sid) {
		connect(state.user.sid)
	}
})

// Auto-enter joined game
watchEffect(() => {
	const game = state.gameData
	if (!game) {
		return
	}
	if (game.started) {
		router.push({ name: 'Game', params: {id: game.id} })
	} else {
		router.push({ name: 'Lobby', params: {id: game.id} })
	}
})

// Listen to lobby
onBeforeMount(() => {
	socket.on('lobby-status', (game: GameData) => {
		commit.joinGame(game, router)
	})
})
onBeforeUnmount(() => {
	socket.off('lobby-status')
})
</script>
