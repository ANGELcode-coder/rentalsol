import rateLimit from 'express-rate-limit';

const limiterResponse = {
  success: false,
  error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' }
};

export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: limiterResponse,
  // Provider-signed payment webhooks bypass the public limit
  skip: (req) => req.path === '/api/v1/payments/webhook'
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: limiterResponse
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: limiterResponse
});