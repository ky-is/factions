import { defineConfig } from 'vite'

import tsconfigPaths from 'vite-tsconfig-paths'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
	root: 'client',
	build: {
		outDir: '../~$dist/public',
		reportCompressedSize: false,
	},
	server: {
		port: 3100,
		proxy: {
			'^/api': {
				target: 'http://localhost:3101',
				changeOrigin: true,
			},
		},
	},
	resolve: {
		alias: {
			'socket.io-client': 'socket.io-client/dist/socket.io.js',
		},
	},
	define: {
		__VUE_OPTIONS_API__: false,
	},
	plugins: [
		tsconfigPaths({ loose: true }),
		vue(),
	],
})
