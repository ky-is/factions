import { nonEmpty } from '#c/utils.js'

import { APIError } from '#s/helpers/errors.js'

const REGEX_EMAIL = /^\S+@\S+\.\S+$/
const REGEX_PASSCODE = /^\d{4}$/

function process(object: unknown, name: string, regex: RegExp) {
	object = object as Object
	if (object instanceof Object && name in object) {
		const value = (object as Record<string, string | undefined>)[name]?.trim()
		if (nonEmpty(value) && regex.test(value)) {
			return value
		}
	}
	throw new APIError(`Invalid ${name}`, false)
}

export function parseEmail(object: unknown) {
	return process(object, 'email', REGEX_EMAIL)
}

export function parsePasscode(object: unknown) {
	return process(object, 'passcode', REGEX_PASSCODE)
}
