export function isGameFull(gameData: {size: number, players: any[]} | null) {
	return gameData ? gameData.players.length === gameData.size : false
}

export function isGameHost(gameData: {host: string} | null, user: {id: string, name: string}) {
	return gameData?.host === user.id
}
