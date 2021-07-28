<template>
	<template v-if="conditional === true">
		Optional:
	</template>
	<template v-else>
		if {{ conditional.source === CardSource.SELF ? 'you' : 'opponent' }}
	</template>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

import { CardSource } from '#c/types/cards'
import type { ActionCondition } from '#c/types/cards'

const props = defineProps<{
	conditional: true | ActionCondition
}>()
</script>
