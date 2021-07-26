import path from 'path'

import PluginTSJSImport from './vitePluginTSJSImport'

import { defineConfig } from 'vite'
import PluginVue from '@vitejs/plugin-vue'

export default defineConfig({
	root: 'client',
	build: {
		outDir: '../~$dist/public',
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
})
