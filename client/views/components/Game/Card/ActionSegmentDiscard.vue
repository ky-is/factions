<template>
	{{ targetsOpponent ? 'opponent' : null }} {{ discard.scraps ? 'scrap' : 'discard' }}{{ targetsOpponent ? 's' : null }} {{ discard.orFewer ? 'up to' : '' }}
	<ActionSegmentResource :resource="CardResource.DRAW" :quantity="discard.count" />
	{{ targetDescription ? 'from ' + targetDescription : null }}
</template>

<script setup lang="ts">
import ActionSegmentResource from '#p/views/components/Game/Card/ActionSegmentResource.vue'

import { defineProps } from 'vue'

import type { ActionDiscard } from '#c/types/cards.js'
import { CardSource, CardResource } from '#c/types/cards.js'

const props = defineProps<{
	discard: ActionDiscard
}>()

const targetsOpponent = props.discard.targets.includes(CardSource.OPPONENT)
const targetDescription = props.discard.targets.length === 1
	? props.discard.targets[0] === CardSource.SELF || props.discard.targets[0] === CardSource.OPPONENT
		? null
		: props.discard.targets[0]
	: props.discard.targets.join(' or ')
</script>
