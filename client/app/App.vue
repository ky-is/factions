<template>
	<main class="select-none">
		<SignIn v-if="!sessionID" />
		<RouterView v-else />
	</main>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'

import SignIn from '#p/views/components/SignIn.vue'

import { connect } from '#p/models/api'
import { useStore } from '#p/models/store'

const { state } = useStore()

const sessionID = computed(() => state.user.sid)
watchEffect(() => {
	if (sessionID.value) {
		connect(sessionID.value)
	}
})
</script>
