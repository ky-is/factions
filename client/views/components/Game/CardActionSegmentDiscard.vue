<template>
	{{ targetsOpponent ? 'opponent' : null }} {{ discard.scraps ? 'scrap' : 'discard' }}{{ targetsOpponent ? 's' : null }} {{ discard.orFewer ? 'up to' : '' }} <CardActionSegmentResource :resource="CardResource.DRAW" :quantity="discard.count" />
</template>

<script setup lang="ts">
import CardActionSegmentResource from '#p/views/components/Game/CardActionSegmentResource.vue'

import { defineProps } from 'vue'

import type { ActionDiscard } from '#c/types/cards.js'
import { CardSource, CardResource } from '#c/types/cards.js'

const props = defineProps<{
	discard: ActionDiscard
}>()

const targetsOpponent = props.discard.targets.includes(CardSource.OPPONENT)
</script>
