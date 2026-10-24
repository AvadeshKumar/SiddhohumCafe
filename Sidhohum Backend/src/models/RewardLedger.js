import mongoose from 'mongoose'

const rewardLedgerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true
    },
    pointsChange: {
      type: Number,
      required: true
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0
    },
    reason: {
      type: String,
      required: true // e.g. "Milestone Reward: Completed 5 Orders (+30 pts)"
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
)

const RewardLedger = mongoose.model('RewardLedger', rewardLedgerSchema)
export default RewardLedger
