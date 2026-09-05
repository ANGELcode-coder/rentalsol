import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { User } from '../models/index.js';
import { signToken } from '../utils/token.js';
import { errors } from '../utils/apiError.js';
import { asyncHandler } from '../utils/apiError.js';
import { ok, created } from '../utils/response.js';

const REGISTRABLE_ROLES = ['client', 'owner', 'agent', 'provider', 'employer'];

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role = 'client', language = 'en' } = req.body;

  if (!name || !email || !password) {
    throw errors.validation('name, email and password are required');
  }
  if (!phone) throw errors.validation('phone is required');
  if (password.length < 8) {
    throw errors.validation('Password must be at least 8 characters', { password: 'min 8 chars' });
  }
  if (!REGISTRABLE_ROLES.includes(role)) {
    throw errors.validation('Role not allowed for registration', { role });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw errors.conflict('Email already registered');

  const passwordHash = await bcrypt.hash(password, 10);
  // Owner/agent/providers require admin activation; clients active immediately.
  const needsActivation = ['owner', 'agent', 'provider', 'employer'].includes(role);

  const user = await User.create({
    name,
    email,
    phone,
    passwordHash,
    role,
    language,
    status: needsActivation ? 'pending' : 'active'
  });

  const token = signToken(user);
  return created(res, { token, user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw errors.validation('email and password are required');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) throw errors.unauthorized('Invalid credentials');

  if (user.status === 'suspended') throw errors.forbidden('Account suspended');

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) throw errors.unauthorized('Invalid credentials');

  const token = signToken(user);
  return ok(res, { token, user });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw errors.notFound('User not found');
  return ok(res, { user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw errors.validation('email is required');

  const user = await User.findOne({ email: email.toLowerCase() });
  // Always respond generically to avoid account enumeration
  if (!user) return ok(res, { message: 'If that email exists, a reset link has been sent' });

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1h
  await user.save();

  // TODO(BE-13): send email via notification service.
  // console.log('reset link', `${FRONTEND_URL}/reset-password?token=${token}`);
  return ok(res, { message: 'If that email exists, a reset link has been sent' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) throw errors.validation('token and newPassword are required');
  if (newPassword.length < 8) {
    throw errors.validation('Password must be at least 8 characters');
  }

  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) throw errors.validation('Password reset token is invalid or has expired');

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return ok(res, { message: 'Password reset successful' });
});