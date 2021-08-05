import type { PRNG } from '#c/types/external'

export const TESTING = process.env.NODE_ENV !== 'production'

export const SECONDS_IN_MINUTE = 60
export const SECONDS_IN_HOUR = 60 * SECONDS_IN_MINUTE
export const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR

export function now() {
	return Math.round(Date.now() / 1000)
}

export function containsAll<T>(all: T[], checks: T[]) {
	for (const check of checks) {
		if (!all.includes(check)) {
			return false
		}
	}
	return true
}
export function containsAtLeastOne<T>(all: T[], checks: T[]) {
	for (const check of checks) {
		if (all.includes(check)) {
			return true
		}
	}
	return false
}

// Random

function randomIndex(rng: PRNG, length: number) {
	return Math.floor(rng() * length)
}

export function randomRange(min: number, max: number) {
	return Math.floor(Math.random() * (max - min)) + min
}

export function shuffle<T>(rng: PRNG, array: T[]) {
	for (let i = array.length - 1; i > 0; i -= 1) {
		const j = randomIndex(rng, i + 1)
		const temp = array[i]
		array[i] = array[j]
		array[j] = temp
	}
	return array
}

export function randomItem<T>(rng: PRNG, array: T[]) {
	const length = array.length
	return length ? array[randomIndex(rng, length)] : null
}
