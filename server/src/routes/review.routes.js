import { Router } from 'express';
import * as reviews from '../controllers/review.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/target/:targetType/:targetId', reviews.targetReviews);
router.get('/mine', requireAuth, reviews.myReviews);
router.post('/', requireAuth, requireRole('client', 'agent', 'provider', 'employer'), reviews.createReview);

export default router;