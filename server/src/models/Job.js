import mongoose from 'mongoose';
import { JOB_CATEGORIES, JOB_STATUSES, JOB_TYPES } from '../config/constants.js';

const jobSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    category: { type: String, enum: JOB_CATEGORIES, required: true, index: true },
    location: { type: String, required: true, trim: true },
    city: { type: String, trim: true, default: '' },
    type: { type: String, enum: JOB_TYPES, default: 'full_time' },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    requirements: { type: String, trim: true, maxlength: 3000, default: '' },
    salary: { type: String, default: '' }, // e.g. "150,000 - 250,000 XAF"
    currency: { type: String, default: 'XAF' },
    applicationDeadline: { type: Date, default: null },
    status: { type: String, enum: JOB_STATUSES, default: 'active' },
    featured: { type: Boolean, default: false },
    applicationCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ category: 1, city: 1 });
jobSchema.index({ featured: 1 });

const Job = mongoose.model('Job', jobSchema);

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true
    },
    seekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    cvUrl: { type: String, required: true },
    certificates: { type: [String], default: [] },
    coverLetter: { type: String, trim: true, maxlength: 3000, default: '' },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
      default: 'pending'
    },
    viewedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

applicationSchema.index({ jobId: 1, seekerId: 1 }, { unique: true });
applicationSchema.index({ seekerId: 1, createdAt: -1 });

const JobApplication = mongoose.model('JobApplication', applicationSchema);

export { Job, JobApplication };