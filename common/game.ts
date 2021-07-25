import type { GameData } from '#c/types/data.js'

export function isGameFull(gameData: GameData | null) {
	return gameData ? gameData.players.length === gameData.size : false
}

export function isGameHost(gameData: GameData | null, user: {id: string}) {
	return gameData?.id === user.id
}
