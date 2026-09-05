import mongoose from 'mongoose';
import { AppError } from '../utils/apiError.js';

export function notFoundHandler(req, res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND'));
}

export function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-unused-vars
  void next;

  // Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const fields = Object.fromEntries(
      Object.entries(err.errors).map(([k, v]) => [k, v.message])
    );
    return res.status(422).json({
      success: false,
      error: { code: 'VALIDATION', message: 'Validation failed', fields }
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: `Duplicate for: ${field}`, fields: { [field]: 'already exists' } }
    });
  }

  // Operational errors we threw
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message, fields: err.fields }
    });
  }

  // Fallback
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational === true;
  const message = isOperational ? err.message : 'Internal server error';

  if (!isOperational) console.error('Unhandled error:', err);

  return res.status(statusCode).json({
    success: false,
    error: { code: err.code || 'INTERNAL', message }
  });
}