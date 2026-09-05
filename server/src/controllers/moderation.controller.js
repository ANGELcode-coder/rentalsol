import { Listing } from '../models/index.js';
import { errors } from '../utils/apiError.js';
import { asyncHandler } from '../utils/apiError.js';
import { ok, message } from '../utils/response.js';

const STATE_VALUES = ['pending', 'active', 'suspended', 'removed'];

// PUT /admin/listings/:id/status — approve (active), reject/suspend/remove
export const setListingState = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!STATE_VALUES.includes(status)) {
    throw errors.validation('Invalid listing state', { status: 'invalid' });
  }
  const listing = await Listing.findByIdAndUpdate(req.params.id, { state: status }, { new: true });
  if (!listing) throw errors.notFound('Listing not found');
  return message(res, `Listing ${status}`);
});

// PUT /admin/listings/:id/verify — verified badge on/off
export const setListingVerified = asyncHandler(async (req, res) => {
  const { verified } = req.body;
  if (typeof verified !== 'boolean') {
    throw errors.validation('verified must be boolean', { verified: 'invalid' });
  }
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    { verified },
    { new: true }
  );
  if (!listing) throw errors.notFound('Listing not found');
  return ok(res, { listing });
});

// GET /admin/listings — admin view all (any state)
export const listAllListings = asyncHandler(async (req, res) => {
  const { state, status, city, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (state) filter.state = state;
  if (status) filter.status = status;
  if (city) filter.city = city;

  const total = await Listing.countDocuments(filter);
  const listings = await Listing.find(filter)
    .populate('ownerId', 'name email phone')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return ok(
    res,
    { listings },
    { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  );
});