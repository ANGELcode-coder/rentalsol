import { Router } from 'express';
import * as notifications from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', notifications.myNotifications);
router.get('/unread-count', notifications.unreadCount);
router.put('/read-all', notifications.markAllRead);
router.put('/:id/read', notifications.markRead);

export default router;