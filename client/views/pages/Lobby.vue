<template>
	<h2>Lobby</h2>
	<template v-if="currentGame">
		<h3>{{ currentGame.title }}</h3>
		<div>{{ currentGame.players.length }} / {{ currentGame.size }}</div>
		<div v-for="player in currentGame.players" :key="player.id">
			{{ player.name }}
		</div>
		<button class="button-primary" :disabled="isHost && isFull" @click="onStart">Start</button>
		<button class="button-secondary" @click="onLeave">Leave</button>
	</template>
	<template v-else>
		<div v-for="lobbyGame in lobbyGames" :key="lobbyGame.id">
			<h3>{{ lobbyGame.title }}</h3>
			<div>{{ lobbyGame.players.length }} / {{ lobbyGame.size }}</div>
			<span v-for="player in lobbyGame.players" :key="player.id" class="player-name">
				{{ player.name }}
			</span>
			<button class="button-primary" :disabled="isFull" @click="onJoin(lobbyGame)">Join</button>
		</div>
		<button class="button-primary" @click="onCreate">Create game</button>
	</template>
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'

import type { GameData } from '#c/types/data'
import { isGameFull, isGameHost } from '#c/game'

import { socket } from '#p/models/api'
import { commit, useStore } from '#p/models/store'

const router = useRouter()

const { state } = useStore()
const isHost = computed(() => isGameHost(state.game as GameData, state.user))
const isFull = computed(() => isGameFull(state.game as GameData))

const props = defineProps<{
	id?: string
}>()

const currentGame = computed(() => state.game)

const lobbyGames = ref<GameData[]>([])

onMounted(() => {
	socket.emit('lobby-join', props.id && !currentGame.value ? props.id : true)
	socket.on('lobby-games', (games) => {
		lobbyGames.value = games
	})
})
onBeforeUnmount(() => {
	socket.emit('lobby-join', false)
	socket.off('lobby-games')
})

function onCreate() {
	socket.emit('lobby-create')
}

function onJoin(game: GameData) {
	socket.emit('lobby-join', game.id)
}

function onStart() {
	socket.emit('lobby-start')
}

function onLeave() {
	commit.leaveGameLobby(router)
}
</script>

<style scoped lang="postcss">
.player-name ~ .player-name::before {
	content: ', ';
}
</style>
