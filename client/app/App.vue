<template>
	<main class="select-none">
		<SignIn v-if="!sessionID" />
		<div v-else-if="!connected && !currentGame ">
			Loading...
		</div>
		<RouterView v-else />
	</main>
</template>

<script setup lang="ts">
import { computed, watchEffect, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

import SignIn from '#p/views/components/SignIn.vue'

import { connect, socket } from '#p/models/api'
import { useStore } from '#p/models/store'

const router = useRouter()
const { state, commit } = useStore()

const currentGame = computed(() => state.game)
const connected = computed(() => state.connected)
const sessionID = computed(() => state.user.sid)
watchEffect(() => {
	if (sessionID.value) {
		connect(sessionID.value)
	}
})
watchEffect(() => {
	if (currentGame.value) {
		if (currentGame.value.started) {
			router.push({ name: 'Game', params: {id: currentGame.value.id} })
		} else {
			router.push({ name: 'Lobby', params: {id: currentGame.value.id} })
		}
	}
})

onMounted(() => {
	socket.on('lobby-joined', (game) => {
		commit.joinGame(game)
	})
})
onBeforeUnmount(() => {
	socket.off('lobby-joined')
})
</script>
