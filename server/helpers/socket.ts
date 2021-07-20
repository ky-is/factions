import { Server } from 'socket.io'
import type { FastifyInstance } from 'fastify'

import { registerLobby } from '#s/sockets/lobby.js'
import { registerGame } from '#s/sockets/game.js'
import { registerUser } from '#s/sockets/user.js'

import { APIError } from '#s/helpers/errors.js'
import { getUserForSession } from '#s/models/user.js'

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
	io.use(async (socket, next) => {
		const { sessionID } = socket.handshake.auth
		if (!sessionID) {
			return next(new APIError('Unauthorized.', true))
		}
		const user = await getUserForSession(sessionID)
		if (!user) {
			return next(new APIError('Invalid session, please sign in again.', true))
		}
		registerUser(socket, user)
		next()
	})
	io.on('connection', (socket) => {
		registerLobby(socket)
		registerGame(socket)
	})
}

export function useSocket() {
	return io
}
