<template>
	<h2>Lobby</h2>
	<template v-if="currentGame">
		<h3>{{ currentGame.title }}</h3>
		<div>{{ currentGame.players.length }} / {{ currentGame.size }}</div>
		<div v-for="player in currentGame.players" :key="player.id">
			{{ player.name }}
		</div>
		<div v-if="isHost" class="my-2">
			{{ currentGame.hasCards ? '✅' : (loadingCards ? '🟡' : '⚠️') }}
			<input type="file" @dragover.prevent="onFileDragOver" @drop.prevent="onFileDrop" @change.prevent="onFileChange">
		</div>
		<button v-if="isHost && currentGame.hasCards" class="button-primary" :disabled="!isFull" @click="onStart">Start</button>
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
import { defineProps, computed, ref, onBeforeMount, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'

import { TESTING } from '#c/utils.js'

import type { GameData } from '#c/types/data.js'
import { isGameFull, isGameHost } from '#c/game/utils.js'

import { ioLobbyJoin } from '#p/helpers/bridge.js'
import { socket } from '#p/models/api.js'
import storage from '#p/models/storage.js'
import { commit, useStore } from '#p/models/store.js'

const router = useRouter()

const { state } = useStore()
const isHost = computed(() => isGameHost(state.game as GameData, state.user))
const isFull = computed(() => isGameFull(state.game as GameData))

watch(isHost, (isHost) => {
	if (isHost) {
		const saved = storage.get('TSV')
		if (saved.length > 0) {
			console.log('host', isHost, saved.length)
			updateDeck(saved)
		}
	}
})

const props = defineProps<{
	id?: string
}>()

const currentGame = computed(() => state.game as GameData | null)

const lobbyGames = ref<GameData[]>([])

onBeforeMount(() => {
	ioLobbyJoin(router, props.id != null && !currentGame.value ? props.id : true)
	socket.on('lobby-games', (games) => {
		lobbyGames.value = games
	})
	if (TESTING && !currentGame.value) {
		socket.emit('lobby-autojoin')
	}
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

// File select

const loadingCards = ref(false)

function onFileDragOver(event: DragEvent) {
	event.dataTransfer!.dropEffect = 'link'
}

function onFileDrop(event: DragEvent) {
	if (!event.dataTransfer) {
		return
	}
	handleFiles(event.dataTransfer.files)
}

function onFileChange(event: Event) {
	const target = event.target
	if (!target) {
		return
	}
	handleFiles((target as any).files)
}

async function handleFiles(files: FileList) {
	const fileText = await files[0].text()
	storage.set('TSV', fileText)
	updateDeck(fileText)
}

function updateDeck(raw: string) {
	loadingCards.value = true
	socket.emit('lobby-tsv', raw)
}
</script>

<style scoped lang="postcss">
.player-name ~ .player-name::before {
	content: ', ';
}
</style>
