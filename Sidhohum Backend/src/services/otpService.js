import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import OtpVerification from '../models/OtpVerification.js'

// Hash OTP using SHA-256 for fast, secure comparison
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

export const generateAndSendOtp = async (phone, purpose = 'order_verification') => {
  // Normalize phone
  const cleanPhone = phone.replace(/\D/g, '').slice(-10)
  if (!cleanPhone || cleanPhone.length !== 10) {
    throw new Error('Please provide a valid 10-digit mobile number')
  }

  // Rate limiting: check recent OTP requests within the last 5 minutes
  const recentOtps = await OtpVerification.countDocuments({
    phone: cleanPhone,
    createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
  })

  if (recentOtps >= 4) {
    throw new Error('Too many OTP requests for this number. Please wait 5 minutes before trying again.')
  }

  // Generate 4-digit numeric OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString()
  const hashed = hashOtp(otp)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry

  // Invalidate any existing unused OTPs for this phone and purpose
  await OtpVerification.deleteMany({ phone: cleanPhone, purpose })

  // Save new record
  await OtpVerification.create({
    phone: cleanPhone,
    otpHash: hashed,
    expiresAt,
    attempts: 0,
    maxAttempts: 3,
    isVerified: false,
    purpose
  })

  const provider = process.env.OTP_PROVIDER || 'development'

  if (provider === 'twilio' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      // Dynamic import or fetch call to Twilio API
      const twilioAuth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString('base64')

      const params = new URLSearchParams()
      params.append('To', `+91${cleanPhone}`)
      params.append('From', process.env.TWILIO_PHONE_NUMBER)
      params.append(
        'Body',
        `Your Siddhohum Cafe verification code is ${otp}. Valid for 5 minutes. Do not share.`
      )

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${twilioAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Twilio SMS dispatch failed')
      }

      return { success: true, message: 'OTP sent via SMS', provider: 'twilio' }
    } catch (err) {
      console.error('Twilio SMS error:', err.message)
      throw new Error(`Failed to send SMS OTP: ${err.message}`)
    }
  } else if (provider === 'fast2sms' && process.env.FAST2SMS_API_KEY) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: cleanPhone
        })
      })

      const data = await response.json()
      if (!data.return) {
        throw new Error(data.message?.[0] || 'Fast2SMS dispatch failed')
      }

      return { success: true, message: 'OTP sent via Fast2SMS', provider: 'fast2sms' }
    } catch (err) {
      console.error('Fast2SMS error:', err.message)
      throw new Error(`Fast2SMS failed: ${err.message}`)
    }
  } else {
    // Development OTP Adapter: logs securely to server console
    console.log('----------------------------------------------------')
    console.log(`🔑 [DEV OTP DISPATCH] Phone: +91 ${cleanPhone}`)
    console.log(`🔑 [DEV OTP DISPATCH] Code: ${otp}`)
    console.log(`🔑 [DEV OTP DISPATCH] Expires at: ${expiresAt.toLocaleTimeString()}`)
    console.log('----------------------------------------------------')

    return {
      success: true,
      message: 'OTP sent successfully (Development mode)',
      provider: 'development',
      // In development mode, provide code in payload for seamless local testing without third-party billing
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    }
  }
}

export const verifyOtpCode = async (phone, code, purpose = 'order_verification') => {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10)
  const hashedInput = hashOtp(code.toString().trim())

  const record = await OtpVerification.findOne({
    phone: cleanPhone,
    purpose,
    expiresAt: { $gt: new Date() }
  })

  if (!record) {
    throw new Error('OTP has expired or was not requested. Please request a new code.')
  }

  if (record.attempts >= record.maxAttempts) {
    await OtpVerification.deleteOne({ _id: record._id })
    throw new Error('Maximum verification attempts exceeded. Please request a fresh OTP.')
  }

  if (record.otpHash !== hashedInput) {
    record.attempts += 1
    await record.save()
    const remaining = record.maxAttempts - record.attempts
    throw new Error(`Incorrect verification code. ${remaining} attempt(s) remaining.`)
  }

  // OTP verified successfully! Mark and clean up
  record.isVerified = true
  await record.save()
  // Delete consumed record
  await OtpVerification.deleteOne({ _id: record._id })

  return { verified: true, phone: cleanPhone }
}
