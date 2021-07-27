<template>
	<BoardVue :cards="sampleCards" />
</template>

<script setup lang="ts">
import BoardVue from '#p/views/components/Game/Board.vue'

import { sampleCards } from '#p/helpers/parseSample'
</script>
