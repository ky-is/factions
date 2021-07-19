<template>
	<div class="h-full text-center space-y-2  flex flex-col justify-center">
		<h2>Enter your email:</h2>
		<input v-model="inputEmail" type="email" class="mx-auto w-72 border-gray-300 rounded-md text-center" placeholder="example@mail.com">
		<button type="submit" class="mx-auto w-32 h-11 bg-gray-100 rounded-full" @click="onSubmit">Submit</button>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useStore } from '#p/models/store'

const { commit, state } = useStore()

const inputEmail = ref(state.user.email)

function onSubmit() {
	commit.emailStatus(inputEmail.value)
}
</script>
