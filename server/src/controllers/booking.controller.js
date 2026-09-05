import { ServiceBooking, ServiceProvider, Listing, Payment } from '../models/index.js';
import { errors } from '../utils/apiError.js';
import { asyncHandler } from '../utils/apiError.js';
import { ok, created, message } from '../utils/response.js';
import { generateRef } from '../utils/generateRef.js';
import { REQUEST_STATUSES } from '../config/constants.js';

const CLIENT_TRANSITIONS = ['cancelled'];
const PROVIDER_TRANSITIONS = ['under_review', 'assigned', 'confirmed', 'in_progress', 'completed', 'cancelled'];
const ADMIN_TRANSITIONS = ['under_review', 'assigned', 'confirmed', 'in_progress', 'completed', 'cancelled'];

// POST /bookings — client creates booking
export const createBooking = asyncHandler(async (req, res) => {
  const {
    serviceType, providerId, listingId, location, city, date, time,
    duration, frequency, requirements, price
  } = req.body;

  if (!serviceType || !date) throw errors.validation('serviceType and date are required');
  if (price === undefined || Number(price) < 0) throw errors.validation('valid price is required');

  // Validate provider if given
  if (providerId) {
    const provider = await ServiceProvider.findById(providerId);
    if (!provider) throw errors.notFound('Provider not found');
  }

  const booking = await ServiceBooking.create({
    ref: generateRef('BOK'),
    serviceType,
    customerId: req.user.id,
    providerId: providerId || null,
    listingId: listingId || null,
    location: location || '',
    city: city || '',
    date: new Date(date),
    time: time || '',
    duration: duration || '',
    frequency: frequency || '',
    requirements: requirements || '',
    price: Number(price),
    status: 'submitted'
  });

  return created(res, { booking });
});

// GET /bookings/:ref — anyone who owns the booking
export const getBooking = asyncHandler(async (req, res) => {
  const booking = await ServiceBooking.findOne({ ref: req.params.ref });
  if (!booking) throw errors.notFound('Booking not found');

  const isCustomer = booking.customerId.toString() === req.user.id;
  // Providers can view bookings assigned to them
  let isProvider = false;
  if (booking.providerId && req.user.role === 'provider') {
    const prov = await ServiceProvider.findById(booking.providerId);
    isProvider = prov && prov.userId.toString() === req.user.id;
  }

  if (!isCustomer && !isProvider && req.user.role !== 'admin') {
    throw errors.forbidden('You do not have access to this booking');
  }
  return ok(res, { booking });
});

// GET /bookings/mine — client's bookings
export const myBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = { customerId: req.user.id };
  if (status) filter.status = status;

  const total = await ServiceBooking.countDocuments(filter);
  const bookings = await ServiceBooking.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return ok(
    res,
    { bookings },
    { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  );
});

// GET /bookings/providers/mine — provider's bookings
export const providerBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const provider = await ServiceProvider.findOne({ userId: req.user.id });
  if (!provider) throw errors.notFound('Provider profile not found');

  const filter = { providerId: provider._id };
  if (status) filter.status = status;

  const total = await ServiceBooking.countDocuments(filter);
  const bookings = await ServiceBooking.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return ok(
    res,
    { bookings },
    { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  );
});

// PUT /bookings/:ref/status — role-based transitions
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!REQUEST_STATUSES.includes(status)) {
    throw errors.validation('Invalid booking status', { status: 'invalid' });
  }

  const booking = await ServiceBooking.findOne({ ref: req.params.ref });
  if (!booking) throw errors.notFound('Booking not found');

  // Client can only cancel their own
  if (req.user.role === 'client') {
    const isCustomer = booking.customerId.toString() === req.user.id;
    if (!isCustomer) throw errors.forbidden('Not your booking');
    if (!CLIENT_TRANSITIONS.includes(status)) {
      throw errors.forbidden('Clients may only cancel a booking');
    }
  } else if (req.user.role === 'provider') {
    const prov = await ServiceProvider.findById(booking.providerId);
    const isProvider = prov && prov.userId.toString() === req.user.id;
    if (!isProvider) throw errors.forbidden('Not your booking');
    if (!PROVIDER_TRANSITIONS.includes(status)) {
      throw errors.forbidden('Invalid provider transition');
    }
  } else if (req.user.role === 'admin') {
    if (!ADMIN_TRANSITIONS.includes(status)) {
      throw errors.forbidden('Invalid admin transition');
    }
  } else {
    throw errors.forbidden('Not permitted');
  }

  booking.status = status;
  if (status === 'completed') booking.completedAt = new Date();
  if (status === 'assigned') booking.assignedAt = new Date();
  await booking.save();

  return ok(res, { booking });
});