import type { CardAction, CardData, CardInt, ActionSegment, ActionPredicate, CardAmountMoreLess, ActionCondition } from '#c/types/cards'
import { ActionActivation, CardResource, CardFaction, CardType, PredicateConjunction, CardSource, CardAcquisition, PREVIOUS_AMOUNT, ActionActivationPredicate } from '#c/types/cards'

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

function encoded<Input extends string | undefined>(raw: Input) {
	return raw !== undefined ? btoa(raw.toLowerCase()) : undefined
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
	if (!raw) {
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
				? CardType.SCOUT
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
		const [ newRaw ] = test(raw, /destroy target base/)
		if (newRaw !== undefined) {
			raw = newRaw
			result.destroyStations = 1
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
				result.alliances = [ CardFaction.BLUE, CardFaction.GOLD, CardFaction.GREEN]
			}
		}
	}
	{
		const [ newRaw, amountDesc, unitDesc, acquisitionDesc ] = test(raw, /put (the next|\d+) (ship|base|ships?\/base)s? (you acquire this turn|from your discard pile) on top of your deck/)
		if (newRaw !== undefined) {
			raw = newRaw
			result.putOnDeck = {
				type: getDescType(unitDesc),
				amount: getDescInt(amountDesc) ?? 1,
				acquisition: acquisitionDesc === 'you acquire this turn' ? CardAcquisition.NEXT_ACQUIRED : CardAcquisition.FROM_DISCARD,
			}
		}
	}
	{
		const [ newRaw, unitDesc, activationDesc ] = test(raw, /copy another (ship|base|card) (you've played this turn) thiscard has that (ship|base|card)'s faction in addition to (blob|machine cult|star empire|trade federation)/)
		if (newRaw !== undefined) {
			raw = newRaw
			result.copy = {
				type: getDescType(unitDesc),
				predicate: ActionActivationPredicate.PLAYED,
				anywhere: false,
			}
		}
	}
	{
		const [ newRaw, typeDesc, amount, resourceDesc ] = test(raw, /all of your (ship|base)s get \+(\d+) (\S+)/)
		if (newRaw !== undefined) {
			raw = newRaw
			const resource = resourceDesc === 'damage'
				? CardResource.DAMAGE
				: resourceDesc === 'economy'
					? CardResource.ECONOMY
					: resourceDesc === 'healing' ? CardResource.HEALING : undefined
			if (resource) {
				raw = newRaw
				if (!result.fleetBonuses) {
					result.fleetBonuses = []
				}
				result.fleetBonuses!.push({
					types: [ getDescType(typeDesc)! ],
					resource,
					amount: getDescInt(amount),
				})
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
				amountDirection: 0,
				type: getDescType(typeDesc),
				typeFaction: getDescFaction(factionDesc),
			}
		}
	}
	const words = raw.split(' ')
	let currentWord = words.shift()
	while (currentWord) {

		let amount: CardInt | null | undefined
		let resource: CardResource | undefined
		if (currentWord[0] === '+') {
			amount = parseCardInt(words, currentWord.slice(1))
			if (!amount) {
				return undefined
			}
			const nextWord = words.shift()
			if (!nextWord) {
				console.error('Action: missing +specifier', amount, words)
				return undefined
			}
			resource = translate('resource', words, nextWord, translateResources)[0]
			if (!resource) {
				return undefined
			}
			if (!result.resources) {
				result.resources = {}
			}
			result.resources[resource] = amount
		} else if (currentWord !== 'and') {
			console.error('Unknown', currentWord, raw, '%', original)
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
	if (!predicate.conjunction && !predicate.conditional && children?.length === 1) {
		return children[0]
	}
	predicate.children = children
	return predicate
}

function recursivePredicates(raw: string, precidences: PredicatePrecidence[], precidenceIndex?: number): ActionPredicate {
	const index = precidenceIndex ?? 0
	const precidence = precidences[index]
	let split = raw
		.split(precidence[1])
	let conditional: ActionCondition | true | undefined
	if (split.length > 1) {
		const processFn = precidence[2]
		if (processFn) {
			// console.log(raw, [...split]); //SAMPLE
			[ split, conditional ] = processFn(split)
		}
		split = split.filter(segment => !!segment)
	}

	if (precidences[index + 1]) {
		const children = split
			.map(section => recursivePredicates(section, precidences, index + 1) as ActionPredicate)
		const isOnlyChild = children.length === 1
		return {
			children,
			segments: undefined,
			conjunction: isOnlyChild ? undefined : precidence[0],
		}
	}
	const segments = split
		.map((segment) => parseActionSegment(segment)!)
		.filter(segment => !!segment)
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
	return value.segments!.map(segment => Object.entries(segment).filter(e => !!e[1]).map(e => e.join(':')).toString()).join(',')
}

const processOptional: PredicatePrecidenceFn = (entries) => {
	entries[0] = entries[0].replace(/ and $/, '')
	return [ entries, true ]
}

const processIf: PredicatePrecidenceFn = (entries) => {
	let condition: ActionCondition | undefined
	let raw = entries[1]
	raw = raw.replace(/you've played/, 'played')
	{
		const [ newRaw, existDesc, amountDesc, moreLessDesc, factionDesc, unitDesc, conditionDesc ] = test(raw, /(have|played) (\d+)(\+?) (blob|machine cult|star empire|trade federation|)s? ?(ship|base|card)s? (in play|this turn)/)
		if (newRaw !== undefined) {
			raw = newRaw
			condition = {
				predicate: conditionDesc === 'in play' ? ActionActivationPredicate.IN_PLAY : ActionActivationPredicate.PLAYED,
				source: CardSource.SELF,
				amount: getDescInt(amountDesc),
				amountDirection: getDescMoreLess(moreLessDesc),
				type: getDescType(unitDesc),
				typeFaction: getDescFaction(factionDesc),
			}
		}
	}
	{
		const [ newRaw, opponentDesc, hasDesc, amountDesc, moreLessDesc, factionDesc, unitDesc ] = test(raw, /(opponent|) ?(have|has|controls?) ?(\d+)(\+?) (blob|machine cult|star empire|trade federation|)s? ?(ship|base|card)s? (in play|)/)
		if (newRaw !== undefined) {
			raw = newRaw
			condition = {
				predicate: ActionActivationPredicate.IN_PLAY,
				source: opponentDesc ? CardSource.OPPONENT : CardSource.SELF,
				amount: getDescInt(amountDesc),
				amountDirection: getDescMoreLess(moreLessDesc),
				type: getDescType(unitDesc),
				typeFaction: getDescFaction(factionDesc),
			}
		}
	}
	if (!condition) {
		console.error('Unknown if condition')
	}
	entries[1] = raw
	return [ entries, condition ]
}

const predicatePrecidences: PredicatePrecidence[] = [
	[PredicateConjunction.CONDITIONAL_END, 'if ', processIf],
	[PredicateConjunction.AND, ' then '],
	[PredicateConjunction.OR, ' or '],
	[PredicateConjunction.EITHER, ' and/or '],
	[PredicateConjunction.OPTIONAL_END, 'you may ', processOptional],
]

function processAction(cardName: string, factions: CardFaction[], activation: ActionActivation | null, words: string[]): CardAction | undefined {
	if (factions) {
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
	const predicate = unnest(recursivePredicates(raw, predicatePrecidences))
	// console.log(raw, '%', describePredicate(predicate)) //SAMPLE
	return {
		factions,
		activation,
		predicate,
		raw,
	}
}

export function loadCards(raw: string) {
	const rows = raw
		.replace(/ /g, ' ') // eslint-disable-line no-irregular-whitespace
		.trim()
		.split('\n')
		.map(row => row.trim().split('\t').map(col => col.trim()))
		.filter(row => !!row)
	const columns = rows.shift()?.map(column => column.toLowerCase())
	if (columns?.length !== 8) {
		return console.error('TSV: Invalid columns.', columns)
	}
	if (rows.length < 1) { //TODO
		return console.error('TSV: Insufficient rows.')
	}
	rows.map((row): CardData | undefined => {
		if (row[0] !== 'Core Set') { //TODO
			return undefined
		}
		const name = row[2]
		const rawFaction = row[3]
		if (!rawFaction) {
			return undefined
		}
		const encodedFaction = encoded(rawFaction)
		const noFaction = encodedFaction === 'dW5hbGlnbmVk'
		if (noFaction && (name === 'ZXhwbG9yZXI=' || name === 'dmlwZXI=' || name === 'c2NvdXQ=')) {
			// console.log('Skip faction', row)
			return undefined
		}
		const factions = noFaction ? undefined : translate('faction', row, rawFaction, translateFactions)
		const rawType = row[4]
		if (!rawType) {
			return undefined
		}
		const encodedType = encoded(rawType)
		if (!encodedType || encodedType === 'cnVsZXMgY2FyZA==' || encodedType === 'c2NvcmUgY2FyZA==') {
			return undefined
		}
		const skipType = todoTypes.includes(encodedType)
		const type = skipType ? undefined : translate('type', row, rawType, translateTypes)[0]
		if (!factions || !type) {
			return undefined
		}
		const rawDefense = row[7]
		const defense = parseCardInt(row, row[7]?.[0])
		const cost = parseCardInt(row, row[5])
		if (defense === null || cost === null) {
			return undefined
		}
		let rawActions = row[6]
			.replace(name, 'thiscard')
			.toLowerCase()
			.replace(/contol/g, 'control')
			.replace(/\.|,|;|"/g, '')
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
				const words = segment.trim().split(' ')
				const activation = words.includes(SCRAP_MARKER) ? ActionActivation.ON_SCRAP : (words.includes(PASSIVE_MARKER) ? ActionActivation.PASSIVE : null)
				const factionsSplit = segment.split(ALLY_MARKER)
				let actionFactions: CardFaction[] = []
				if (factionsSplit.length === 2) {
					const list = factionsSplit[0].trim().split(' or ').join('/')
					actionFactions = list.length ? translate('faction', factionsSplit, list, translateFactions) : factions
				}
				const action = processAction(name, actionFactions, activation, words)
				if (action) {
					actions.push(action)
				}
			})
		} else {
			const words = rawActions.split(' ')
			let currentWords = []
			let withFactions = false
			let onScrap = false
			let activation: ActionActivation | undefined
			for (let index = 0; index <= words.length; index += 1) {
				const word = words[index]
				let newSegment = !word
				if (word) {
					if (word === ALLY_MARKER || word === SCRAP_MARKER || word === PASSIVE_MARKER) {
						newSegment = true
					} else {
						currentWords.push(word)
					}
				}
				if (newSegment && currentWords.length) {
					const action = processAction(name, withFactions ? factions : [], activation ?? null, currentWords)
					if (action) {
						actions.push(action)
					}
					currentWords = []
					withFactions = false
					onScrap = false
				}
				if (word === ALLY_MARKER) {
					withFactions = true
				} else if (word === SCRAP_MARKER) {
					activation = ActionActivation.ON_SCRAP
				} else if (word === PASSIVE_MARKER) {
					activation = ActionActivation.PASSIVE
				}
			}
		}
		return {
			name,
			factions,
			type,
			isShield: rawDefense ? encoded(rawDefense)!.endsWith('BvdXRwb3N0') : undefined,
			defense,
			cost,
			actions: [],
		}
	})
}
