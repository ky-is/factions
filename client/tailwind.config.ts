module.exports = {
	content:[
		'./client/**/*.{html,postcss,js,ts,vue}',
	],
	plugins: [
		require('@tailwindcss/forms'),
	],
	theme: {
		container: {
			center: true,
			padding: '1rem',
		},
	},
}
