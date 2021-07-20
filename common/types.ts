export interface UserData {
	id: string
	email: string
	name: string
	passcode_at?: number
}

export interface PlayerData {
	id: string
	name: string
}

export interface GameData {
	id: string
	size: number
	host: string
	title?: string
	type?: string
	mode?: string
	players: PlayerData[]
	started: boolean
	finished: boolean
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
