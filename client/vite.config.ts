import path from 'path'
// import { defineConfig } from 'vite'

import PluginVue from '@vitejs/plugin-vue'
import PluginTSJSImport from './vitePluginTSJSImport'

export default {
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
			'#c/': path.join(path.resolve(), 'common', path.sep),
			'#p/': path.join(path.resolve(), 'client', path.sep),
		},
	},
	define: {
		__VUE_OPTIONS_API__: false,
	},
	plugins: [
		PluginTSJSImport(),
		PluginVue(),
	],
}
