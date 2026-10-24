import mongoose from 'mongoose'

const paymentRecordSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    orderNumber: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'UPI_ON_DELIVERY'],
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'COLLECTED', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    transactionReference: {
      type: String,
      default: '' // UPI UTR or Cash receipt no
    },
    collectedAt: {
      type: Date
    },
    collectedBy: {
      type: String,
      default: '' // Staff or rider name
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

const PaymentRecord = mongoose.model('PaymentRecord', paymentRecordSchema)
export default PaymentRecord
