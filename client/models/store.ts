import { computed, reactive, readonly } from 'vue'

import type { UserSessionData } from '#c/types'

import { emailStatus } from '#p/models/api'
import storage from '#p/models/storage'

export const state = reactive({
	synced: false,
	user: {
		email: storage.get('user.email'),
		id: storage.get('user.id'),
		sid: storage.get('user.sid'),
	} as UserSessionData,
	users: [] as UserSessionData[],
})

export function updateUsers(users: UserSessionData[], onlyAdd: boolean) {
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

const store = {
	state: process.env.NODE_ENV === 'production' ? state : readonly(state),

	commit: {
		async emailStatus(email: string) {
			try {
				const response = await emailStatus(email)
				console.log(response)
			} catch (error) {
				console.log(error)
			}
		},
	},
}

export function useStore() {
	return store
}
