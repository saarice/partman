/**
 * Auth Service Unit Tests
 * Tests for authentication logic including login, registration, token generation
 */

import { AuthService } from '../authService.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as database from '../../utils/database.js';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../utils/database.js');
jest.mock('../../utils/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('AuthService', () => {
  let authService: AuthService;
  const mockQuery = database.query as jest.MockedFunction<typeof database.query>;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRY = '24h';
    process.env.REFRESH_TOKEN_EXPIRY = '7d';
  });

  describe('hashPassword', () => {
    it('should hash password using bcrypt', async () => {
      const password = 'testPassword123';
      const hashedPassword = '$2b$10$hashedpassword';

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await authService.hashPassword(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.comparePassword('password', 'hash');

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.comparePassword('wrongpassword', 'hash');

      expect(result).toBe(false);
    });
  });

  describe('generateAccessToken', () => {
    it('should generate valid JWT access token', () => {
      const payload = { userId: 'user-1', email: 'test@example.com', role: 'team_member' };
      const mockToken = 'mock.jwt.token';

      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      const token = authService.generateAccessToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        'test-secret',
        { expiresIn: '24h' }
      );
      expect(token).toBe(mockToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify and return payload for valid token', () => {
      const payload = { userId: 'user-1', email: 'test@example.com', role: 'team_member' };
      (jwt.verify as jest.Mock).mockReturnValue(payload);

      const result = authService.verifyToken('valid.token');

      expect(jwt.verify).toHaveBeenCalledWith('valid.token', 'test-secret');
      expect(result).toEqual(payload);
    });

    it('should throw error for invalid token', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => authService.verifyToken('invalid.token')).toThrow('Invalid or expired token');
    });
  });

  describe('register', () => {
    const mockUserData = {
      email: 'newuser@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      role: 'team_member'
    };

    it('should successfully register a new user', async () => {
      // Mock: No existing user
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

      // Mock: Password hashing
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpassword');

      // Mock: User creation
      const createdUser = {
        id: 'user-123',
        email: mockUserData.email,
        first_name: mockUserData.firstName,
        last_name: mockUserData.lastName,
        role: mockUserData.role,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };
      mockQuery.mockResolvedValueOnce({ rows: [createdUser], rowCount: 1 } as any);

      // Mock: Refresh token storage
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);

      // Mock: JWT generation
      (jwt.sign as jest.Mock).mockReturnValue('mock.jwt.token');

      const result = await authService.register(
        mockUserData.email,
        mockUserData.password,
        mockUserData.firstName,
        mockUserData.lastName,
        mockUserData.role
      );

      expect(result.user.email).toBe(mockUserData.email);
      expect(result.user.id).toBe('user-123');
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should throw error if user already exists', async () => {
      // Mock: Existing user found
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 'existing-user' }],
        rowCount: 1
      } as any);

      await expect(
        authService.register(
          mockUserData.email,
          mockUserData.password,
          mockUserData.firstName,
          mockUserData.lastName
        )
      ).rejects.toThrow('User with this email already exists');
    });

    it('should throw error for invalid role', async () => {
      // Mock: No existing user
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

      await expect(
        authService.register(
          mockUserData.email,
          mockUserData.password,
          mockUserData.firstName,
          mockUserData.lastName,
          'invalid_role'
        )
      ).rejects.toThrow('Invalid role');
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      password_hash: '$2b$10$hashedpassword',
      first_name: 'John',
      last_name: 'Doe',
      role: 'team_member',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    it('should successfully login with valid credentials', async () => {
      // Mock: Find user
      mockQuery.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1
      } as any);

      // Mock: Password comparison
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock: Update last login
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);

      // Mock: Store refresh token
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);

      // Mock: JWT generation
      (jwt.sign as jest.Mock).mockReturnValue('mock.jwt.token');

      const result = await authService.login('test@example.com', 'Password123!');

      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.id).toBe(mockUser.id);
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', mockUser.password_hash);
    });

    it('should throw error for non-existent user', async () => {
      // Mock: User not found
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

      await expect(
        authService.login('nonexistent@example.com', 'password')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for incorrect password', async () => {
      // Mock: Find user
      mockQuery.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1
      } as any);

      // Mock: Password comparison fails
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login('test@example.com', 'WrongPassword')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for inactive user', async () => {
      const inactiveUser = { ...mockUser, is_active: false };

      // Mock: Find inactive user
      mockQuery.mockResolvedValueOnce({
        rows: [inactiveUser],
        rowCount: 1
      } as any);

      await expect(
        authService.login('test@example.com', 'Password123!')
      ).rejects.toThrow('Account is inactive');
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token with valid refresh token', async () => {
      const mockPayload = { userId: 'user-123', email: 'test@example.com', role: 'team_member' };

      // Mock: Verify refresh token
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      // Mock: Check refresh token in database
      mockQuery.mockResolvedValueOnce({
        rows: [{ user_id: 'user-123', expires_at: new Date(Date.now() + 86400000) }],
        rowCount: 1
      } as any);

      // Mock: Find user
      mockQuery.mockResolvedValueOnce({
        rows: [{
          id: 'user-123',
          email: 'test@example.com',
          role: 'team_member'
        }],
        rowCount: 1
      } as any);

      // Mock: Store new refresh token
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);

      // Mock: Generate new tokens
      (jwt.sign as jest.Mock).mockReturnValue('new.jwt.token');

      const result = await authService.refreshAccessToken('valid.refresh.token');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error for expired refresh token', async () => {
      const mockPayload = { userId: 'user-123', email: 'test@example.com', role: 'team_member' };

      // Mock: Verify token structure
      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      // Mock: Refresh token not found or expired in database
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any);

      await expect(
        authService.refreshAccessToken('expired.refresh.token')
      ).rejects.toThrow('Invalid or expired refresh token');
    });

    it('should throw error for invalid refresh token', async () => {
      // Mock: JWT verification fails
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        authService.refreshAccessToken('invalid.token')
      ).rejects.toThrow('Invalid or expired token');
    });
  });

  describe('Logout', () => {
    it('should revoke refresh token on logout', async () => {
      // Mock: Delete refresh token
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);

      await authService.logout('user-123');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM refresh_tokens'),
        expect.arrayContaining(['user-123'])
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle database connection errors gracefully', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(
        authService.login('test@example.com', 'password')
      ).rejects.toThrow();
    });

    it('should handle bcrypt errors gracefully', async () => {
      (bcrypt.hash as jest.Mock).mockRejectedValueOnce(new Error('Bcrypt error'));

      await expect(
        authService.hashPassword('password')
      ).rejects.toThrow('Bcrypt error');
    });
  });
});
