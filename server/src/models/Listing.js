import mongoose from 'mongoose';
import { LISTING_STATES, LISTING_STATUSES, LISTING_TYPES, AMENITIES } from '../config/constants.js';

const listingSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    // Listing type / category
    category: { type: String, enum: LISTING_TYPES, required: true },
    status: { type: String, enum: LISTING_STATUSES, required: true, default: 'rent' },
    // Location
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    neighbourhood: { type: String, trim: true, default: '' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    },
    // Property details
    size: { type: Number, min: 0 }, // m²
    bedrooms: { type: Number, min: 0, default: 0 },
    bathrooms: { type: Number, min: 0, default: 0 },
    furnished: { type: Boolean, default: false },
    amenities: { type: [String], enum: AMENITIES, default: [] },
    // Pricing
    price: { type: Number, required: true, min: 0 }, // FCFA/month for rent, total for sale
    currency: { type: String, default: 'XAF' },
    // Media
    photos: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    floorPlan: { type: String, default: '' },
    // Moderation & visibility
    verified: { type: Boolean, default: false },
    state: { type: String, enum: LISTING_STATES, default: 'pending' },
    available: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

listingSchema.index({ city: 1, status: 1, state: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ location: '2dsphere' });

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;