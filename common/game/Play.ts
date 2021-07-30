import { GameDeck } from '#c/game/Deck'
import type { GameData, PlayerData } from '#c/types/data'
import type { CardData } from '#c/types/cards'
import { getStartingDeck } from '#c/cards.js'

export class PlayPlayer {
	index: number
	id: string
	name: string
	cards: CardData[]
	hand: CardData[] = []

	constructor(index: number, { id, name }: PlayerData, numberOfPlayers: number) {
		this.index = index
		this.id = id
		this.name = name
		this.cards = getStartingDeck()
		const startAdvantage = index < numberOfPlayers - 1 ? numberOfPlayers - index : 0
		this.dealHand(5 - startAdvantage)
	}

	dealHand(size?: number) {
		this.hand = this.cards.splice(0, size ?? 5)
	}
}

export class PlayGame {
	data: GameData
	deck: GameDeck
	players: PlayPlayer[]

	constructor(gameData: GameData, cards: CardData[]) {
		this.data = gameData
		this.deck = new GameDeck(cards)
		this.players = gameData.players.map((playerData, index) => new PlayPlayer(index, playerData, gameData.players.length))
	}
}
