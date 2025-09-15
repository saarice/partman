import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../../packages/shared/src/types/user.js';
import { createError } from './errorHandler.js';

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions?: string[];
  organizationId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        permissions?: string[];
        organizationId?: string;
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(createError('Access token required', 401));
  }

  try {
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions,
      organizationId: decoded.organizationId || 'default'
    };

    next();
  } catch (error) {
    next(createError('Invalid or expired token', 401));
  }
};