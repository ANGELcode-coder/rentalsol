import { Router } from 'express';
import * as bookings from '../controllers/booking.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('client'), bookings.createBooking);
router.get('/mine', requireRole('client'), bookings.myBookings);
router.get('/providers/mine', requireRole('provider'), bookings.providerBookings);
router.get('/:ref', bookings.getBooking);
router.put('/:ref/status', bookings.updateBookingStatus);

export default router;