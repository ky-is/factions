import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

import Fastify from 'fastify'
import FastifyCORS from 'fastify-cors'

import { TESTING } from '#c/utils'

import { useUserRoutes } from '#s/controllers/users'

import { APIError } from '#s/helpers/errors'
import { createIO } from '#s/helpers/io'

const clientURL = TESTING ? 'http://localhost:3100' : 'https://playfactions.netlify.app'

const fastify = Fastify({
	logger: true,
})

fastify
	.register(FastifyCORS, {
		origin: clientURL,
	})
	.setErrorHandler((error, request, reply) => {
		if (error instanceof APIError) {
			reply.statusCode = 400
			reply.send({ message: error.message, cancel: error.cancel })
		} else {
			throw error
		}
	})
	.after(() => {
		useUserRoutes(fastify)
		createIO(fastify, clientURL)
	})

fastify.listen(process.env.PORT ?? 3101, '0.0.0.0', (error, address) => {
	if (error != null) {
		throw error
	}
})
