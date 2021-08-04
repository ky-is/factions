export type SocketResponse = SocketError | undefined

export interface SocketError {
	message: string
}
