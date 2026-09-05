import { Listing, Enquiry, ServiceBooking, User } from '../models/index.js';
import { errors } from '../utils/apiError.js';
import { asyncHandler } from '../utils/apiError.js';
import { ok, created, message } from '../utils/response.js';
import {
  LISTING_TYPES,
  LISTING_STATUSES,
  AMENITIES,
  LISTING_STATES
} from '../config/constants.js';

// ---- Public: search/browse listings ----
export const listListings = asyncHandler(async (req, res) => {
  const {
    q,
    city,
    neighbourhood,
    type,
    status,
    category,
    minPrice,
    maxPrice,
    minBeds,
    maxBeds,
    amenities,
    featured,
    verified,
    sort = 'newest',
    page = 1,
    limit = 20
  } = req.query;

  const filter = { state: 'active' };

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { city: { $regex: q, $options: 'i' } }
    ];
  }
  if (city) filter.city = city;
  if (neighbourhood) filter.neighbourhood = { $regex: neighbourhood, $options: 'i' };
  if (type) {
    filter.category = Array.isArray(type) ? { $in: type } : type;
  }
  if (status) filter.status = status; // rent|sale|short|long
  if (category) filter.category = category;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }
  if (minBeds !== undefined) filter.bedrooms = { $gte: Number(minBeds) };
  if (maxBeds !== undefined) filter.bedrooms = { ...(filter.bedrooms || {}), $lte: Number(maxBeds) };
  if (amenities) {
    filter.amenities = { $all: Array.isArray(amenities) ? amenities : [amenities] };
  }
  if (featured !== undefined) filter.featured = featured === 'true';
  if (verified !== undefined) filter.verified = verified === 'true';

  const sortMap = {
    newest: { createdAt: -1 },
    rent: { price: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 }
  };

  const total = await Listing.countDocuments(filter);
  const listings = await Listing.find(filter)
    .populate('ownerId', 'name phone whatsappNumber avatar verified verificationBadge')
    .sort(sortMap[sort] || sortMap.newest)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return ok(
    res,
    { listings },
    { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  );
});

// ---- Public: single listing detail ----
export const getListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findOne({ _id: req.params.id, state: 'active' }).populate(
    'ownerId',
    'name phone whatsappNumber avatar verified verificationBadge'
  );
  if (!listing) throw errors.notFound('Listing not found');
  return ok(res, { listing });
});

// ---- Owner/Agent: create listing ----
export const createListing = asyncHandler(async (req, res) => {
  const {
    title, description, category, status, address, city, neighbourhood,
    size, bedrooms, bathrooms, furnished, amenities, price, photos, videos,
    floorPlan, location
  } = req.body;

  // validation basics
  if (!title || !description || !category || !address || !city) {
    throw errors.validation('title, description, category, address and city are required');
  }
  if (price === undefined || Number(price) < 0) throw errors.validation('valid price is required');
  if (category && !LISTING_TYPES.includes(category)) {
    throw errors.validation('Invalid category', { category });
  }
  if (status && !LISTING_STATUSES.includes(status)) {
    throw errors.validation('Invalid status', { status });
  }

  const listing = await Listing.create({
    ownerId: req.user.id,
    title, description, category, status: status || 'rent',
    address, city, neighbourhood: neighbourhood || '',
    size, bedrooms: bedrooms || 0, bathrooms: bathrooms || 0,
    furnished: Boolean(furnished),
    amenities: amenities || [],
    price: Number(price),
    photos: photos || [],
    videos: videos || [],
    floorPlan: floorPlan || '',
    location: location || undefined,
    // New listing starts pending moderation unless admin
    state: req.user.role === 'admin' ? 'active' : 'pending'
  });

  return created(res, { listing });
});

// ---- Owner/Agent: update own listing ----
export const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw errors.notFound('Listing not found');
  // owner OR agent OR admin may edit. Agents manage listings they created.
  const isOwner = listing.ownerId.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') {
    throw errors.forbidden('You can only edit your own listings');
  }

  const allowed = [
    'title', 'description', 'category', 'status', 'address', 'city', 'neighbourhood',
    'size', 'bedrooms', 'bathrooms', 'furnished', 'amenities', 'price', 'photos',
    'videos', 'floorPlan', 'available', 'location'
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const updated = await Listing.findByIdAndUpdate(listing._id, updates, {
    new: true,
    runValidators: true
  });
  return ok(res, { listing: updated });
});

// ---- Owner/Agent: delete own listing ----
export const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) throw errors.notFound('Listing not found');
  const isOwner = listing.ownerId.toString() === req.user.id;
  if (!isOwner && req.user.role !== 'admin') {
    throw errors.forbidden('You can only delete your own listings');
  }

  // Soft-delete if it has active bookings, hard-delete otherwise
  const activeBooking = await ServiceBooking.findOne({
    listingId: listing._id,
    status: { $nin: ['completed', 'cancelled'] }
  });
  if (activeBooking) {
    listing.state = 'removed';
    await listing.save();
    return message(res, 'Listing deactivated (has active bookings)');
  }

  await listing.deleteOne();
  return message(res, 'Listing deleted');
});

// ---- Owner stats ----
export const listingStats = asyncHandler(async (req, res) => {
  const [total, active, rented, views, leads] = await Promise.all([
    Listing.countDocuments({ ownerId: req.user.id }),
    Listing.countDocuments({ ownerId: req.user.id, available: true }),
    Listing.countDocuments({ ownerId: req.user.id, available: false }),
    Listing.aggregate([{ $match: { ownerId: req.user._id } }, { $group: { _id: null, v: { $sum: '$viewCount' } } }]),
    Enquiry.countDocuments({ listingId: { $in: await Listing.find({ ownerId: req.user.id }).distinct('_id') } })
  ]);
  return ok(res, {
    stats: {
      total,
      active,
      rented,
      views: views.length ? views[0].v : 0,
      leads
    }
  });
});

// ---- Public: submit enquiry on a listing ----
export const createEnquiry = asyncHandler(async (req, res) => {
  const { channel, whatsappNumber, phone, message: contactMessage } = req.body;
  if (!channel || !['whatsapp', 'phone', 'form'].includes(channel)) {
    throw errors.validation('channel must be whatsapp, phone or form', { channel: 'invalid' });
  }

  const listing = await Listing.findOne({ _id: req.params.id, state: 'active' }).populate('ownerId');
  if (!listing) throw errors.notFound('Listing not found');

  const enquiry = await Enquiry.create({
    listingId: listing._id,
    userId: req.user?.id || null,
    channel,
    whatsappNumber: whatsappNumber || '',
    phone: phone || '',
    message: contactMessage || ''
  });

  return created(res, {
    enquiry,
    contactInfo: {
      whatsapp: listing.ownerId.whatsappNumber || listing.ownerId.phone,
      phone: listing.ownerId.phone
    }
  });
});