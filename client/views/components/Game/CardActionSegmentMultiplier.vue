<template>
	for each {{ multiplier.typeFaction }} {{ multiplier.type }} {{ sourceDesc }}
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

import { ActionActivationPredicate } from '#c/types/cards.js'
import type { ActionCondition } from '#c/types/cards.js'

const props = defineProps<{
	multiplier: ActionCondition
}>()

const sourceDesc = props.multiplier.predicate === ActionActivationPredicate.PLAYED
	? 'played'
	: props.multiplier.predicate === ActionActivationPredicate.SCRAPPED_THIS_WAY
		? 'scrapped this way'
		: 'TODO'
</script>
