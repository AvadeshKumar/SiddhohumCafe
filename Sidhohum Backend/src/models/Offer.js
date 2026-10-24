import mongoose from 'mongoose'

const offerSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    maxDiscountAmount: {
      type: Number,
      default: 100,
      min: 0
    },
    applicableDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5] // Monday through Friday by default
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
)

const Offer = mongoose.model('Offer', offerSchema)
export default Offer
