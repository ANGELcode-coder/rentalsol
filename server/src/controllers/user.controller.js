import { User } from '../models/index.js';
import { errors } from '../utils/apiError.js';
import { asyncHandler } from '../utils/apiError.js';
import { ok, message } from '../utils/response.js';
import { USER_STATUSES, USER_LANGUAGES } from '../config/constants.js';

// GET /users/me
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw errors.notFound('User not found');
  return ok(res, { user });
});

// PUT /users/me — self profile update (limited fields)
export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'avatar', 'language', 'whatsappNumber'];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (updates.language && !USER_LANGUAGES.includes(updates.language)) {
    throw errors.validation('language must be en or fr', { language: 'invalid' });
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true
  });
  if (!user) throw errors.notFound('User not found');
  return ok(res, { user });
});

// GET /admin/users — admin list with filters
export const listUsers = asyncHandler(async (req, res) => {
  const { role, status, verified, q, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (verified !== undefined) filter.verified = verified === 'true';
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } }
    ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return ok(
    res,
    { users },
    { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  );
});

// PUT /admin/users/:id/status — active / suspended (admin)
export const setUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!USER_STATUSES.includes(status)) {
    throw errors.validation('Invalid status', { status: 'invalid' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!user) throw errors.notFound('User not found');
  return message(res, `User ${status}`);
});

// PUT /admin/users/:id/verify — verify flag + badge (admin)
export const verifyUser = asyncHandler(async (req, res) => {
  const { verified, badge } = req.body;
  const validBadges = ['none', 'agent', 'property', 'provider', 'employer'];
  if (badge && !validBadges.includes(badge)) {
    throw errors.validation('Invalid badge', { badge: 'invalid' });
  }
  const updates = {};
  if (verified !== undefined) updates.verified = Boolean(verified);
  if (badge !== undefined) updates.verificationBadge = badge;

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!user) throw errors.notFound('User not found');
  return ok(res, { user });
});