import mongoose from 'mongoose';
import { PROVIDER_TYPES, USER_LANGUAGES } from '../config/constants.js';

const pricingSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: '' }, // e.g. "per hour", "per day", "per month"
    amount: { type: Number, min: 0, default: 0 },
    hourly: { type: Number, min: 0, default: 0 },
    daily: { type: Number, min: 0, default: 0 },
    monthly: { type: Number, min: 0, default: 0 }
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    start: { type: String, default: '08:00' },
    end: { type: String, default: '18:00' }
  },
  { _id: false }
);

const providerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    type: { type: String, enum: PROVIDER_TYPES, required: true, index: true },
    bio: { type: String, trim: true, maxlength: 2000, default: '' },
    skills: { type: [String], default: [] },
    experienceYears: { type: Number, min: 0, default: 0 },
    availability: { type: [availabilitySchema], default: [] },
    serviceAreas: { type: [String], default: [] }, // cities/neighbourhoods served
    languages: { type: [String], enum: USER_LANGUAGES, default: ['en', 'fr'] },
    pricing: { type: pricingSchema, default: () => ({}) },
    references: { type: [String], default: [] },
    photo: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    services: { type: [String], default: [] }
  },
  { timestamps: true }
);

providerSchema.index({ type: 1, verified: 1 });
providerSchema.index({ rating: -1 });
providerSchema.index({ serviceAreas: 1 });

const ServiceProvider = mongoose.model('ServiceProvider', providerSchema);
export default ServiceProvider;