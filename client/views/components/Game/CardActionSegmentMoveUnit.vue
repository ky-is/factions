<template>
	Put {{ isNextAcquired ? 'the next' : '' }} {{ moveUnit.type }} {{ moveUnit.amount > 1 ? moveUnit.amount : null }} {{ moveUnit.type }} {{ isNextAcquired ? 'you acquire' : 'from your discard pile' }} {{ destinationDesc }}
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

import type { ActionMoveUnit } from '#c/types/cards.js'
import { CardAcquisition, CardDestination } from '#c/types/cards.js'

const props = defineProps<{
	moveUnit: ActionMoveUnit
}>()

const isNextAcquired = props.moveUnit.acquisition === CardAcquisition.NEXT_ACQUIRED
const destinationDesc = props.moveUnit.destination === CardDestination.DECK_TOP ? 'on top of your deck' : 'into play'
</script>
