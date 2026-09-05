import mongoose from 'mongoose';
import { TICKET_STATUSES } from '../config/constants.js';

const ticketMessageSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    body: { type: String, required: true, trim: true, maxlength: 3000 },
    isAdmin: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    ref: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: ['complaint', 'question', 'report_listing', 'report_provider', 'refund', 'other'],
      default: 'other'
    },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    status: { type: String, enum: TICKET_STATUSES, default: 'open' },
    resolution: { type: String, trim: true, maxlength: 2000, default: '' },
    messages: { type: [ticketMessageSchema], default: [] },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

ticketSchema.index({ userId: 1, createdAt: -1 });
ticketSchema.index({ status: 1 });

const SupportTicket = mongoose.model('SupportTicket', ticketSchema);
export default SupportTicket;