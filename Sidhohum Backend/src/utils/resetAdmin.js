
import dns from 'node:dns'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import readline from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { connectDB, disconnectDB } from '../config/db.js'
import AdminAccount from '../models/AdminAccount.js'

dns.setServers(['8.8.8.8'])
dotenv.config()

const rl = readline.createInterface({ input: stdin, output: stdout })

try {
  const phoneInput = await rl.question('Admin phone number (10 digits): ')
  const phone = phoneInput.replace(/\D/g, '').slice(-10)

  if (phone.length !== 10) {
    throw new Error('Enter a valid 10-digit phone number.')
  }

  const password = await rl.question('Enter a NEW temporary password: ')
  if (password.length < 12) {
    throw new Error('Password must be at least 12 characters.')
  }

  const confirmation = await rl.question('Confirm password: ')
  if (password !== confirmation) {
    throw new Error('Passwords do not match.')
  }

  const name = await rl.question('Admin display name: ')

  console.log('Connecting to cafe database...')
  await connectDB()

  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database connection failed.')
  }

  let admin = await AdminAccount.findOne({ phone })

  if (admin) {
    admin.password = password
    await admin.save()
    console.log('Existing admin password updated.')
  } else {
    await AdminAccount.create({
      name: name.trim() || 'Cafe Owner',
      phone,
      password,
      role: 'owner',
      isActive: true
    })
    console.log('New admin account created.')
  }

  console.log('Admin reset completed.')
} catch (error) {
  console.error('Reset failed:', error.message)
} finally {
  rl.close()
  if (mongoose.connection.readyState !== 0) {
    await disconnectDB().catch(() => {})
  }
}
