import { Job, JobApplication, User } from '../models/index.js';
import { errors } from '../utils/apiError.js';
import { asyncHandler } from '../utils/apiError.js';
import { ok, created, message } from '../utils/response.js';
import { JOB_CATEGORIES, JOB_TYPES, APPLICATION_STATUSES } from '../config/constants.js';

// GET /jobs — public, list active jobs
export const listJobs = asyncHandler(async (req, res) => {
  const { q, category, location, city, type, status = 'active', featured, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (type) filter.type = type;
  if (city) filter.city = city;
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (featured !== undefined) filter.featured = featured === 'true';
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
  }

  const total = await Job.countDocuments(filter);
  const jobs = await Job.find(filter)
    .populate('employerId', 'name avatar verified verificationBadge')
    .sort({ featured: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return ok(
    res,
    { jobs },
    { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  );
});

// GET /jobs/:id — public detail
export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('employerId', 'name avatar verified verificationBadge');
  if (!job) throw errors.notFound('Job not found');
  return ok(res, { job });
});

// POST /jobs — employer creates
export const createJob = asyncHandler(async (req, res) => {
  const {
    title, category, location, city, type, description, requirements,
    salary, applicationDeadline, featured
  } = req.body;

  if (!title || !category || !location || !description) {
    throw errors.validation('title, category, location and description are required');
  }
  if (!JOB_CATEGORIES.includes(category)) throw errors.validation('Invalid category', { category });
  if (type && !JOB_TYPES.includes(type)) throw errors.validation('Invalid job type', { type });

  const job = await Job.create({
    employerId: req.user.id,
    title, category, location, city: city || '', type: type || 'full_time',
    description, requirements: requirements || '', salary: salary || '',
    applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
    featured: Boolean(featured)
  });

  return created(res, { job });
});

// PUT /jobs/:id — employer updates own
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw errors.notFound('Job not found');
  if (job.employerId.toString() !== req.user.id && req.user.role !== 'admin') {
    throw errors.forbidden('Only the posting employer can edit this job');
  }

  const allowed = [
    'title', 'category', 'location', 'city', 'type', 'description',
    'requirements', 'salary', 'applicationDeadline', 'featured', 'status'
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const updated = await Job.findByIdAndUpdate(job._id, updates, { new: true, runValidators: true });
  return ok(res, { job: updated });
});

// DELETE /jobs/:id — employer deletes
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw errors.notFound('Job not found');
  if (job.employerId.toString() !== req.user.id && req.user.role !== 'admin') {
    throw errors.forbidden('Only the posting employer can delete this job');
  }
  await job.deleteOne();
  return message(res, 'Job deleted');
});

// POST /jobs/:id/apply — seeker applies
export const applyToJob = asyncHandler(async (req, res) => {
  const { cvUrl, certificates, coverLetter } = req.body;
  if (!cvUrl) throw errors.validation('cvUrl is required');

  const job = await Job.findOne({ _id: req.params.id, status: 'active' });
  if (!job) throw errors.notFound('Job not found or closed');

  const existing = await JobApplication.findOne({ jobId: job._id, seekerId: req.user.id });
  if (existing) throw errors.conflict('You have already applied to this job');

  const application = await JobApplication.create({
    jobId: job._id,
    seekerId: req.user.id,
    cvUrl,
    certificates: certificates || [],
    coverLetter: coverLetter || ''
  });

  // Bump the counter on the job
  await Job.updateOne({ _id: job._id }, { $inc: { applicationCount: 1 } });

  return created(res, { application });
});

// GET /jobs/mine/applications — seeker tracks own applications
export const myApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const filter = { seekerId: req.user.id };

  const total = await JobApplication.countDocuments(filter);
  const applications = await JobApplication.find(filter)
    .populate('jobId', 'title category location city salary status')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  return ok(
    res,
    { applications },
    { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  );
});

// GET /jobs/:id/applications — employer reviews candidates
export const jobApplications = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw errors.notFound('Job not found');
  if (job.employerId.toString() !== req.user.id && req.user.role !== 'admin') {
    throw errors.forbidden('Only the posting employer can view applications');
  }

  const applications = await JobApplication.find({ jobId: job._id })
    .populate('seekerId', 'name email phone avatar')
    .sort({ createdAt: -1 });

  return ok(res, { applications });
});

// PUT /jobs/:id/applications/:appId/status — employer updates application status
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!APPLICATION_STATUSES.includes(status)) {
    throw errors.validation('Invalid application status', { status: 'invalid' });
  }

  const job = await Job.findById(req.params.id);
  if (!job) throw errors.notFound('Job not found');
  if (job.employerId.toString() !== req.user.id && req.user.role !== 'admin') {
    throw errors.forbidden('Only the posting employer can update applications');
  }

  const application = await JobApplication.findOneAndUpdate(
    { _id: req.params.appId, jobId: job._id },
    { status },
    { new: true }
  );
  if (!application) throw errors.notFound('Application not found');
  return ok(res, { application });
});