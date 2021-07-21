import Fastify from 'fastify'

import { useUserRoutes } from '#s/controllers/users.js'

import { APIError } from '#s/helpers/errors.js'
import { createIO } from '#s/helpers/io.js'

const clientURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3100'

const fastify = Fastify({
	logger: true,
})

fastify
	.setErrorHandler((error, request, reply) => {
		if (error instanceof APIError) {
			reply.statusCode = 400
			reply.send({ message: error.message, cancel: error.cancel })
		} else {
			throw error
		}
	})
	.addHook('onRequest', (request, reply, next) => {
		reply.header('Access-Control-Allow-Origin', clientURL)
		next()
	})
	.after(() => {
		useUserRoutes(fastify)
	})

createIO(fastify, clientURL)

fastify.listen(3101, (error, address) => {
	if (error) {
		throw error
	}
})
