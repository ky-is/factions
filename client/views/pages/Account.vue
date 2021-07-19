<template>
	<div class="space-y-4">
		<h2>Account</h2>
		{{ name }}
	</div>
</template>

<script setup lang="ts">
import { useStore } from '#p/models/store'

const { state } = useStore()

const name = state.user.name
</script>
