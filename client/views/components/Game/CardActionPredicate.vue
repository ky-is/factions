<template>
	<div class="flex">
		<ActionSegmentContentVue :predicate="predicate" />
	</div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

import type { ActionPredicate } from '#c/types/cards.js'

import ActionSegmentContentVue from '#p/views/components/Game/CardActionPredicateContent.vue'

const props = defineProps<{
	predicate: ActionPredicate
}>()
</script>
