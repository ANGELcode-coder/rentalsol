import { Router } from 'express';
import * as listings from '../controllers/listing.controller.js';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Public browse
router.get('/', optionalAuth, listings.listListings);
router.get('/stats/mine', requireAuth, requireRole('owner', 'agent'), listings.listingStats);
router.get('/:id', listings.getListing);

// Enquiry (public, but optionally auth so we can attribute leads)
router.post('/:id/enquiry', optionalAuth, listings.createEnquiry);

// Owner/Agent CRUD
router.post('/', requireAuth, requireRole('owner', 'agent', 'admin'), listings.createListing);
router.put('/:id', requireAuth, requireRole('owner', 'agent', 'admin'), listings.updateListing);
router.delete('/:id', requireAuth, requireRole('owner', 'agent', 'admin'), listings.deleteListing);

export default router;