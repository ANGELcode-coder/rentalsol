import { Review, Listing, ServiceProvider, User } from '../models/index.js';
import { errors } from '../utils/apiError.js';
import { asyncHandler } from '../utils/apiError.js';
import { ok, created } from '../utils/response.js';
import { REVIEW_TARGETS } from '../config/constants.js';

const TARGET_MODELS = { listing: Listing, provider: ServiceProvider, agent: User, employer: User };

// POST /reviews — create a review for a listing, provider or employer agent
export const createReview = asyncHandler(async (req, res) => {
  const { targetType, targetId, rating, comment } = req.body;
  if (!REVIEW_TARGETS.includes(targetType)) {
    throw errors.validation('targetType must be listing, agent, provider or employer', { targetType: 'invalid' });
  }
  if (!targetId) throw errors.validation('targetId is required');
  if (rating === undefined || rating < 1 || rating > 5) {
    throw errors.validation('rating must be between 1 and 5');
  }

  const targetModel = targetType === 'listing' ? 'Listing' : targetType === 'provider' ? 'ServiceProvider' : 'User';
  const target = await TARGET_MODELS[targetType].findById(targetId);
  if (!target) throw errors.notFound('Review target not found');
  if (targetType === 'provider') {
    const provider = await ServiceProvider.findById(targetId);
    if (provider && provider.userId.toString() === req.user.id) {
      throw errors.conflict('You cannot review yourself');
    }
  }
  if (targetType === 'listing') {
    const listing = await Listing.findById(targetId);
    if (listing && listing.ownerId.toString() === req.user.id) {
      throw errors.conflict('You cannot review your own listing');
    }
  }

  const existing = await Review.findOne({ targetType, targetId, userId: req.user.id });
  if (existing) throw errors.conflict('You already reviewed this item');

  const review = await Review.create({
    targetType, targetId, targetModel,
    userId: req.user.id,
    rating: Number(rating),
    comment: comment || '',
    verifiedBooking: false,
    status: 'active'
  });

  return created(res, { review });
});

// GET /reviews/target/:targetType/:targetId — public list, aggregated
export const targetReviews = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.params;
  if (!REVIEW_TARGETS.includes(targetType)) throw errors.validation('Invalid targetType');
  const { page = 1, limit = 20 } = req.query;

  const filter = { targetType, targetId, status: 'active' };
  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .populate('userId', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const agg = await Review.aggregate([
    { $match: filter },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  return ok(res, {
    reviews,
    summary: { averageRating: agg[0] ? +agg[0].avg.toFixed(1) : null, total: agg[0] ? agg[0].count : 0 }
  }, { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) });
});

// GET /reviews/mine
export const myReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const filter = { userId: req.user.id };
  const total = await Review.countDocuments(filter);
  const reviews = await Review.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  return ok(res, { reviews }, { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) });
});