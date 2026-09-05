import mongoose from 'mongoose';
import { REQUEST_STATUSES } from '../config/constants.js';

const bookingSchema = new mongoose.Schema(
  {
    ref: { type: String, required: true, unique: true, index: true },
    serviceType: { type: String, required: true, index: true }, // matches SERVICE_CATEGORIES keys
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      default: null
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      default: null
    },
    // Shared booking fields
    location: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    date: { type: Date, required: true },
    time: { type: String, default: '' },
    duration: { type: String, default: '' },
    frequency: { type: String, default: '' }, // e.g. once / daily / weekly / monthly
    requirements: { type: String, trim: true, maxlength: 3000, default: '' },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: REQUEST_STATUSES, default: 'submitted' },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'pending', 'paid', 'refunded'],
      default: 'unpaid'
    },
    paymentRef: { type: String, default: '' },
    assignedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ providerId: 1, status: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ date: 1 });

const ServiceBooking = mongoose.model('ServiceBooking', bookingSchema);
export default ServiceBooking;