import type { GameData } from '#c/types/data'

export function isGameFull(gameData: GameData | null) {
	return gameData ? gameData.players.length === gameData.size : false
}

export function isGameHost(gameData: GameData | null, user: {id: string}) {
	return gameData?.host === user.id
}
