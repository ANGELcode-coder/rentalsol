import { ServiceProvider } from '../models/index.js';
import { errors } from '../utils/apiError.js';
import { asyncHandler } from '../utils/apiError.js';
import { ok, created } from '../utils/response.js';
import { SERVICE_CATEGORIES, PROVIDER_TYPES } from '../config/constants.js';

// GET /services/categories
export const getCategories = asyncHandler(async (req, res) => {
  return ok(res, { categories: SERVICE_CATEGORIES });
});

// GET /services/providers — public, filters
export const listProviders = asyncHandler(async (req, res) => {
  const { type, city, verified, minRating, q, page = 1, limit = 20 } = req.query;
  const filter = { verified: true };

  if (type) filter.type = type;
  if (city) {
    filter.serviceAreas = { $regex: city, $options: 'i' };
  }
  if (verified !== undefined) filter.verified = verified === 'true';
  if (minRating !== undefined) filter.rating = { $gte: Number(minRating) };
  if (q) {
    filter.$or = [
      { bio: { $regex: q, $options: 'i' } },
      { skills: { $regex: q, $options: 'i' } }
    ];
  }

  const total = await ServiceProvider.countDocuments(filter);
  const providers = await ServiceProvider.find(filter)
    .populate('userId', 'name avatar phone verified verificationBadge')
    .sort({ rating: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return ok(
    res,
    { providers },
    { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  );
});

// GET /services/providers/:id
export const getProvider = asyncHandler(async (req, res) => {
  const provider = await ServiceProvider.findById(req.params.id).populate(
    'userId',
    'name avatar phone verified verificationBadge'
  );
  if (!provider) throw errors.notFound('Provider not found');
  return ok(res, { provider });
});

// POST /services/providers — provider creates own profile
export const createProvider = asyncHandler(async (req, res) => {
  const {
    type, bio, skills, experienceYears, availability, serviceAreas,
    languages, pricing, references, photo, services
  } = req.body;

  if (!type) throw errors.validation('type is required');
  if (!PROVIDER_TYPES.includes(type)) {
    throw errors.validation('Invalid provider type', { type });
  }

  const existing = await ServiceProvider.findOne({ userId: req.user.id });
  if (existing) throw errors.conflict('Provider profile already exists');

  const provider = await ServiceProvider.create({
    userId: req.user.id,
    type,
    bio: bio || '',
    skills: skills || [],
    experienceYears: experienceYears || 0,
    availability: availability || [],
    serviceAreas: serviceAreas ? (Array.isArray(serviceAreas) ? serviceAreas : [serviceAreas]) : [],
    languages: languages || ['en', 'fr'],
    pricing: pricing || {},
    references: references || [],
    photo: photo || '',
    services: services || []
  });

  return created(res, { provider });
});

// PUT /services/providers/me — provider updates own profile
export const updateMyProvider = asyncHandler(async (req, res) => {
  const provider = await ServiceProvider.findOne({ userId: req.user.id });
  if (!provider) throw errors.notFound('Provider profile not found');

  const allowed = [
    'type', 'bio', 'skills', 'experienceYears', 'availability', 'serviceAreas',
    'languages', 'pricing', 'references', 'photo', 'services'
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const updated = await ServiceProvider.findByIdAndUpdate(provider._id, updates, {
    new: true,
    runValidators: true
  });
  return ok(res, { provider: updated });
});

// GET /services/providers/me — provider's own profile
export const getMyProvider = asyncHandler(async (req, res) => {
  const provider = await ServiceProvider.findOne({ userId: req.user.id });
  if (!provider) throw errors.notFound('Provider profile not found — create one first');
  return ok(res, { provider });
});