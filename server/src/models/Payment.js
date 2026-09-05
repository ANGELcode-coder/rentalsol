import mongoose from 'mongoose';
import { PAYMENT_PROVIDERS, PAYMENT_STATUSES } from '../config/constants.js';

const paymentSchema = new mongoose.Schema(
  {
    ref: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    provider: { type: String, enum: PAYMENT_PROVIDERS, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'XAF' },
    // Linked transaction (booking or concierge request)
    bookingRef: { type: String, default: '' },
    conciergeRef: { type: String, default: '' },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    phone: { type: String, required: true, trim: true },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'pending' },
    transactionId: { type: String, default: '' },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed, default: null },
    refundedAt: { type: Date, default: null },
    receiptUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ provider: 1, status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;