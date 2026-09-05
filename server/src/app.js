import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { sanitize as mongoSanitize } from 'express-mongo-sanitize';
import { config } from './config/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { publicLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import listingRoutes from './routes/listing.routes.js';
import serviceRoutes from './routes/service.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import conciergeRoutes from './routes/concierge.routes.js';
import jobRoutes from './routes/job.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import { UPLOADS_DIR } from './controllers/upload.controller.js';
import openapiSpec from './spec/openapi.json' with { type: 'json' };

const app = express();

// Trust proxy for rate limiter when behind a reverse proxy
app.set('trust proxy', 1);

app.use(cors({ origin: true, credentials: true }));
app.use(helmet());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// NoSQL injection protection: strip $ operators and . from keys in body/params.
// (Express 5 exposes req.query as a getter, so we skip it — query values are never
// spread into database filters by controllers, only echoed back as string vars.)
app.use((req, _res, next) => {
  req.body = mongoSanitize(req.body);
  if (req.params) req.params = mongoSanitize(req.params);
  next();
});

// Global rate limit (payment webhooks exempted — they are provider-signed)
app.use(publicLimiter);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok', env: config.env } });
});

// OpenAPI spec (import into Postman/Insomnia/Swagger UI)
app.get('/api/v1/docs.json', (_req, res) => {
  res.status(200).json(openapiSpec);
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/concierge', conciergeRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/tickets', ticketRoutes);

// File uploads + local static serving (development fallback storage)
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/api/v1/uploads', uploadRoutes);

// 404 + error handling (after all routes)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;