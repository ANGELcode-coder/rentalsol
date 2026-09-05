import { Router } from 'express';
import * as jobs from '../controllers/job.controller.js';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Public job browse
router.get('/', jobs.listJobs);
router.get('/:id', jobs.getJob);

// Seeker: my applications (BEFORE /:id routes)
router.get('/mine/applications', requireAuth, jobs.myApplications);
router.post('/:id/apply', requireAuth, jobs.applyToJob);

// Employer: manage jobs
router.post('/', requireAuth, requireRole('employer'), jobs.createJob);
router.put('/:id', requireAuth, requireRole('employer', 'admin'), jobs.updateJob);
router.delete('/:id', requireAuth, requireRole('employer', 'admin'), jobs.deleteJob);

// Employer: job applications
router.get('/:id/applications', requireAuth, requireRole('employer'), jobs.jobApplications);
router.put('/:id/applications/:appId/status', requireAuth, requireRole('employer', 'admin'), jobs.updateApplicationStatus);

export default router;