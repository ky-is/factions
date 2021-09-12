<template>
	<ActionSegmentContentVue :predicate="predicate" />
</template>

<script setup lang="ts">
import ActionSegmentContentVue from '#p/views/components/Game/Card/ActionPredicateContent.vue'

import { defineProps } from 'vue'

import type { ActionPredicate } from '#c/types/cards.js'

const props = defineProps<{
	predicate: ActionPredicate
}>()
</script>
