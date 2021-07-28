<template>
	<div>
		{{ quantity }} {{ resource }}
	</div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
	resource: string
	quantity: number | undefined
}>()
</script>
