import { Router } from 'express';
import * as users from '../controllers/user.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// /api/v1/users — self profile
router.get('/me', requireAuth, users.getMe);
router.put('/me', requireAuth, users.updateMe);

export default router;