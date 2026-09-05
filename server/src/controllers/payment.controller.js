import crypto from 'node:crypto';
import { Payment, ServiceBooking, ConciergeRequest } from '../models/index.js';
import { errors } from '../utils/apiError.js';
import { asyncHandler } from '../utils/apiError.js';
import { ok, created } from '../utils/response.js';
import { generateRef } from '../utils/generateRef.js';
import { PAYMENT_PROVIDERS, PAYMENT_STATUSES } from '../config/constants.js';
import { config } from '../config/index.js';

// Signs an outgoing gateway request with the provider API key (HMAC)
function signPayload(payload, key) {
  return crypto.createHmac('sha256', key).update(JSON.stringify(payload)).digest('hex');
}

// Gateway adapter interface — to be wired to real MTN/Orange APIs (BE-11 integration).
async function callGateway(provider, payload) {
  const creds = provider === 'mtn' ? config.mtnApi : config.orangeApi;
  if (!creds.base || !creds.key) {
    // No credentials configured → simulated flow for development.
    return { simulated: true, status: 'pending', externalId: `SIM-${provider.toUpperCase()}-${Date.now()}` };
  }
  // Real integration goes here: POST creds.base with signed payload, handle response.
  const signature = signPayload(payload, creds.key);
  console.log(`[gateway:${provider}] sending signed request (dummy):`, { ...payload, signature: signature.slice(0, 16) });
  return { simulated: false, status: 'pending', externalId: `G-${Date.now()}` };
}

// POST /payments/initiate
export const initiatePayment = asyncHandler(async (req, res) => {
  const { provider, amount, phone, bookingRef, conciergeRef, description } = req.body;

  if (!PAYMENT_PROVIDERS.includes(provider)) {
    throw errors.validation('provider must be mtn or orange', { provider: 'invalid' });
  }
  if (amount === undefined || Number(amount) <= 0) throw errors.validation('valid amount is required');
  if (!phone) throw errors.validation('phone is required');

  // Validate the linked transaction exists & belongs to user (if given)
  if (bookingRef) {
    const booking = await ServiceBooking.findOne({ ref: bookingRef });
    if (!booking) throw errors.notFound('Linked booking not found');
    if (booking.customerId.toString() !== req.user.id && req.user.role !== 'admin') {
      throw errors.forbidden('Booking does not belong to you');
    }
  }
  if (conciergeRef) {
    const req2 = await ConciergeRequest.findOne({ ref: conciergeRef });
    if (!req2) throw errors.notFound('Linked concierge request not found');
    if (req2.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      throw errors.forbidden('Concierge request does not belong to you');
    }
  }

  const paymentRef = generateRef('PAY');
  const payload = {
    reference: paymentRef,
    amount: Number(amount),
    currency: 'XAF',
    phone,
    description: description || ''
  };
  const gateway = await callGateway(provider, payload);

  const payment = await Payment.create({
    ref: paymentRef,
    userId: req.user.id,
    provider,
    amount: Number(amount),
    bookingRef: bookingRef || '',
    conciergeRef: conciergeRef || '',
    description: description || '',
    phone,
    status: 'pending',
    transactionId: gateway.externalId || ''
  });

  return created(res, { payment, gateway: { simulated: gateway.simulated } });
});

// POST /payments/confirm — user confirms OTP (simulated; real flow via gateway)
export const confirmPayment = asyncHandler(async (req, res) => {
  const { paymentRef } = req.body;
  if (!paymentRef) throw errors.validation('paymentRef is required');

  const payment = await Payment.findOne({ ref: paymentRef, userId: req.user.id });
  if (!payment) throw errors.notFound('Payment not found');
  if (payment.status === 'success') throw errors.conflict('Payment already successful');
  if (payment.status === 'refunded') throw errors.conflict('Payment was refunded');

  // Simulated confirmation marks success and links the booking/concierge as paid.
  payment.status = 'success';
  payment.receiptUrl = `/api/v1/payments/${payment.ref}/receipt`;
  await payment.save();

  if (payment.bookingRef) {
    await ServiceBooking.updateOne(
      { ref: payment.bookingRef },
      { paymentStatus: 'paid', paymentRef: payment.ref }
    );
  }
  if (payment.conciergeRef) {
    await ConciergeRequest.updateOne(
      { ref: payment.conciergeRef },
      { paymentStatus: 'paid', paymentRef: payment.ref }
    );
  }

  return ok(res, { payment });
});

// POST /payments/webhook — provider callback (no auth, signed)
export const paymentWebhook = asyncHandler(async (req, res) => {
  const { ref, status, transactionId } = req.body;
  // In production verify HMAC signature from the gateway before trusting input.
  if (!ref || !PAYMENT_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'invalid webhook payload' } });
  }

  const payment = await Payment.findOne({ ref });
  if (!payment) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'payment not found' } });
  }

  payment.status = status;
  if (transactionId) payment.transactionId = transactionId;
  if (status === 'success') payment.receiptUrl = `/api/v1/payments/${payment.ref}/receipt`;
  if (status === 'refunded') payment.refundedAt = new Date();
  await payment.save();

  if (status === 'success') {
    if (payment.bookingRef) {
      await ServiceBooking.updateOne({ ref: payment.bookingRef }, { paymentStatus: 'paid', paymentRef: payment.ref });
    }
    if (payment.conciergeRef) {
      await ConciergeRequest.updateOne({ ref: payment.conciergeRef }, { paymentStatus: 'paid', paymentRef: payment.ref });
    }
  }

  return res.status(200).json({ success: true, data: { received: true } });
});

// GET /payments/:ref — view own payment
export const getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ ref: req.params.ref });
  if (!payment) throw errors.notFound('Payment not found');
  if (payment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    throw errors.forbidden('Not your payment');
  }
  return ok(res, { payment });
});

// GET /payments/mine
export const myPayments = asyncHandler(async (req, res) => {
  const { status, provider, page = 1, limit = 20 } = req.query;
  const filter = { userId: req.user.id };
  if (status) filter.status = status;
  if (provider) filter.provider = provider;

  const total = await Payment.countDocuments(filter);
  const payments = await Payment.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return ok(
    res,
    { payments },
    { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  );
});

// GET /payments/:ref/receipt — returns receipt JSON
export const paymentReceipt = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ ref: req.params.ref });
  if (!payment) throw errors.notFound('Payment not found');
  const canView = payment.userId.toString() === req.user.id || req.user.role === 'admin';
  if (!canView) throw errors.forbidden('Not your payment');

  if (payment.status !== 'success') throw errors.conflict('Receipt only for successful payments');

  return ok(res, {
    receipt: {
      ref: payment.ref,
      provider: payment.provider,
      amount: payment.amount,
      currency: payment.currency,
      phone: payment.phone,
      bookingRef: payment.bookingRef,
      conciergeRef: payment.conciergeRef,
      transactionId: payment.transactionId,
      status: payment.status,
      paidAt: payment.paidAt || payment.updatedAt
    }
  });
});