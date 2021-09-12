import { Server } from 'socket.io'
import { Socket } from 'socket.io'
import type { BroadcastOperator } from 'socket.io'
import type { FastifyInstance } from 'fastify'

import { registerLobby } from '#s/sockets/lobby.js'
import { registerGame } from '#s/sockets/game.js'
import { authorizeUser, registerUser } from '#s/sockets/user.js'

import { APIError } from '#s/helpers/errors.js'
import { getUserForSession } from '#s/models/user.js'

let io: Server

export function createIO(fastify: FastifyInstance, clientURL: string | undefined) {
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
		const { sessionID } = socket.handshake.auth as { sessionID?: string }
		if (sessionID == null) {
			return next(new APIError('Unauthorized.', true))
		}
		const user = await getUserForSession(sessionID)
		if (!user) {
			return next(new APIError('Invalid session, please sign in again.', true))
		}
		authorizeUser(socket, user)
		next()
	})
	io.on('connection', (socket) => {
		registerUser(socket)
		registerLobby(socket)
		registerGame(socket)
	})
}

export function useIO(to: string) {
	return io.to(to)
}

export type EmitTarget = string | BroadcastOperator<any> | Socket

export function emit(target: EmitTarget, event: string, ...data: any[]) {
	if (target instanceof Socket) {
		target.emit(event, ...data)
	} else if (typeof target === 'string') {
		useIO(target).emit(event, ...data)
	} else {
		target.emit(event, ...data)
	}
}
