import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' }, // Home, Work, Other
  addressLine: { type: String, required: true, trim: true },
  landmark: { type: String, trim: true, default: '' },
  instructions: { type: String, trim: true, default: '' },
  isDefault: { type: Boolean, default: false }
})

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      index: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    password: {
      type: String,
      select: false // Exclude from queries by default
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'staff'],
      default: 'customer'
    },
    addresses: [addressSchema],
    rewardPoints: {
      type: Number,
      default: 0,
      min: [0, 'Reward points cannot be negative']
    },
    completedOrdersCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

// Password hashing middleware if password is set or modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false
  return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model('User', userSchema)
export default User
