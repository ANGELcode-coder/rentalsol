import { Router } from 'express';
import * as users from '../controllers/user.controller.js';
import * as mod from '../controllers/moderation.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

// /api/v1/admin/users
router.get('/users', users.listUsers);
router.put('/users/:id/status', users.setUserStatus);
router.put('/users/:id/verify', users.verifyUser);

// /api/v1/admin/listings
router.get('/listings', mod.listAllListings);
router.put('/listings/:id/status', mod.setListingState);
router.put('/listings/:id/verify', mod.setListingVerified);

export default router;