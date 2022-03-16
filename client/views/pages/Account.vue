<template>
	<div class="space-y-4">
		<h2>Account</h2>
		{{ name }}
	</div>
</template>

<script setup lang="ts">
import { state } from '#p/models/store.js'

const name = state.user.name
</script>
