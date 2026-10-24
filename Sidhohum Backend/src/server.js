import http from 'http'
import dns from 'node:dns'
import dotenv from 'dotenv'
import app from './app.js'
import { connectDB } from './config/db.js'
import { initSocketServer } from './services/socketService.js'

dotenv.config()
dns.setServers(['8.8.8.8'])


const PORT = process.env.PORT || 5000

const server = http.createServer(app)

// Initialize Socket.IO
initSocketServer(server, process.env.FRONTEND_URL || 'http://localhost:5173')

// Connect Database & Start Server
const startServer = async () => {
  await connectDB()

  server.listen(PORT, () => {
    console.log(`☕ Siddhohum Cafe Backend running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`)
  })
}

startServer()

export { server, app }
