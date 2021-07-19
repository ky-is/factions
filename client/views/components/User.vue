<template>
	{{ user?.name }}
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

import { useStore } from '#p/models/store'

const { state } = useStore()

const props = defineProps<{
	id: string
}>()

const user = computed(() => state.users.find(user => user.id === props.id))
</script>
