import path from 'path'
import type { FastifyInstance } from 'fastify'

import { userForEmail, createUser, authUser, refreshPasscode } from '#s/models/user'

import { parseEmail, parsePasscode } from '#s/helpers/validate'

const baseEndpoint = '/api/user'

export function useUserRoutes(server: FastifyInstance) {
	server.route({
		method: 'GET',
		url: path.join(baseEndpoint, 'email', ':email'),
		schema: {
			params: {
				email: {
					type: 'string',
				},
			},
		},
		handler: async (request, reply) => {
			const email = parseEmail(request.params)
			const user = await userForEmail(email) ?? null
			if (user) {
				await refreshPasscode(user)
			}
			return { email, exists: !!user }
		},
	})

	server.route({
		method: 'POST',
		url: path.join(baseEndpoint, 'register', ':email'),
		schema: {
			params: {
				email: {
					type: 'string',
				},
			},
			body: {
				name: {
					type: 'string',
				},
			},
		},
		handler: async (request, reply) => {
			const email = parseEmail(request.params)
			const { name } = request.body as { name: string }
			const userAndSession = await createUser(email, name)
			return userAndSession
		},
	})

	server.route({
		method: 'POST',
		url: path.join(baseEndpoint, 'signin', ':email'),
		schema: {
			params: {
				email: {
					type: 'string',
				},
			},
			body: {
				passcode: {
					type: 'string',
				},
			},
		},
		handler: async (request, reply) => {
			const email = parseEmail(request.params)
			const passcode = parsePasscode(request.body)
			const userAndSession = await authUser(email, passcode)
			return userAndSession
		},
	})
}
