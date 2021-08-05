import type { State } from 'seedrandom'

export interface PRNG {
	(): number
	double(): number
	int32(): number
	quick(): number
	state(): State
}
