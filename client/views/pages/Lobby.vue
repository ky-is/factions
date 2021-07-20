<template>
	<h2>Lobby</h2>
	<template v-if="game">
		<h3>{{ game.id }}</h3>
		<div v-for="player in game.players" :key="player.id">
			{{ player.name }}
		</div>
		<button class="button-primary" :disabled="isHost && isFull" @click="onStart">Start</button>
	</template>
	<template v-else>
		<div v-for="lobbyGame in lobbyGames" :key="lobbyGame.id">
			{{ game }}
		</div>
		<button class="button-primary" @click="onCreate">Create game</button>
	</template>
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted, onBeforeUnmount, computed } from 'vue'

import type { GameData } from '#c/types'
import { isGameFull, isGameHost } from '#c/game'

import { socket } from '#p/models/api'
import { useStore } from '#p/models/store'

const { state } = useStore()
const isHost = computed(() => isGameHost(state.game as GameData, state.user))
const isFull = computed(() => isGameFull(state.game as GameData))

const props = defineProps<{
	id: string
}>()

const game = computed(() => state.game)

const lobbyGames = ref<GameData[]>([])

onMounted(() => {
	socket.emit('lobby-join', props.id && !game.value ? props.id : true)
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

function onStart() {
	socket.emit('lobby-start')
}
</script>
