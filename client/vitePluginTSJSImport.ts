import type { PluginOption } from 'vite'

export default function (): PluginOption {
	return {
		name: 'vite-plugin-ts-import',
		resolveId(id) {
			return id.endsWith('.js') ? id.slice(0, -3) : id
		},
	}
}
