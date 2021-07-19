import path from 'path'
import type { FastifyInstance } from 'fastify'

import { userForEmail, createUser, authUser } from '#s/models/user.js'

import { parseEmail, parsePasscode } from '#s/helpers/validate.js'

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
			return { user }
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
			const userAndSesssion = await createUser(email, name)
			return userAndSesssion
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
			const user = await authUser(email, passcode)
			return { user }
		},
	})
}
