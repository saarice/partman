import { Router } from 'express';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { query } from '../utils/database.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';

const router = Router();

// Mock login for development
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError('Email and password are required', 400);
  }

  // Mock user for development - replace with actual database query
  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'vp@partman.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'vp'
  };

  if (email !== mockUser.email || password !== 'password') {
    throw createError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    {
      userId: mockUser.id,
      email: mockUser.email,
      role: mockUser.role
    },
    process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production',
    { expiresIn: '24h' }
  );

  res.json({
    status: 'success',
    data: {
      token,
      user: {
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role
      }
    }
  });
}));

router.post('/logout', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

export { router as authRoutes };