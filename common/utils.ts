export const SECONDS_IN_MINUTE = 60
export const SECONDS_IN_HOUR = 60 * SECONDS_IN_MINUTE
export const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR

export function randomRange(min: number, max: number) {
	return Math.floor(Math.random() * (max - min)) + min
}

export function now() {
	return Math.round(Date.now() / 1000)
}
