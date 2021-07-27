import type { RouteLocation } from 'vue-router'

import Account from '#p/views/pages/Account.vue'
import Game from '#p/views/pages/Game.vue'
import Home from '#p/views/pages/Home.vue'
import Lobby from '#p/views/pages/Lobby.vue'
import Test from '#p/views/pages/Test.vue'

export default [
	{
		name: 'Home',
		path: '/',
		component: Home,
	},
	{
		name: 'Lobby',
		path: '/lobby/:id?',
		component: Lobby,
		props: (route: RouteLocation) => ({ id: route.params.id }),
	},
	{
		name: 'Game',
		path: '/game/:id',
		component: Game,
		props: (route: RouteLocation) => ({ id: route.params.id }),
	},
	{
		name: 'Account',
		path: '/account',
		component: Account,
	},

	{
		name: 'Test',
		path: '/test',
		component: Test,
	},
]
