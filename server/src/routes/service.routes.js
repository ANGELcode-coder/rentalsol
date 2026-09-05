import { Router } from 'express';
import * as providers from '../controllers/provider.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Public: categories + provider browse
router.get('/categories', providers.getCategories);
router.get('/providers', providers.listProviders);

// Authenticated: provider's own profile (BEFORE :id route)
router.get('/providers/me/profile', requireAuth, requireRole('provider'), providers.getMyProvider);
router.post('/providers', requireAuth, requireRole('provider'), providers.createProvider);
router.put('/providers/me', requireAuth, requireRole('provider'), providers.updateMyProvider);

// Public: single provider detail (after /me routes)
router.get('/providers/:id', providers.getProvider);

export default router;