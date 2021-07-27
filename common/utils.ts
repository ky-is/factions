export const SECONDS_IN_MINUTE = 60
export const SECONDS_IN_HOUR = 60 * SECONDS_IN_MINUTE
export const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR

export function now() {
	return Math.round(Date.now() / 1000)
}

// Random

function randomIndex(length: number) {
	return Math.floor(Math.random() * length)
}

export function randomRange(min: number, max: number) {
	return Math.floor(Math.random() * (max - min)) + min
}

export function shuffle<T>(array: T[]) {
	for (let i = array.length - 1; i > 0; i -= 1) {
		const j = randomIndex(i + 1)
		const temp = array[i]
		array[i] = array[j]
		array[j] = temp
	}
	return array
}

export function randomItem<T>(array: T[]) {
	const length = array.length
	return length ? array[randomIndex(length)] : null
}
