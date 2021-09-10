<template>
	<template v-if="conditional === true">
		Optional:
	</template>
	<template v-else>
		If
		{{ conditional.source === CardSource.SELF ? 'you' : 'opponent' }}
		{{ conditional.predicate === ActionActivationPredicate.PLAYED ? 'played' : 'have' }}
		{{ conditional.amount }} {{ conditional.amountMoreLess === 1 ? 'or more' : (conditional.amountMoreLess === -1 ? 'or less' : null) }}
		{{ conditional.type }}
		{{ conditional.predicate === ActionActivationPredicate.PLAYED ? 'this turn' : 'in play' }}:
	</template>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

import { ActionActivationPredicate, CardSource } from '#c/types/cards'
import type { ActionCondition } from '#c/types/cards'

const props = defineProps<{
	conditional: true | ActionCondition
}>()
</script>
