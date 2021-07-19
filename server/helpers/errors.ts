export class APIError extends Error {
	cancel: boolean

	constructor(message: string, cancel: boolean) {
		super(message)
		this.name = message
		this.cancel = cancel
	}
}
