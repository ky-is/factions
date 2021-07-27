<template>
	<main class="select-none" :class="{ container: route.name !== 'Game' && route.name !== 'Test' }">
		<RouterView v-if="route.name === 'Test'" />
		<SignIn v-else-if="!sessionID" />
		<div v-else-if="!isConnected && !currentGame ">
			Loading...
		</div>
		<RouterView v-else />
	</main>
</template>

<script setup lang="ts">
import { computed, watchEffect, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import SignIn from '#p/views/components/SignIn.vue'

import { connect, socket } from '#p/models/api'
import { useStore } from '#p/models/store'

const route = useRoute()
const router = useRouter()
const { state, commit } = useStore()

const isConnected = computed(() => state.connected)

// Connect after signin
const sessionID = computed(() => state.user.sid)
watchEffect(() => {
	if (sessionID.value) {
		connect(sessionID.value)
	}
})

// Auto-enter joined game
const currentGame = computed(() => state.game)
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
	if (from.name === 'Lobby' && state.game && from.params.id === state.game.id) {
		commit.leaveGameLobby(router)
	}
})

// Listen to lobby
onMounted(() => {
	socket.on('lobby-status', (game) => {
		commit.joinGame(game)
	})
})
onBeforeUnmount(() => {
	socket.off('lobby-status')
})
</script>
