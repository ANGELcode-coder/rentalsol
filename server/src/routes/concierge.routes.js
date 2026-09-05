import { Router } from 'express';
import * as concierge from '../controllers/concierge.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('client'), concierge.createConcierge);
router.get('/mine', requireRole('client'), concierge.myConcierge);
router.get('/providers/mine', requireRole('provider'), concierge.providerConcierge);
router.get('/:ref', concierge.getConcierge);
router.put('/:ref/status', requireRole('admin', 'provider'), concierge.updateConciergeStatus);

export default router;