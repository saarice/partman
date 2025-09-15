import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { statusCode = 500, message } = err;

  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    statusCode
  });

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const createError = (message: string, statusCode = 500): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};