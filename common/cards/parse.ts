import { ActionActivation, CardResource, CardFaction, CardType, PredicateConjunction, CardSource, CardAcquisition, CardDestination, PREVIOUS_AMOUNT, ActionActivationPredicate } from '#c/types/cards'
import type { CardAction, CardData, CardInt, ActionSegment, ActionPredicate, CardAmountMoreLess, ActionCondition } from '#c/types/cards'
import { nonEmpty } from '#c/utils'

const translateFactions: Record<string, CardFaction> = {
	'green': CardFaction.GREEN,
	'blob': CardFaction.GREEN,
	'red': CardFaction.PINK,
	'machine cult': CardFaction.PINK,
	'yellow': CardFaction.GOLD,
	'star empire': CardFaction.GOLD,
	'blue': CardFaction.BLUE,
	'trade federation': CardFaction.BLUE,
}

const translateResources: Record<string, CardResource> = {
	'cards': CardResource.DRAW,
	'trade': CardResource.ECONOMY,
	'combat': CardResource.DAMAGE,
	'authority': CardResource.HEALING,
}

const translateTypes: Record<string, CardType> = {
	'ship': CardType.SHIP,
	'base': CardType.STATION,
}

function translate<Result>(label: string, row: string[], raw: string, translation: Record<string, Result>) {
	if (!raw) {
		return []
	}
	return raw
		.toLowerCase()
		.split('/')
		.map(entry => {
			const translated = translation[entry.trim()]
			if (translated === undefined) {
				console.error('Card: Unknown translation', label, entry, translated, row)
			}
			return translated
		})
}

function parseCardInt(row: string[], raw: string | null | undefined) {
	if (!nonEmpty(raw)) {
		return undefined
	}
	const number = parseInt(raw, 10)
	if (isNaN(number)) {
		console.error(`Card: Invalid int "${raw}"`, row)
		return null
	}
	if (number < 1 || number > 20) {
		return null
	}
	return number as CardInt
}

const REGEX_ACTIVATION_MARKER = /{(.+?)}: /

const ALLY_MARKER = 'ally'
const SCRAP_MARKER = 'scrap'
const PASSIVE_MARKER = 'passive'

function test(raw: string, regex: RegExp) {
	const match = raw.match(regex)
	if (match) {
		return [ raw.replace(match[0], '').trim(), match[1], match[2], match[3], match[4], match[5] ]
	}
	return []
}

function getDescInt(raw: string) {
	return parseInt(raw, 10) as CardInt
}

function getDescMoreLess(raw: string): CardAmountMoreLess {
	return raw === '+'
		? 1
		: raw === '0'
			? -1
			: 0
}

function getDescType(raw: string) {
	return raw === 'ship'
		? CardType.SHIP
		: raw === 'base'
			? CardType.STATION
			: raw === 'explorer'
				? CardType.PULSAR
				: null
}
function getDescFaction(raw: string) {
	return raw === 'blob'
		? CardFaction.GREEN
		: raw === 'trade federation'
			? CardFaction.GOLD
			: raw === 'machine cult'
				? CardFaction.PINK
				: raw === 'star empire'
					? CardFaction.BLUE
					: null
}

function getForEachPredicate(raw:string) {
	return raw === 'scrapped this way'
		? ActionActivationPredicate.SCRAPPED_THIS_WAY
		: raw.includes('scrapped this turn')
			? ActionActivationPredicate.SCRAPPED_THIS_TURN
			: ActionActivationPredicate.PLAYED
}

function parseActionSegment(raw: string) {
	// console.log(raw) //SAMPLE
	const result: ActionSegment = {
		resources: {},
	}
	while (raw) {
		const [ newRaw, modifier, amount, rawResource ] = test(raw, /{(\+|-)(\d+) (\w+?)}/)
		if (newRaw === undefined || newRaw === raw) {
			break
		}
		if (modifier === '+') {
			const resource = translateResources[rawResource]
			if (resource) {
				if (!result.resources) {
					result.resources = {}
				}
				(result.resources as any)[resource] = parseInt(amount, 10)
			} else {
				console.error('rawResource', rawResource)
			}
		} else {
			console.error('UNKNOWN MODIFIER', modifier, amount, rawResource)
		}
		raw = newRaw
	}
	while (raw) {
		const [ newRaw, amount, rawResource ] = test(raw, /gain {(\d+) (\w+?)}/)
		if (newRaw === undefined || newRaw === raw) {
			break
		}
		const resource = translateResources[rawResource]
		if (resource) {
			(result.resources as any)[resource] = parseInt(amount, 10)
		} else {
			console.error('rawResource', rawResource)
		}
		raw = newRaw
	}

	{
		const [ newRaw ] = test(raw, /draw = cards/)
		if (newRaw !== undefined) {
			raw = newRaw
			result.resources!.draw = PREVIOUS_AMOUNT
		}
	}
	{
		const [ newRaw, amountDesc ] = test(raw, /destroy (\d+|) ?target bases?/)
		if (newRaw !== undefined) {
			raw = newRaw
			result.destroyStations = amountDesc ? getDescInt(amountDesc) : 1
		}
	}
	{
		const [ newRaw, amountDesc, unitDesc, costDesc, costAmountDesc, putDesc, deckDesc ] = test(raw, /acquire (a|any|\d+) (explorer|ships?\/base|ship|base|card)s? (without paying its cost|for free|of cost) ?(\d*) ?(and put it|and put them both|) ?(your hand|on top of your deck|)/)
		if (newRaw !== undefined) {
			raw = newRaw
			result.acquire = {
				type: getDescType(unitDesc),
				maxValue: costAmountDesc ? getDescInt(costAmountDesc) : undefined,
				destination: deckDesc === 'your hand'
					? CardSource.SELF_HAND
					: CardSource.SELF_DECK,
			}
		}
	}
	{
		const [ newRaw, allies ] = test(raw, /thiscard counts as an ally for (all) factions/)
		if (newRaw !== undefined) {
			raw = newRaw
			if (allies === 'all') {
				result.alliances = [ CardFaction.GREEN, CardFaction.PINK, CardFaction.BLUE, CardFaction.GOLD ]
			}
		}
	}
	{
		const [ newRaw, amountDesc, unitDesc, targetDesc, acquisitionDesc ] = test(raw, /put (the next|\d+) (ship|base|ships?\/base)s? (you|from your) (acquire this turn|discard pile) on top of your deck/)
		if (newRaw !== undefined) {
			raw = newRaw
			result.moveUnit = {
				type: getDescType(unitDesc),
				amount: getDescInt(amountDesc) ?? 1,
				acquisition: acquisitionDesc === 'acquire this turn' ? CardAcquisition.NEXT_ACQUIRED : CardAcquisition.FROM_DISCARD,
				destination: CardDestination.DECK_TOP,
			}
		}
	}
	{
		const [ newRaw, unitDesc, activations ] = test(raw, /copy another (ship|base|card) (you've played this turn)/)
		if (newRaw !== undefined) {
			raw = newRaw
			if (!result.copy) {
				result.copy = {}
			}
			result.copy.type = getDescType(unitDesc)
			result.copy.predicate = ActionActivationPredicate.PLAYED
		}
	}
	{
		const [ newRaw, unitDesc, factionDesc ] = test(raw, /thiscard has that (ship|base|card)'s faction in addition to (blob|machine cult|star empire|trade federation)/)
		if (newRaw !== undefined) {
			raw = newRaw
			result.copyFaction = true
		}
	}
	{
		const [ newRaw, typeDesc, amount, resourceDesc ] = test(raw, /all of your (ship|base|card)s get \+(\d+) (combat|economy|healing)/)
		if (newRaw !== undefined) {
			raw = newRaw
			const resource = resourceDesc === 'combat'
				? CardResource.DAMAGE
				: resourceDesc === 'economy'
					? CardResource.ECONOMY
					: resourceDesc === 'healing' ? CardResource.HEALING : undefined
			if (resource) {
				raw = newRaw
				result.fleetBonus = {
					type: getDescType(typeDesc),
					resource,
					amount: getDescInt(amount),
				}
			}
		}
	}
	{
		const [ newRaw, opponentDesc, discardDesc, amount, orFewer, targetDesc, discardPileDesc ] = test(raw, /(target opponent |)(scrap|discards?) (\d+)(-?) cards ?(in the trade row|from your hand|) ?(\/?discard pile|)/)
		if (newRaw !== undefined) {
			raw = newRaw
			const targets: CardSource[] = []
			if (opponentDesc) {
				targets.push(CardSource.OPPONENT)
			}
			if (targetDesc === 'in the trade row') {
				targets.push(CardSource.TRADE)
			} else if (targetDesc === 'from your hand') {
				targets.push(CardSource.SELF_HAND)
			}
			if (discardPileDesc) {
				targets.push(CardSource.SELF_DISCARD)
			}
			result.discard = {
				count: getDescInt(amount),
				orFewer: !!orFewer,
				targets,
				scraps: discardDesc === 'scrap',
			}
		}
	}
	{
		const [ newRaw, factionDesc, typeDesc, actionDesc ] = test(raw, /for each (blob|machine cult|star empire|trade federation|) ?(ship|base|card|) ?(scrapped this way|that you've played this turn|)/)
		if (newRaw !== undefined) {
			raw = newRaw
			result.multiplier = {
				predicate: getForEachPredicate(actionDesc),
				source: CardSource.SELF,
				amount: 1,
				amountMoreLess: 0,
				type: getDescType(typeDesc),
				typeFaction: getDescFaction(factionDesc),
			}
		}
	}

	{
		const [ newRaw, cardsAmount ] = test(raw, /\+(\d+) cards?/)
		if (newRaw !== undefined) {
			raw = newRaw
			result.resources!.draw = parseInt(cardsAmount, 10) as CardInt
		}
	}

	raw = raw.trim()
	if (raw.length && raw !== ',') {
		console.warn('MISSING', raw)
	}
	if (!Object.keys(result.resources!).length) {
		delete result.resources
	}
	return result
}

type PredicatePrecedenceFn = (entries: string[]) => [entries: string[], conditional: ActionCondition | true | undefined]
type PredicatePrecedence = [conjunction: PredicateConjunction, splitOn: string, process?: PredicatePrecedenceFn]

function unnest(predicate: ActionPredicate): ActionPredicate {
	const children = predicate.children?.map(child => unnest(child))
	if (!predicate.conjunction && predicate.conditional == null && children?.length === 1) {
		return children[0]
	}
	predicate.children = children
	return predicate
}

function recursivePredicates(original: string, raw: string, precedences: PredicatePrecedence[], precedenceIndex?: number): ActionPredicate {
	const index = precedenceIndex ?? 0
	const [conjunction, splitOn, processFn] = precedences[index]
	let split = raw
		.split(splitOn)
	let conditional: ActionCondition | true | undefined
	if (split.length > 1) {
		if (processFn) {
			// console.log(raw, [...split]) //SAMPLE
			[ split, conditional ] = processFn(split)
		}
		split = split.filter(segment => !!segment)
	}

	if (precedences[index + 1] != null) {
		const children = split
			.map(section => recursivePredicates(original, section, precedences, index + 1) as ActionPredicate)
		const isOnlyChild = children.length === 1
		return {
			children,
			conditional,
			conjunction: isOnlyChild ? undefined : conjunction,
		}
	}
	const segments = split
		.map(segment => parseActionSegment(segment))
		.filter(nonEmpty)
	return {
		segments,
		conditional,
	}
}

function describePredicate(value: ActionPredicate): string {
	if (value.children) {
		// console.log(value.conjunction, value.children, value.children.map(child => describePredicate(child)))
		return `${(value.conjunction ?? 'x')}[${value.children.map(child => `(${describePredicate(child)})`).join('')}]`
	}
	return value.segments!.map(segment => Object.entries(segment).filter(e => e[1] != null).map(e => e.join(':')).toString()).join(',')
}

const processConditional: PredicatePrecedenceFn = (entries) => {
	entries[0] = entries[0].replace(/ and $/, '')
	return [ entries, true ]
}

function processPassiveConditional(raw: string) {
	let conditional: ActionCondition | undefined
	{
		const [ newRaw, conditionDesc, amountDesc, factionDesc, unitDesc ] = test(raw, /^(play) (\d+) (blob|machine cult|star empire|trade federation|)s? ?(ship|base|card)s?/)
		if (newRaw !== undefined) {
			raw = newRaw
			conditional = {
				predicate: conditionDesc === 'play' ? ActionActivationPredicate.PLAYED : ActionActivationPredicate.SCRAPPED_THIS_TURN,
				source: CardSource.SELF,
				amount: getDescInt(amountDesc),
				amountMoreLess: getDescMoreLess(''),
				type: getDescType(unitDesc),
				typeFaction: getDescFaction(factionDesc),
			}
		}
	}
	return conditional
}

const processIf: PredicatePrecedenceFn = (entries) => {
	let conditional: ActionCondition | undefined
	let raw = entries[1]
	raw = raw.replace(/you've played/, 'played')
	{
		const [ newRaw, existDesc, amountDesc, moreLessDesc, factionDesc, unitDesc, conditionDesc ] = test(raw, /(have|played) (\d+)(\+?) (blob|machine cult|star empire|trade federation|)s? ?(ship|base|card)s? (in play|this turn)/)
		if (newRaw !== undefined) {
			raw = newRaw
			conditional = {
				predicate: conditionDesc === 'in play' ? ActionActivationPredicate.IN_PLAY : ActionActivationPredicate.PLAYED,
				source: CardSource.SELF,
				amount: getDescInt(amountDesc),
				amountMoreLess: getDescMoreLess(moreLessDesc),
				type: getDescType(unitDesc),
				typeFaction: getDescFaction(factionDesc),
			}
		}
	}
	{
		const [ newRaw, opponentDesc, hasDesc, amountDesc, moreLessDesc, factionDesc, unitDesc ] = test(raw, /(opponent|) ?(have|has|controls?) ?(\d+)(\+?) (blob|machine cult|star empire|trade federation|)s? ?(ship|base|card)s? (in play|)/)
		if (newRaw !== undefined) {
			raw = newRaw
			conditional = {
				predicate: ActionActivationPredicate.IN_PLAY,
				source: opponentDesc ? CardSource.OPPONENT : CardSource.SELF,
				amount: getDescInt(amountDesc),
				amountMoreLess: getDescMoreLess(moreLessDesc),
				type: getDescType(unitDesc),
				typeFaction: getDescFaction(factionDesc),
			}
		}
	}
	if (!conditional) {
		console.error('Unknown if conditional', entries)
	}
	entries[1] = raw
	return [ entries, conditional ]
}

const predicatePrecedences: PredicatePrecedence[] = [
	[PredicateConjunction.IF_END, 'if ', processIf],
	[PredicateConjunction.AND, ' then '],
	[PredicateConjunction.OR, ' or '],
	[PredicateConjunction.EITHER, ' and/or '],
	[PredicateConjunction.CONDITIONAL_END, 'you may ', processConditional],
]

function processAction(segment: string, cardName: string, factions: CardFaction[], activation: ActionActivation | undefined): CardAction {
	let passiveConditional: ActionCondition | undefined
	if (activation === ActionActivation.PASSIVE) {
		const commaSegments = segment.split(', ')
		const passiveText = commaSegments.shift()!
		passiveConditional = processPassiveConditional(passiveText)
		segment = commaSegments.join(', ')
	}
	let childPredicates = recursivePredicates(segment, segment, predicatePrecedences)
	if (passiveConditional) {
		childPredicates = {
			children: [childPredicates],
			conditional: passiveConditional,
		}
	}
	return {
		factions,
		activation,
		predicate: unnest(childPredicates),
		raw: segment,
	}
}

export function loadCards(raw: string): CardData[] {
	const rows = raw
		.replace(/ /g, ' ') // eslint-disable-line no-irregular-whitespace
		.replace(/\n /g, ' ')
		.trim()
		.split('\n')
		.map(row => row.trim().split('\t').map(col => col.trim()))
		.filter(row => row.length)
	const columns = rows.shift()?.map(column => column.toLowerCase())
	if (columns?.length !== 10) {
		console.error('TSV: Invalid columns.', columns)
		return []
	}
	if (rows.length < 1) { //TODO
		console.error('TSV: Insufficient rows.', raw)
		return []
	}
	return rows.flatMap((row): CardData[] => {
		if (!row.length) {
			return []
		}
		const [set, rawQuantity, name, rawText, rawType, rawFaction, rawCost, rawDefense, role, notes] = row
		const roleNormalized = role.toLowerCase()
		if (roleNormalized !== 'trade deck') {
			return []
		}
		const setNormalized = set.toLowerCase()
		if (setNormalized !== 'core set') { //TODO
			return []
		}
		if (!rawFaction) {
			return []
		}
		// if (notes) { console.log(notes) }
		const noFaction = rawFaction === 'unaligned'
		if (noFaction && (name === 'explorer' || name === 'viper' || name === 'scout')) {
			return []
		}
		const factions = noFaction ? undefined : translate('faction', row, rawFaction, translateFactions)
		if (!rawType) {
			return []
		}
		const type = translateTypes[rawType.toLowerCase()]
		if (!factions || type == null) {
			return []
		}
		const defense = parseCardInt(row, rawDefense?.[0])
		const cost = parseCardInt(row, rawCost)
		if (defense == null || cost == null) {
			return []
		}
		const rawActions = rawText
			.replace(name, 'thiscard')
			.toLowerCase()
			.replace(/ two /g, ' 2 ')
			.replace(/ three /g, ' 3 ')
			.replace(/ four /g, ' 4 ')
			.replace(/ five /g, ' 5 ')
			.replace(/ six /g, ' 6 ')
			.replace(/ seven /g, ' 7 ')
			.replace(/ eight /g, ' 8 ')
			.replace(/ nine /g, ' 9 ')
			.replace(/a (card|ship)/g, '1 $1s')
			.replace(/ up to (\d+)/g, ' $1-')
			.replace(/ in your hand/g, ' from your hand')
			.replace(/hand or discard/g, 'hand/discard')
			.replace(/hand and\/or discard/g, 'hand/discard')
			.replace(/(\d) or more/g, '$1+')
			.replace(/(\d) or less/g, '$1-')
			.replace(/gain (\d)/g, '+$1')
			.replace(/draw (\d) card/g, '+$1 card')
			.replace(/that many/g, '=')
			.replace(/if you have /g, 'if ')
			.replace(/whenever you /g, `{${PASSIVE_MARKER}}: `)
			.trim()
			.replace(/\.$/, '')
		const segments = rawActions.split('<hr>')
		const actions = segments.map(segment => {
			segment = segment.replace(/\./g, '').trim()
			const activationMatches = segment.match(REGEX_ACTIVATION_MARKER) //TODO match all
			const rawActivation = activationMatches?.[1]
			segment = segment.replace(REGEX_ACTIVATION_MARKER, '')
			const activation = rawActivation === SCRAP_MARKER
				? ActionActivation.ON_SCRAP
				: rawActivation === PASSIVE_MARKER
					? ActionActivation.PASSIVE
					: undefined
			const actionFactions = rawActivation != null && rawActivation.endsWith(ALLY_MARKER) ? translate('faction', row, rawActivation!.split(ALLY_MARKER)[0].trim(), translateFactions) : []
			return processAction(segment, name, actionFactions, activation)
		})
		const card: CardData = {
			name,
			factions,
			type,
			isShield: rawDefense ? rawDefense.endsWith('Outpost') : undefined,
			defense,
			cost,
			actions,
		}
		return Array(parseInt(rawQuantity, 10)).fill(card)
	})
}
