<template>
	<form class="h-full text-center space-y-2  flex flex-col justify-center" :disabled="isLoading" @submit.prevent="onSubmit">
		<template v-if="isCheckingEmail">
			<h2>Enter your email:</h2>
			<input v-model="inputEmail" v-focus type="email" class="signin-input" placeholder="example@mail.com">
			<button type="submit" class="signin-button-primary">Submit</button>
		</template>
		<template v-else>
			<h2>{{ isNewAccount ? 'Welcome!' : `👋 ${inputEmail}!` }}</h2>
			<template v-if="isNewAccount">
				<h3>Create an account to start playing...</h3>
				<input v-model="inputEmail" type="text" class="signin-input" disabled>
				<input v-model="inputName" v-focus type="text" class="signin-input" placeholder="Player name">
			</template>
			<template v-else>
				<input v-model="inputPasscode" v-focus type="number" class="signin-input" placeholder="1234">
			</template>
			<div class="space-x-2">
				<button type="submit" class="signin-button-primary">Submit</button>
				<button type="button" class="signin-button-secondary" @click="onCancel">Cancel</button>
			</div>
		</template>
	</form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { useStore } from '#p/models/store'

const { commit, state } = useStore()

const inputEmail = ref(state.user.email)
const inputName = ref(state.user.name)
const inputPasscode = ref('')

const emailExists = ref<boolean | undefined>(undefined)

const isLoading = ref(false)
const isCheckingEmail = computed(() => !state.user.email || emailExists.value === undefined)
const isNewAccount = computed(() => emailExists.value === false)

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

<style lang="postcss">
.signin-input {
	@apply mx-auto w-72 border-gray-300 rounded-md text-center;
}
.signin-input:disabled {
	@apply text-gray-400 border-gray-200;
}

.signin-button-primary {
	@apply inline-block mx-auto w-32 h-11 bg-gray-200 rounded-full;
}
.signin-button-secondary {
	@apply inline-block mx-auto w-32 h-11 border-2 border-gray-200 rounded-full;
}
</style>
