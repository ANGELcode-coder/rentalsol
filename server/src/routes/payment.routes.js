import { Router } from 'express';
import * as payments from '../controllers/payment.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { strictLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Webhook: no auth (provider-signed)
router.post('/webhook', payments.paymentWebhook);

// Authenticated payment flows
router.use(requireAuth);
router.post('/initiate', strictLimiter, payments.initiatePayment);
router.post('/confirm', strictLimiter, payments.confirmPayment);
router.get('/mine', payments.myPayments);
router.get('/:ref', payments.getPayment);
router.get('/:ref/receipt', payments.paymentReceipt);

export default router;