import type { GameData, UserData } from '#c/types.js'

export function isGameFull(gameData: GameData | null) {
	return gameData ? gameData.players.length === gameData.size : false
}

export function isGameHost(gameData: GameData | null, user: UserData) {
	return gameData?.id === user.id
}
