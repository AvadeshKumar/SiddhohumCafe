import { io } from 'socket.io-client'

let socket = null

export const getSocket = () => {
  if (!socket) {
    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL ||
      (window.location.port === '5173' ? 'http://localhost:5000' : window.location.origin)

    socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('⚡ Socket connected to Siddhohum live server:', socket.id)
    })

    socket.on('connect_error', (err) => {
      console.warn('⚡ Live update connection attempt:', err.message)
    })

    socket.on('disconnect', (reason) => {
      console.log('⚡ Socket disconnected:', reason)
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
