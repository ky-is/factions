import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import './main.postcss'

import App from './App.vue'

import routes from '#p/models/routes.js'
import { state } from '#p/models/store.js'

const router = createRouter({
	history: createWebHistory(),
	routes,
})

createApp(App)
	.directive('focus', {
		mounted(el) {
			el.focus()
		},
	})
	.use(router)
	.mount('#app')

router.afterEach((to, from) => {
	state.previousRoute = to
})
