<template>
	<ActionSegmentContentVue :predicate="predicate" />
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

import type { ActionPredicate } from '#c/types/cards'

import ActionSegmentContentVue from '#p/views/components/Game/CardActionPredicateContent.vue'

const props = defineProps<{
	predicate: ActionPredicate
}>()
</script>
