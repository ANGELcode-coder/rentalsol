export class AppError extends Error {
  constructor(statusCode, message, code = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errors = {
  unauthorized: (msg = 'Not authorized') => new AppError(401, msg, 'UNAUTHORIZED'),
  forbidden: (msg = 'Not permitted for this role') => new AppError(403, msg, 'FORBIDDEN'),
  notFound: (msg = 'Resource not found') => new AppError(404, msg, 'NOT_FOUND'),
  validation: (msg, fields) => {
    const e = new AppError(422, msg, 'VALIDATION');
    e.fields = fields;
    return e;
  },
  conflict: (msg = 'Conflict') => new AppError(409, msg, 'CONFLICT'),
  rateLimited: (msg = 'Too many requests') => new AppError(429, msg, 'RATE_LIMITED')
};

// Wrap async route handlers to forward rejections to the error middleware.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);