import type { FastifyRequest } from 'fastify'
import type { RouteGenericInterface } from 'fastify/types/route'
import type { UserSessionData } from '#c/types'

export interface AuthorizedRequest extends FastifyRequest {
	user: UserSessionData
}
