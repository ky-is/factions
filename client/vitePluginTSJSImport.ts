import type { PluginOption } from 'vite'

export default function (): PluginOption {
	return {
		name: 'vite-plugin-ts-import',
		resolveId: (id, source) => {
			return id.includes('commonjsHelpers') ? id : id.replace('.js', '.ts')
		},
	}
}
