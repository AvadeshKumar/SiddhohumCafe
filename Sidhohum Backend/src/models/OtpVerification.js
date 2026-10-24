import mongoose from 'mongoose'

const otpVerificationSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true
    },
    otpHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // MongoDB TTL index to auto-delete expired OTP records
    },
    attempts: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 3
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    purpose: {
      type: String,
      default: 'order_verification' // 'login', 'order_verification', 'registration'
    }
  },
  {
    timestamps: true
  }
)

const OtpVerification = mongoose.model('OtpVerification', otpVerificationSchema)
export default OtpVerification
