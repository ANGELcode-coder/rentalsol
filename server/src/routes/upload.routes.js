import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { strictLimiter } from '../middleware/rateLimiter.js';
import { uploadSingle, uploadFile } from '../controllers/upload.controller.js';

const router = Router();

router.post('/', requireAuth, strictLimiter, uploadSingle, uploadFile);

export default router;