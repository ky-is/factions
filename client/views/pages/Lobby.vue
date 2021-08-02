<template>
	<h2>Lobby</h2>
	<template v-if="currentGame">
		<h3>{{ currentGame.title }}</h3>
		<div>{{ currentGame.players.length }} / {{ currentGame.size }}</div>
		<div v-for="player in currentGame.players" :key="player.id">
			{{ player.name }}
		</div>
		<button v-if="isHost" class="button-primary" :disabled="!isFull" @click="onStart">Start</button>
		<button class="button-secondary" @click="onLeave">Leave</button>
	</template>
	<template v-else>
		<div v-for="lobbyGame in lobbyGames" :key="lobbyGame.id">
			<h3>{{ lobbyGame.title }}</h3>
			<div>{{ lobbyGame.players.length }} / {{ lobbyGame.size }}</div>
			<span v-for="player in lobbyGame.players" :key="player.id" class="player-name">
				{{ player.name }}
			</span>
			<button v-if="!lobbyGame.started" class="button-primary" :disabled="isGameFull(lobbyGame)" @click="onJoin(lobbyGame)">Join</button>
		</div>
		<button class="button-primary" @click="onCreate">Create game</button>
	</template>
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'

import type { GameData } from '#c/types/data'
import { isGameFull, isGameHost } from '#c/game'

import { ioLobbyJoin } from '#p/helpers/bridge'
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
	ioLobbyJoin(router, props.id && !currentGame.value ? props.id : true)
	socket.on('lobby-games', (games) => {
		lobbyGames.value = games
	})
})
onBeforeUnmount(() => {
	ioLobbyJoin(router, false)
	socket.off('lobby-games')
})

function onCreate() {
	socket.emit('lobby-create')
}

function onJoin(game: GameData) {
	ioLobbyJoin(router, game.id)
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
