import mongoose from 'mongoose';
import { CONCIERGE_TYPES, REQUEST_STATUSES } from '../config/constants.js';

const conciergeSchema = new mongoose.Schema(
  {
    ref: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: { type: String, enum: CONCIERGE_TYPES, required: true, index: true },
    details: { type: String, trim: true, maxlength: 3000, default: '' },
    location: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    date: { type: Date, default: null },
    time: { type: String, default: '' },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      default: null
    },
    cost: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: REQUEST_STATUSES, default: 'submitted' },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending', 'paid', 'refunded'],
      default: 'unpaid'
    },
    paymentRef: { type: String, default: '' },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

conciergeSchema.index({ userId: 1, createdAt: -1 });
conciergeSchema.index({ status: 1 });
conciergeSchema.index({ type: 1 });

const ConciergeRequest = mongoose.model('ConciergeRequest', conciergeSchema);
export default ConciergeRequest;