import { computed, reactive, readonly } from 'vue'
import type { Router, RouteLocationNormalized } from 'vue-router'

import type { GameData, UserData, SessionData } from '#c/types/data'

import { emailStatus, registerEmail, signinPasscode, socket } from '#p/models/api'
import storage from '#p/models/storage'

export const state = reactive({
	connected: false,
	previousRoute: null as RouteLocationNormalized | null,
	user: {
		email: storage.get('user.email'),
		id: storage.get('user.id'),
		name: storage.get('user.name'),
		sid: storage.get('user.sid'),
	},
	game: null as GameData | null,
	users: [] as UserData[],
})

export function updateUsers(users: UserData[], onlyAdd: boolean) {
	if (onlyAdd) {
		const stateUsers = state.users
		for (const user of users) {
			const index = stateUsers.findIndex((stateUser) => stateUser.id === user.id)
			if (index) {
				stateUsers[index] = user
			} else {
				stateUsers.push(user)
			}
		}
	} else {
		state.users = users
	}
}

function processSignin({ user, session }: { user: UserData, session: SessionData }) {
	state.user.id = user.id
	state.user.name = user.name
	state.user.sid = session.id
	state.user.sid = session.id
	storage.set('user.id', user.id)
	storage.set('user.name', user.name)
	storage.set('user.sid', session.id)
}

export const commit = {
	connected(connected: boolean) {
		state.connected = connected
	},
	cancelSignin() {
		state.user.email = ''
		storage.remove('user.email')
	},

	async emailStatus(email: string) {
		try {
			const response = await emailStatus(email)
			state.user.email = response.email
			storage.set('user.email', response.email)
			return response.exists
		} catch (error) {
			if (error) { console.log(error) }
			return false
		}
	},

	async registerEmail(email: string, name: string) {
		try {
			const response = await registerEmail(email, name)
			console.log(response)
			processSignin(response)
		} catch (error) {
			if (error) { console.log(error) }
		}
	},

	async signinPasscode(email: string, passcode: string) {
		try {
			const response = await signinPasscode(email, passcode)
			console.log(response)
			processSignin(response)
		} catch (error) {
			if (error) { console.log(error) }
		}
	},

	// Game

	joinGame(game: GameData | null) {
		state.game = game
	},

	leaveGameLobby(router: Router) {
		socket.emit('lobby-join', true)
		state.game = null
		if (state.previousRoute?.name === 'Lobby' && !state.previousRoute.params.id) {
			router.back()
		} else {
			router.replace({ name: 'Lobby' })
		}
	},
}

const store = {
	state: process.env.NODE_ENV === 'production' ? state : readonly(state),
	commit,
}

export function useStore() {
	return store
}
