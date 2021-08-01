import type seedrandom from 'seedrandom'

export interface PRNG {
	(): number
	double(): number
	int32(): number
	quick(): number
	state(): seedrandom.State
}
