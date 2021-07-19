import { Server } from 'socket.io'
import type { FastifyInstance } from 'fastify'

import { APIError } from '#s/helpers/errors.js'

let io: Server

export function createSocket(fastify: FastifyInstance, clientURL: string | undefined) {
	fastify.addHook('onClose', (fastify, done) => {
		io.close()
		done()
	})
	io = new Server(fastify.server, {
		cors: {
			origin: clientURL,
		},
	})
	io.use((socket, next) => {
		const { sessionID } = socket.handshake.auth
		if (!sessionID) {
			return next(new APIError('Unauthorized.', true))
		}
		next()
	})
	io.on('connection', (socket) => {
		socket.emit('hello', 'world')
	})
}

export function useSocket() {
	return io
}
