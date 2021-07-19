export interface UserSessionData {
	id: string
	sid: string
	email: string
	name: string
}

export interface UserPasscodeData {
	passcode: string
	passcode_attempts: number
}

export interface SessionData {
	id: string
	user_id: string
}
