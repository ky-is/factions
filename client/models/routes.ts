import Account from '#p/views/pages/Account.vue'
import Home from '#p/views/pages/Home.vue'

export default [
	{
		name: 'Home',
		path: '/',
		component: Home,
	},
	{
		name: 'Account',
		path: '/account',
		component: Account,
	},
]
