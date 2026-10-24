import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminAccountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Admin name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Admin phone number is required'],
      unique: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: [true, 'Admin password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
      type: String,
      enum: ['owner', 'manager', 'kitchen'],
      default: 'owner'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

adminAccountSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

adminAccountSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

const AdminAccount = mongoose.model('AdminAccount', adminAccountSchema)
export default AdminAccount
