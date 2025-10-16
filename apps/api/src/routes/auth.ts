import { Router, Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { authService } from '../services/authService.js';
import { authenticate } from '../middleware/authentication.js';

const router = Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, role } = req.body;

  if (!email || !password || !firstName || !lastName) {
    throw createError('Email, password, first name, and last name are required', 400);
  }

  if (password.length < 8) {
    throw createError('Password must be at least 8 characters long', 400);
  }

  const result = await authService.register(email, password, firstName, lastName, role);

  res.status(201).json({
    status: 'success',
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresIn: result.tokens.expiresIn
    }
  });
}));

/**
 * POST /auth/login
 * Login user
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError('Email and password are required', 400);
  }

  const result = await authService.login(email, password);

  res.json({
    status: 'success',
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresIn: result.tokens.expiresIn
    }
  });
}));

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createError('Refresh token is required', 400);
  }

  const tokens = await authService.refreshAccessToken(refreshToken);

  res.json({
    status: 'success',
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn
    }
  });
}));

/**
 * POST /auth/logout
 * Logout user (requires authentication)
 */
router.post('/logout', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    throw createError('User ID not found', 401);
  }

  await authService.logout(req.user.id);

  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
}));

/**
 * POST /auth/change-password
 * Change user password (requires authentication)
 */
router.post('/change-password', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw createError('Current password and new password are required', 400);
  }

  if (newPassword.length < 8) {
    throw createError('New password must be at least 8 characters long', 400);
  }

  if (!req.user?.id) {
    throw createError('User ID not found', 401);
  }

  await authService.changePassword(req.user.id, currentPassword, newPassword);

  res.json({
    status: 'success',
    message: 'Password changed successfully'
  });
}));

/**
 * GET /auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    throw createError('User ID not found', 401);
  }

  const user = await authService.getUserById(req.user.id);

  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    status: 'success',
    data: { user }
  });
}));

export { router as authRoutes };