<template>
<ul>
	<li v-for="userID in ids" :key="userID" class="inline comma-separated">
		<User :id="userID" />
	</li>
</ul>
</template>

<script setup lang="ts">
import User from '#p/views/components/User.vue'

import { defineProps } from 'vue'

defineProps<{
	ids: readonly string[]
}>()
</script>
