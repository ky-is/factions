export enum CardFaction {
	PINK = 'Pink', GOLD = 'Gold', GREEN = 'Green', BLUE = 'Blue'
}

export enum CardType {
	BASIC, SHIP = 'ship', STATION = 'station', PULSAR = 'Pulsar'
}

export enum CardAcquisition {
	NEXT_ACQUIRED, FROM_DISCARD
}

export enum CardDestination {
	DECK_TOP, PLAY
}

export enum CardSource {
	SELF, SELF_DECK, SELF_HAND, SELF_DISCARD, TRADE, OPPONENT
}

export enum CardResource {
	DRAW = 'draw', ECONOMY = 'economy', DAMAGE = 'damage', HEALING = 'healing'
}

export type CardInt = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
export type CardAmountMoreLess = -1 | 0 | 1

export enum ActionActivation {
	ON_SCRAP, PASSIVE, OPTIONAL
}

export enum PredicateConjunction {
	AND = 'AND', OR = 'OR', EITHER = 'EITHER', IF_END = 'IF_END', CONDITIONAL_END = 'CONDITIONAL_END'
}

interface ActionFleetBonus {
	types: CardType[]
	resource: CardResource
	amount: CardInt
}

export const PREVIOUS_AMOUNT = -1

export enum ActionActivationPredicate {
	PLAYED, IN_PLAY, ANY_IN_PLAY, SCRAPPED_THIS_WAY, SCRAPPED_THIS_TURN
}

export interface ActionCondition {
	predicate: ActionActivationPredicate
	source: CardSource | null
	amount: CardInt
	amountMoreLess: CardAmountMoreLess
	type: CardType | null
	typeFaction: CardFaction | null
}

export interface ActionPredicate {
	children?: ActionPredicate[]
	segments?: ActionSegment[] // eslint-disable-line no-use-before-define
	conjunction?: PredicateConjunction
	conditional?: ActionCondition | true
}

export interface ActionDiscard {
	count: CardInt
	orFewer: boolean
	targets: CardSource[]
	scraps: boolean
}

export interface ActionMoveUnit {
	type: CardType | null
	amount: CardInt
	acquisition: CardAcquisition
	destination: CardDestination
}

export interface ActionAcquire {
	type: CardType | null
	maxValue: CardInt | undefined
	destination: CardSource
}

export interface ActionSegment {
	resources?: {
		damage?: CardInt
		economy?: CardInt
		healing?: CardInt
		draw?: CardInt | typeof PREVIOUS_AMOUNT
	}
	multiplier?: ActionCondition
	destroyStations?: CardInt
	copy?: {
		type?: CardType | null
		predicate?: ActionActivationPredicate
	}
	copyFaction?: boolean
	discard?: ActionDiscard,
	moveUnit?: ActionMoveUnit,
	acquire?: ActionAcquire,
	fleetBonus?: ActionFleetBonus
	alliances?: CardFaction[]
}

export interface CardAction {
	factions?: CardFaction[]
	activation?: ActionActivation
	predicate: ActionPredicate
	raw?: string
}

export interface CardData {
	name: string
	factions: CardFaction[]
	type: CardType
	isShield?: boolean
	defense?: CardInt
	cost?: CardInt
	actions: CardAction[]
}
