import type { FastifyRequest } from 'fastify'
import type { RouteGenericInterface } from 'fastify/types/route'
import type { UserData } from '#c/types'

export interface AuthorizedRequest extends FastifyRequest {
	user: UserData
}
