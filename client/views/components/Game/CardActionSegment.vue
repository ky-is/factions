<template>
	<div class="flex">
		{{ segment }}
	</div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

import type { ActionSegment } from '#c/types/cards.js'

const props = defineProps<{
	segment: ActionSegment
}>()
props.segment
</script>
