<template>
acquire {{ acquire.maxValue && acquire.maxValue > 1 ? `up to ${acquire.maxValue}` : 'a' }} {{ acquire.type }}
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

import type { ActionAcquire } from '#c/types/cards'

const props = defineProps<{
	acquire: ActionAcquire
}>()
</script>
