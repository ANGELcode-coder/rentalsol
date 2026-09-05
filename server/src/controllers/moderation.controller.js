import { Listing, Review, SupportTicket } from '../models/index.js';
import { errors } from '../utils/apiError.js';
import { asyncHandler } from '../utils/apiError.js';
import { ok, message } from '../utils/response.js';
import { TICKET_STATUSES } from '../config/constants.js';

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

// GET /admin/reviews — all reviews (including hidden), filter by target
export const listAllReviews = asyncHandler(async (req, res) => {
  const { targetType, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (targetType) filter.targetType = targetType;
  if (status) filter.status = status;

  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  return ok(res, { reviews }, { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) });
});

// PUT /admin/reviews/:id/status — hide/unhide review
export const setReviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['active', 'hidden'].includes(status)) throw errors.validation('status must be active or hidden');
  const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!review) throw errors.notFound('Review not found');
  return ok(res, { review });
});

// GET /admin/tickets — all tickets, filter by status
export const listAllTickets = asyncHandler(async (req, res) => {
  const { status, category, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;

  const total = await SupportTicket.countDocuments(filter);
  const tickets = await SupportTicket.find(filter)
    .populate('userId', 'name email phone')
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  return ok(res, { tickets }, { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) });
});

// PUT /admin/tickets/:ref/status + assign
export const setTicketStatus = asyncHandler(async (req, res) => {
  const { status, resolution, assignedTo } = req.body;
  if (!TICKET_STATUSES.includes(status)) throw errors.validation('Invalid ticket status');

  const update = { status };
  if (resolution !== undefined) update.resolution = resolution;
  if (assignedTo) update.assignedTo = assignedTo;

  const ticket = await SupportTicket.findOneAndUpdate({ ref: req.params.ref }, update, { new: true });
  if (!ticket) throw errors.notFound('Ticket not found');
  return ok(res, { ticket });
});