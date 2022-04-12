<template>
<time :datetime="date.toISOString()" class="italic">{{ date.toLocaleString() }}</time>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
	timestamp: number
}>()

const date = new Date(props.timestamp * 1000)
</script>
