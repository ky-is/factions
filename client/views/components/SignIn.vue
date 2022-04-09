<template>
	<form class="h-full text-center space-y-2  flex flex-col justify-center" :disabled="isLoading" @submit.prevent="onSubmit">
		<template v-if="isCheckingEmail">
			<h2>Enter your email:</h2>
			<input v-model="inputEmail" v-focus type="email" class="input-primary" placeholder="example@mail.com">
			<button type="submit" class="button-primary">Submit</button>
		</template>
		<template v-else>
			<h2>{{ isNewAccount ? 'Welcome!' : `👋 ${inputEmail}!` }}</h2>
			<template v-if="isNewAccount">
				<h3>Create an account to start playing...</h3>
				<input v-model="inputEmail" type="text" class="input-primary" disabled>
				<input v-model="inputName" v-focus type="text" class="input-primary" placeholder="Player name">
			</template>
			<template v-else>
				<input v-model="inputPasscode" v-focus type="number" class="input-primary" placeholder="1234">
			</template>
			<div class="space-x-2">
				<button type="submit" class="button-primary">Submit</button>
				<button type="button" class="button-secondary" @click="onCancel">Cancel</button>
			</div>
		</template>
	</form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import type { UserData } from '#c/types/data'

import { state, commit } from '#p/models/store'

const inputEmail = ref(state.user.email)
const inputName = ref(state.user.name)
const inputPasscode = ref('')

const emailExists = ref<boolean | undefined>(undefined)

const isLoading = ref(false)
const isCheckingEmail = computed(() => {
	const user = state.user as UserData
	return !user.email || emailExists.value === undefined
})
const isNewAccount = computed(() => emailExists.value !== true)

function onCancel() {
	inputEmail.value = ''
	commit.cancelSignin()
}

async function onSubmit() {
	isLoading.value = true
	if (isCheckingEmail.value) {
		emailExists.value = await commit.emailStatus(inputEmail.value)
	} else if (isNewAccount.value) {
		await commit.registerEmail(state.user.email, inputName.value)
	} else {
		await commit.signinPasscode(state.user.email, inputPasscode.value)
	}
	isLoading.value = false
}
</script>
