<template>
	<ul>
		<li v-for="userID in ids" :key="userID" class="inline comma-separated">
			<User :id="userID" />
		</li>
	</ul>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

import User from '#p/views/components/User.vue'

defineProps<{
	ids: readonly string[]
}>()
</script>
