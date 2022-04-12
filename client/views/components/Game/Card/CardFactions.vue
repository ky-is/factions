<template>
<div class="flex">
	<CardFactionVue v-for="faction in factions" :key="faction" :faction="faction" />
</div>
</template>

<script setup lang="ts">
import CardFactionVue from '#p/views/components/Game/Card/CardFaction.vue'

import { defineProps } from 'vue'

import type { CardFaction } from '#c/types/cards'

defineProps<{
	factions: CardFaction[]
}>()
</script>
