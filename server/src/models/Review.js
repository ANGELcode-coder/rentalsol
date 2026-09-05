import mongoose from 'mongoose';
import { REVIEW_STATUSES, REVIEW_TARGETS } from '../config/constants.js';

const reviewSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: REVIEW_TARGETS, required: true },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetModel'
    },
    // Dynamically resolve which collection targetId points to
    targetModel: {
      type: String,
      enum: ['Listing', 'ServiceProvider', 'User'],
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 2000, default: '' },
    verifiedBooking: { type: Boolean, default: false },
    status: { type: String, enum: REVIEW_STATUSES, default: 'active' }
  },
  { timestamps: true }
);

// One review per (user, target) to prevent duplicates
reviewSchema.index({ targetType: 1, targetId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ targetType: 1, targetId: 1, status: 1 });
reviewSchema.index({ userId: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;