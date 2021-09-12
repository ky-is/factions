import { ActionActivation, CardResource, CardFaction, CardType, PredicateConjunction, CardSource, CardAcquisition, CardDestination, PREVIOUS_AMOUNT, ActionActivationPredicate } from '#c/types/cards.js'
import type { CardAction, CardData, CardInt, ActionSegment, ActionPredicate, CardAmountMoreLess, ActionCondition } from '#c/types/cards.js'
import { nonEmpty } from '#c/utils.js'

const translateFactions: Record<string, CardFaction> = {
	'YmxvYg==': CardFaction.GREEN,
	'Z3JlZW4=': CardFaction.GREEN,
	'bWFjaGluZSBjdWx0': CardFaction.PINK,
	'cmVk': CardFaction.PINK,
	'c3RhciBlbXBpcmU=': CardFaction.GOLD,
	'eWVsbG93': CardFaction.GOLD,
	'dHJhZGUgZmVkZXJhdGlvbg==': CardFaction.BLUE,
	'Ymx1ZQ==': CardFaction.BLUE,
}

const translateResources: Record<string, CardResource> = {
	'Y2FyZHM=': CardResource.DRAW,
	'Y2FyZHMs': CardResource.DRAW,
	'dHJhZGU=': CardResource.ECONOMY,
	'Y29tYmF0': CardResource.DAMAGE,
	'YXV0aG9yaXR5': CardResource.HEALING,
}

const translateTypes: Record<string, CardType> = {
	'c2hpcA==': CardType.SHIP,
	'YmFzZQ==': CardType.STATION,
}

const toBase64 = typeof btoa !== 'undefined' ? btoa : ((data: string) => Buffer.from(data.toLowerCase(), 'binary').toString('base64'))

function encoded<Input extends string | undefined>(raw: Input) {
	return raw !== undefined ? toBase64(raw.toLowerCase()) : undefined
}

function translate<Result>(label: string, row: string[], raw: string, translation: Record<string, Result>) {
	if (!raw) {
		return []
	}
	return raw
		.split('/')
		.map(entry => {
			const translated = translation[encoded(entry.trim())!]
			if (translated === undefined) {
				console.error('Card: Unknown translation', label, entry, encoded(entry), translated, row)
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

const todoTypes = [
	'c2NlbmFyaW8=',
	'aGVybw==',
	'bWlzc2lvbg==',
	'c29sbyBjaGFsbGVuZ2U=',
	'Z2FtYml0',
	'Y28tb3AgY2hhbGxlbmdl',
	'ZXZlbnQ=',
	'c2hpcCB8IGJhc2U=',
]

const ALLY_MARKER = 'ally:'
const SCRAP_MARKER = 'scrap:'
const PASSIVE_MARKER = 'whenever:'

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

function parseActionSegment(raw: string, fromOriginal: string) {
	// console.log(cardName, raw) //SAMPLE
	const original = raw
	const result: ActionSegment = {}
	{
		const [ newRaw ] = test(raw, /draw = cards/)
		if (newRaw !== undefined) {
			raw = newRaw
			if (!result.resources) {
				result.resources = {}
			}
			result.resources.draw = PREVIOUS_AMOUNT
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
		const [ newRaw, unitDesc, activatioesc ] = test(raw, /copy another (ship|base|card) (you've played this turn)/)
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
	const words = raw.split(' ')
	let currentWord = words.shift()
	while (nonEmpty(currentWord)) {
		let amount: CardInt | null | undefined
		let resource: CardResource | undefined
		if (currentWord[0] === '+') {
			amount = parseCardInt(words, currentWord.slice(1))
			if (!amount) {
				return undefined
			}
			const nextWord = words.shift()
			if (!nonEmpty(nextWord)) {
				console.error('Action: missing +specifier', amount, original, fromOriginal)
				return undefined
			}
			resource = translate('resource', words, nextWord, translateResources)[0]
			if (!resource) {
				return undefined
			}
			if (!result.resources) {
				result.resources = {}
			}
			(result.resources as any)[resource] = amount
		} else if (currentWord !== 'and') {
			console.error('Unknown', currentWord, '%', original, '%', fromOriginal)
			break
		}
		currentWord = words.shift()
	}
	return result
}

type PredicatePrecidenceFn = (entries: string[]) => [entries: string[], conditional: ActionCondition | true | undefined]
type PredicatePrecidence = [conjunction: PredicateConjunction, splitOn: string, process?: PredicatePrecidenceFn]

function unnest(predicate: ActionPredicate): ActionPredicate {
	const children = predicate.children?.map(child => unnest(child))
	if (!predicate.conjunction && predicate.conditional == null && children?.length === 1) {
		return children[0]
	}
	predicate.children = children
	return predicate
}

function recursivePredicates(original: string, raw: string, precidences: PredicatePrecidence[], precidenceIndex?: number): ActionPredicate {
	const index = precidenceIndex ?? 0
	const precidence = precidences[index]
	let split = raw
		.split(precidence[1])
	let conditional: ActionCondition | true | undefined
	if (split.length > 1) {
		const processFn = precidence[2]
		if (processFn) {
			// console.log(raw, [...split]) //SAMPLE
			[ split, conditional ] = processFn(split)
		}
		split = split.filter(segment => !!segment)
	}

	if (precidences[index + 1] != null) {
		const children = split
			.map(section => recursivePredicates(original, section, precidences, index + 1) as ActionPredicate)
		const isOnlyChild = children.length === 1
		return {
			children,
			conditional,
			conjunction: isOnlyChild ? undefined : precidence[0],
		}
	}
	const segments = split
		.map((segment) => parseActionSegment(segment, original))
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

const processConditional: PredicatePrecidenceFn = (entries) => {
	entries[0] = entries[0].replace(/ and $/, '')
	return [ entries, true ]
}

const processIf: PredicatePrecidenceFn = (entries) => {
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

const predicatePrecidences: PredicatePrecidence[] = [
	[PredicateConjunction.IF_END, 'if ', processIf],
	[PredicateConjunction.AND, ' then '],
	[PredicateConjunction.OR, ' or '],
	[PredicateConjunction.EITHER, ' and/or '],
	[PredicateConjunction.CONDITIONAL_END, 'you may ', processConditional],
]

function processAction(original: string, cardName: string, factions: CardFaction[], activation: ActionActivation | undefined, words: string[]): CardAction {
	if (factions.length) {
		words.splice(0, words.indexOf(ALLY_MARKER) + 1)
	}
	if (activation !== undefined) {
		let marker: string
		if (activation === ActionActivation.ON_SCRAP) {
			marker = SCRAP_MARKER
		} else if (activation === ActionActivation.PASSIVE) {
			marker = PASSIVE_MARKER
		}
		words.filter(word => word === marker)
	}
	const raw = words.join(' ')
	// if connected: During the discard phase,
	// if ignore: as if
	const predicate = unnest(recursivePredicates(original, raw, predicatePrecidences))
	// console.log(raw, '%', describePredicate(predicate)) //SAMPLE
	return {
		factions,
		activation,
		predicate,
		raw,
	}
}

export function loadCards(raw: string): CardData[] {
	const rows = raw
		.replace(/ /g, ' ') // eslint-disable-line no-irregular-whitespace
		.trim()
		.split('\n')
		.map(row => row.trim().split('\t').map(col => col.trim()))
		.filter(row => row.length)
	const columns = rows.shift()?.map(column => column.toLowerCase())
	if (columns?.length !== 8) {
		console.error('TSV: Invalid columns.', columns)
		return []
	}
	if (rows.length < 1) { //TODO
		console.error('TSV: Insufficient rows.', raw)
		return []
	}
	return rows.flatMap((row): CardData[] => {
		if (row[0] !== 'Core Set') { //TODO
			return []
		}
		const name = row[2]
		const rawFaction = row[3]
		if (!rawFaction) {
			return []
		}
		const encodedFaction = encoded(rawFaction)
		const noFaction = encodedFaction === 'dW5hbGlnbmVk'
		if (noFaction && (name === 'ZXhwbG9yZXI=' || name === 'dmlwZXI=' || name === 'c2NvdXQ=')) {
			// console.log('Skip faction', row)
			return []
		}
		const factions = noFaction ? undefined : translate('faction', row, rawFaction, translateFactions)
		const rawType = row[4]
		if (!rawType) {
			return []
		}
		const encodedType = encoded(rawType)
		if (encodedType == null || encodedType === 'cnVsZXMgY2FyZA==' || encodedType === 'c2NvcmUgY2FyZA==') {
			return []
		}
		const skipType = todoTypes.includes(encodedType)
		const type = skipType ? undefined : translate('type', row, rawType, translateTypes)[0]
		if (!factions || type == null) {
			return []
		}
		const rawDefense = row[7]
		const defense = parseCardInt(row, row[7]?.[0])
		const cost = parseCardInt(row, row[5])
		if (defense == null || cost == null) {
			return []
		}
		let rawActions = row[6]
			.replace(name, 'thiscard')
			.toLowerCase()
			.replace(/contol/g, 'control')
			.replace(/,|;|"/g, '')
			.replace('<i>or</i>', 'or')
			.replace('<u>or</u>', 'or')
			.replace(' (including this one)', '')
			.replace(/ two /g, ' 2 ')
			.replace(/ three /g, ' 3 ')
			.replace(/ four /g, ' 4 ')
			.replace(/ five /g, ' 5 ')
			.replace(/ six /g, ' 6 ')
			.replace(/ seven /g, ' 7 ')
			.replace(/ eight /g, ' 8 ')
			.replace(/ nine /g, ' 9 ')
			.replace(/a (ship|base|card|blob|machine cult|star empire|trade federation)/g, '1 $1s')
			.replace(/ up to (\d+)/g, ' $1-')
			.replace(/add /g, '+')
			.replace(/ in your hand/g, ' from your hand')
			.replace(/hand or discard/g, 'hand/discard')
			.replace(/hand and\/or discard/g, 'hand/discard')
			.replace(/ship or base/g, 'ship/base')
			.replace(/ship and\/or base/g, 'ship/base')
			.replace(/(\d) or more/g, '$1+')
			.replace(/(\d) or less/g, '$1-')
			.replace(/gain (\d)/g, '+$1')
			.replace(/draw (\d) card/g, '+$1 card')
			.replace(/ and (\d)/g, ' +$1')
			.replace(/that many/g, '=')
			.replace(/scrap this card from play/g, SCRAP_MARKER)
			.replace(/whenever you/g, PASSIVE_MARKER)
			.replace(/if you do/g, 'then')
			.replace(/if (an?|your?) /g, 'if ')
			.trim()
			.replace(/\.$/, '')
		if (rawActions.endsWith('</i>')) {
			const splitActions = rawActions.split('<i>')
			splitActions.pop()
			rawActions = splitActions.join('').trim()
		}
		if (rawActions.endsWith('<hr>')) {
			rawActions = rawActions.slice(0, -4).trim()
		}
		if (rawActions.includes('</') && !rawActions.includes('</b>')) {
			console.error('Card: Unknown html', rawActions)
		}
		// if (rawActions.includes('if ')) { //SAMPLE
		// 	console.log(rawActions)
		// }
		// console.log(rawActions) //SAMPLE
		let actions = []
		const segments = rawActions.split('<hr>')
		if (segments.length > 1) {
			actions = segments.map(segment => {
				const words = segment.replace(/\./g, '').trim().split(' ')
				const activation = words.includes(SCRAP_MARKER)
					? ActionActivation.ON_SCRAP
					: words.includes(PASSIVE_MARKER)
						? ActionActivation.PASSIVE
						: undefined
				const factionsSplit = segment.split(ALLY_MARKER)
				let actionFactions: CardFaction[] = []
				if (factionsSplit.length === 2) {
					const list = factionsSplit[0].trim().split(' or ').join('/')
					actionFactions = list.length ? translate('faction', factionsSplit, list, translateFactions) : factions
				}
				return processAction(rawActions, name, actionFactions, activation, words)
			})
		} else {
			const words = rawActions.split(' ')
			let currentWords = []
			let withFactions = false
			let onScrap = false
			let currentActivation: ActionActivation | undefined
			let newSegment = false
			for (let index = 0; index <= words.length; index += 1) {
				const word = words[index]
				if (index === words.length) {
					newSegment = true
				}
				if (word) {
					if (word === ALLY_MARKER || word === SCRAP_MARKER || word === PASSIVE_MARKER) {
						if (currentWords.length) {
							newSegment = true
						}
					} else {
						currentWords.push(word.replace('.', ''))
						if (word.endsWith('.')) {
							newSegment = true
						}
					}
				}
				if (newSegment) {
					const action = processAction(rawActions, name, withFactions ? factions : [], currentActivation, currentWords)
					actions.push(action)
					newSegment = false
					currentWords = []
					withFactions = false
					onScrap = false
					currentActivation = undefined
				}
				if (word) {
					if (word === ALLY_MARKER) {
						withFactions = true
					} else if (word === SCRAP_MARKER) {
						currentActivation = ActionActivation.ON_SCRAP
					} else if (word === PASSIVE_MARKER) {
						currentActivation = ActionActivation.PASSIVE
					}
				}
			}
		}
		const quantity = parseInt(row[1], 10)
		const card: CardData = {
			name,
			factions,
			type,
			isShield: rawDefense ? encoded(rawDefense)!.endsWith('BvdXRwb3N0') : undefined,
			defense,
			cost,
			actions,
		}
		return Array(quantity).fill(card)
	})
}
