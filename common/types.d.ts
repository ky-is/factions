export interface UserData {
	id: string
	email: string
	name: string
	passcode_at?: number
}

export interface SessionData {
	id: string
}

export interface UserPasscodeData {
	passcode: string
	passcode_tries: number
	passcode_at: number | null
}

export interface SessionData {
	id: string
	user_id: string
}
