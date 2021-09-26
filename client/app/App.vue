<template>
	<main class="select-none" :class="{ container: route.name !== 'Game' && route.name !== 'Test' }">
		<RouterView v-if="route.name === 'Test'" />
		<SignIn v-else-if="!sessionID" />
		<div v-else-if="!isConnected && !currentGame">Loading...</div>
		<RouterView v-else />
	</main>
</template>

<script setup lang="ts">
import SignIn from '#p/views/components/SignIn.vue'

import { computed, watchEffect, onBeforeUnmount, onBeforeMount } from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'

import type { GameData } from '#c/types/data.js'

import { connect, socket } from '#p/models/api.js'
import { useStore } from '#p/models/store.js'

const route = useRoute()
const router = useRouter()
const { state, commit } = useStore()

const isConnected = computed(() => state.connected)

// Connect after signin
const sessionID = computed<string>(() => state.user.sid)
watchEffect(() => {
	if (sessionID.value) {
		connect(sessionID.value)
	}
})

// Auto-enter joined game
const currentGame = computed(() => state.game as GameData | null)
watchEffect(() => {
	const game = currentGame.value
	if (!game) {
		return
	}
	if (game.started) {
		router.push({ name: 'Game', params: {id: game.id} })
	} else {
		router.push({ name: 'Lobby', params: {id: game.id} })
	}
})

// Leave lobby on navigation
router.beforeEach((to, from) => {
	if (from.name === 'Lobby' && state.game != null && from.params.id === state.game.id && to.params.id !== state.game.id) {
		commit.leaveGameLobby(router)
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
