import { Router } from 'express';
import * as tickets from '../controllers/ticket.controller.js';
import * as mod from '../controllers/moderation.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', tickets.createTicket);
router.get('/mine', tickets.myTickets);

// Admin ticket management
router.put('/:ref/status', requireRole('admin'), mod.setTicketStatus);
router.get('/:ref', tickets.getTicket);
router.post('/:ref/messages', tickets.replyTicket);

export default router;