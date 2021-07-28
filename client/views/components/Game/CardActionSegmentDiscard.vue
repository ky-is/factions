<template>
	{{ targetsOpponent ? 'opponent' : null }} {{ discard.scraps ? 'scrap' : 'discard' }}{{ targetsOpponent ? 's' : null }} {{ discard.orFewer ? 'up to' : '' }} {{ discard.count }} cards
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

import type { ActionDiscard } from '#c/types/cards.js'
import { CardSource } from '#c/types/cards.js'

const props = defineProps<{
	discard: ActionDiscard
}>()

const targetsOpponent = props.discard.targets.includes(CardSource.OPPONENT)
</script>
