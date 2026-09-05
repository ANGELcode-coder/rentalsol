import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { errors } from '../utils/apiError.js';
import { config } from '../config/index.js';

// Verifies Bearer JWT and attaches req.user (role, id, status)
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return next(errors.unauthorized('Missing or invalid authorization header'));
    }

    const payload = jwt.verify(token, config.jwtSecret);
    req.userId = payload.sub;

    const user = await User.findById(payload.sub).lean();
    if (!user) return next(errors.unauthorized('User no longer exists'));
    if (user.status === 'suspended') return next(errors.forbidden('Account suspended'));

    req.user = { id: user._id.toString(), role: user.role, status: user.status };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(errors.unauthorized('Token expired'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(errors.unauthorized('Invalid token'));
    }
    return next(err);
  }
}

// Role guard — use after requireAuth: requireRole('admin')
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) return next(errors.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(errors.forbidden(`Requires role: ${roles.join(' or ')}`));
    }
    return next();
  };

// Optional auth — attach req.user if a valid token is present, else continue as guest.
export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next();
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub).lean();
    if (user && user.status !== 'suspended') {
      req.user = { id: user._id.toString(), role: user.role, status: user.status };
    }
  } catch {
    // ignore invalid tokens — treat as guest
  }
  return next();
}