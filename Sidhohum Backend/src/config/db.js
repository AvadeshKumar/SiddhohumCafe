import mongoose from 'mongoose'

let isConnected = false

export const connectDB = async (uri = process.env.MONGODB_URI) => {
  if (isConnected) {
    return mongoose.connection
  }

  try {
    const mongoUri = uri || 'mongodb://localhost:27017/sidhohum_cafe'
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    })

    isConnected = true
    console.log(`🌿 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`)
    return conn
  } catch (error) {
    console.warn(`⚠️ MongoDB connection warning: ${error.message}`)
    console.warn('Note: In development without local MongoDB, configure MONGODB_URI in .env or run tests with in-memory DB.')
    // Do not terminate process in development so server can start and return clear diagnostics
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
    return null
  }
}

export const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect()
    isConnected = false
  }
}
