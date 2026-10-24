import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

import authRoutes from './routes/authRoutes.js'
import menuRoutes from './routes/menuRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import { apiLimiter } from './middleware/rateLimiter.js'

dotenv.config()

const app = express()

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow frontend resources
    crossOriginEmbedderPolicy: false
  })
)

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true)
      }
      return callback(new Error('Blocked by CORS policy'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

// Request Body Parsing
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))

// Rate limiting on API routes
app.use('/api', apiLimiter)

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Siddhohum Cafe API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Route Mappings
app.use('/api/auth', authRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/settings', settingsRoutes)

// 404 & Error Handling
app.use(notFound)
app.use(errorHandler)

export default app
