let storage: Storage | undefined
{
	const sampleDate = new Date().toString()
	try {
		window.localStorage.setItem(sampleDate, sampleDate)
		window.localStorage.removeItem(sampleDate)
		storage = window.localStorage
	} catch (error) {
		console.error(error)
	}
}

export default {
	get(key: string, defaultValue: string = '') {
		if (storage) {
			const value = storage.getItem(key)
			if (value !== null && value !== 'null') {
				return value
			}
		}
		return defaultValue
	},

	set(key: string, value: any) {
		return storage && storage.setItem(key, value)
	},

	remove(key: string) {
		return storage && storage.removeItem(key)
	},

	// Types

	getBool(key: string, defaultValue: boolean) {
		const item = this.get(key)
		return item !== null ? item == 'true' : defaultValue
	},

	getInt(key: string, defaultValue: number) {
		const raw = this.get(key)
		if (!raw) {
			return defaultValue
		}
		const parsed = parseInt(raw, 10)
		return !isNaN(parsed) ? parsed : defaultValue
	},
}
