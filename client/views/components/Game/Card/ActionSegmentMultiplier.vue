<template>
	for each {{ multiplier.typeFaction }} {{ multiplier.type ?? 'card' }} {{ sourceDesc }}
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

import { ActionActivationPredicate } from '#c/types/cards'
import type { ActionCondition } from '#c/types/cards'

const props = defineProps<{
	multiplier: ActionCondition
}>()

const sourceDesc = props.multiplier.predicate === ActionActivationPredicate.PLAYED
	? 'played'
	: props.multiplier.predicate === ActionActivationPredicate.SCRAPPED_THIS_WAY
		? 'scrapped this way'
		: 'TODO'
</script>
