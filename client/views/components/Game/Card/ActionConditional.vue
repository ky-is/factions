<template>
<div class="clear w-full" />
<template v-if="c === true">
	Optional:
</template>
<template v-else>
	If
	{{ c.source === CardSource.SELF ? 'you' : 'opponent' }}
	{{ c.predicate === ActionActivationPredicate.PLAYED ? 'played' : 'have' }}
	{{ c.amount }} {{ c.amountMoreLess === 1 ? 'or more' : (c.amountMoreLess === -1 ? 'or less' : null) }}
	{{ c.type }}
	{{ c.predicate === ActionActivationPredicate.PLAYED ? 'this turn' : 'in play' }}:
</template>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

import { ActionActivationPredicate, CardSource } from '#c/types/cards'
import type { ActionCondition } from '#c/types/cards'

const props = defineProps<{
	conditional: ActionCondition | true | Object //TODO remove "| Object", required due to Vue prop type error
}>()

const c = props.conditional as ActionCondition | true
</script>
