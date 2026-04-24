'use client'

import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('fair-ride-token') ?? ''
        : ''

    socket = io('http://localhost:3001', {
      query: { token },
      autoConnect: false,
      transports: ['websocket'],
    })
  }
  return socket
}

export function getChatSocket(): Socket {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('fair-ride-token') ?? ''
      : ''

  return io('http://localhost:3001/chat', {
    auth: { token },
    autoConnect: false,
    transports: ['websocket'],
  })
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export default getSocket
