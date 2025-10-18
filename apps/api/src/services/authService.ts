import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { query } from '../utils/database.js';
import { createError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const JWT_SECRET: string = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production';
const JWT_EXPIRY: string = process.env.JWT_EXPIRY || '24h';
const REFRESH_TOKEN_EXPIRY: string = process.env.REFRESH_TOKEN_EXPIRY || '7d';
const SALT_ROUNDS = 10;

interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export class AuthService {
  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT access token
   */
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY } as SignOptions);
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY } as SignOptions);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw createError('Invalid or expired token', 401);
    }
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string, firstName: string, lastName: string, role: string = 'team_member'): Promise<{ user: Omit<User, 'password_hash'>, tokens: AuthTokens }> {
    try {
      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw createError('User with this email already exists', 409);
      }

      // Validate role
      const validRoles = ['vp', 'sales_manager', 'partnership_manager', 'team_member'];
      if (!validRoles.includes(role)) {
        throw createError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Create user
      const result = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id, email, first_name, last_name, role, is_active, created_at, updated_at`,
        [email, passwordHash, firstName, lastName, role]
      );

      const user = result.rows[0];

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.email, user.role);

      logger.info(`User registered: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        tokens
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>, tokens: AuthTokens }> {
    try {
      // Find user
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw createError('Invalid credentials', 401);
      }

      const user = result.rows[0];

      // Check if user is active
      if (!user.is_active) {
        throw createError('Account is inactive', 403);
      }

      // Verify password
      const isPasswordValid = await this.comparePassword(password, user.password_hash);

      if (!isPasswordValid) {
        logger.warn(`Failed login attempt for user: ${email}`);
        throw createError('Invalid credentials', 401);
      }

      // Update last login
      await query(
        'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.email, user.role);

      logger.info(`User logged in: ${user.email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        tokens
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  private async generateTokens(userId: string, email: string, role: string): Promise<AuthTokens> {
    const payload: TokenPayload = {
      userId,
      email,
      role
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Store refresh token in database
    await this.storeRefreshToken(userId, refreshToken);

    return {
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRY
    };
  }

  /**
   * Store refresh token in database
   */
  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await query(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id) DO UPDATE SET token = $3, expires_at = $4, created_at = CURRENT_TIMESTAMP`,
      [randomUUID(), userId, token, expiresAt]
    );
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = this.verifyToken(refreshToken);

      // Check if refresh token exists and is valid in database
      const result = await query(
        `SELECT user_id, expires_at FROM refresh_tokens
         WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP`,
        [refreshToken]
      );

      if (result.rows.length === 0) {
        throw createError('Invalid or expired refresh token', 401);
      }

      // Get user details
      const userResult = await query(
        'SELECT id, email, role, is_active FROM users WHERE id = $1',
        [payload.userId]
      );

      if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
        throw createError('User not found or inactive', 401);
      }

      const user = userResult.rows[0];

      // Generate new tokens
      const tokens = await this.generateTokens(user.id, user.email, user.role);

      logger.info(`Token refreshed for user: ${user.email}`);

      return tokens;
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(userId: string): Promise<void> {
    try {
      await query(
        'DELETE FROM refresh_tokens WHERE user_id = $1',
        [userId]
      );

      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Get user
      const result = await query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        throw createError('User not found', 404);
      }

      // Verify current password
      const isPasswordValid = await this.comparePassword(currentPassword, result.rows[0].password_hash);

      if (!isPasswordValid) {
        throw createError('Current password is incorrect', 401);
      }

      // Hash new password
      const newPasswordHash = await this.hashPassword(newPassword);

      // Update password
      await query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newPasswordHash, userId]
      );

      // Invalidate all refresh tokens
      await query(
        'DELETE FROM refresh_tokens WHERE user_id = $1',
        [userId]
      );

      logger.info(`Password changed for user: ${userId}`);
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<Omit<User, 'password_hash'> | null> {
    const result = await query(
      'SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    return result.rows[0] || null;
  }
}

export const authService = new AuthService();
