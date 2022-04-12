<template>
{{ discard }}
<template v-if="discard.targets.includes(CardSource.SELF_HAND)">
	<!-- <CardVue v-for="(card, index) in state.game?.currentPlayer().hand" :key="index" :card="card" :index="index" :player="player" :resolver="resolver" :isTurn="isTurn" /> -->
</template>
</template>

<script setup lang="ts">
import CardVue from '#p/views/components/Game/Card/Card.vue'

import { defineProps } from 'vue'

import { CardSource } from '#c/types/cards'
import type { ActionDiscard } from '#c/types/cards'

import type { ResolveCard } from '#p/helpers/ResolveCard'
import { state } from '#p/models/store'

const props = defineProps<{
	resolver: ResolveCard
	discard: ActionDiscard
}>()

function onResolve(index: number) {
	props.resolver.resolveOr(index)
}
</script>
