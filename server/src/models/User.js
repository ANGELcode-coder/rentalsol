import mongoose from 'mongoose';
import { ROLES, USER_STATUSES, USER_LANGUAGES } from '../config/constants.js';

const kycDocSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['passport', 'national_id', 'birth_certificate', 'proof_of_residence', 'business_document', 'other'], required: true },
    // Stored in private storage; NEVER served from public URLs.
    url: { type: String, required: true },
    title: { type: String, trim: true },
    verified: { type: Boolean, default: false }
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true, default: 'client' },
    avatar: { type: String, default: '' },
    language: { type: String, enum: USER_LANGUAGES, default: 'en' },
    verified: { type: Boolean, default: false },
    status: { type: String, enum: USER_STATUSES, default: 'active' },
    verificationBadge: {
      type: String,
      enum: ['none', 'agent', 'property', 'provider', 'employer'],
      default: 'none'
    },
    kycDocs: { type: [kycDocSchema], default: [] },
    whatsappNumber: { type: String, default: '' },
    resetPasswordToken: { type: String, default: null, select: false },
    resetPasswordExpires: { type: Date, default: null, select: false }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_, ret) {
        delete ret.passwordHash;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.kycDocs;
        return ret;
      }
    }
  }
);

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ verified: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);
export default User;