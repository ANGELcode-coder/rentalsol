import { ConciergeRequest, ServiceProvider } from '../models/index.js';
import { errors } from '../utils/apiError.js';
import { asyncHandler } from '../utils/apiError.js';
import { ok, created } from '../utils/response.js';
import { generateRef } from '../utils/generateRef.js';
import { CONCIERGE_TYPES, REQUEST_STATUSES } from '../config/constants.js';

const ADMIN_STATUSES = [...REQUEST_STATUSES];

// POST /concierge — client creates request
export const createConcierge = asyncHandler(async (req, res) => {
  const { type, details, location, city, date, time, cost } = req.body;
  if (!type) throw errors.validation('type is required');
  if (!CONCIERGE_TYPES.includes(type)) {
    throw errors.validation('Invalid concierge type', { type });
  }
  if (!details) throw errors.validation('details are required');

  const request = await ConciergeRequest.create({
    ref: generateRef('CON'),
    userId: req.user.id,
    type,
    details,
    location: location || '',
    city: city || '',
    date: date ? new Date(date) : null,
    time: time || '',
    cost: cost !== undefined ? Number(cost) : 0,
    status: 'submitted'
  });

  return created(res, { request });
});

// GET /concierge/mine — client's requests
export const myConcierge = asyncHandler(async (req, res) => {
  const { status, type, page = 1, limit = 20 } = req.query;
  const filter = { userId: req.user.id };
  if (status) filter.status = status;
  if (type) filter.type = type;

  const total = await ConciergeRequest.countDocuments(filter);
  const requests = await ConciergeRequest.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return ok(
    res,
    { requests },
    { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  );
});

// GET /concierge/providers/mine — provider-assigned concierge tasks
export const providerConcierge = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const provider = await ServiceProvider.findOne({ userId: req.user.id });
  if (!provider) throw errors.notFound('Provider profile not found');

  const filter = { assigneeId: provider._id };
  if (status) filter.status = status;

  const total = await ConciergeRequest.countDocuments(filter);
  const requests = await ConciergeRequest.find(filter)
    .sort({ createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return ok(
    res,
    { requests },
    { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  );
});

// GET /concierge/:ref — request detail (owner or admin)
export const getConcierge = asyncHandler(async (req, res) => {
  const request = await ConciergeRequest.findOne({ ref: req.params.ref });
  if (!request) throw errors.notFound('Request not found');

  const isOwner = request.userId.toString() === req.user.id;
  let isAssignee = false;
  if (request.assigneeId && req.user.role === 'provider') {
    const prov = await ServiceProvider.findById(request.assigneeId);
    isAssignee = prov && prov.userId.toString() === req.user.id;
  }

  if (!isOwner && !isAssignee && req.user.role !== 'admin') {
    throw errors.forbidden('You do not have access to this request');
  }
  return ok(res, { request });
});

// PUT /concierge/:ref/status — admin assigns/transitions, provider transitions
export const updateConciergeStatus = asyncHandler(async (req, res) => {
  const { status, assigneeId } = req.body;
  if (!status || !REQUEST_STATUSES.includes(status)) {
    throw errors.validation('Invalid status', { status: 'invalid' });
  }

  const request = await ConciergeRequest.findOne({ ref: req.params.ref });
  if (!request) throw errors.notFound('Request not found');

  if (req.user.role === 'admin') {
    if (!ADMIN_STATUSES.includes(status)) throw errors.forbidden('Invalid admin transition');
    if (assigneeId) {
      const provider = await ServiceProvider.findById(assigneeId);
      if (!provider) throw errors.notFound('Assignee provider not found');
      request.assigneeId = provider._id;
    }
  } else if (req.user.role === 'provider') {
    const prov = await ServiceProvider.findById(request.assigneeId);
    const isAssignee = prov && prov.userId.toString() === req.user.id;
    if (!isAssignee) throw errors.forbidden('Not assigned to you');
    if (!['confirmed', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      throw errors.forbidden('Invalid provider transition');
    }
  } else {
    throw errors.forbidden('Not permitted');
  }

  request.status = status;
  if (status === 'completed') request.completedAt = new Date();
  await request.save();

  return ok(res, { request });
});