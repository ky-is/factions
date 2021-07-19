import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import './main.postcss'

import App from './App.vue'

import routes from '#p/models/routes'

const router = createRouter({
	history: createWebHistory(),
	routes,
})

createApp(App)
	.use(router)
	.mount('#app')
