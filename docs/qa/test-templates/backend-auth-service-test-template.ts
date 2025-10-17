/**
 * Backend Unit Test Template: AuthService
 *
 * Priority: P0 - CRITICAL
 * Location: apps/api/src/services/__tests__/authService.test.ts
 * Target Coverage: 80%+
 *
 * This template provides comprehensive test coverage for authentication logic
 * to prevent login/auth regressions that have occurred multiple times.
 */

import { AuthService } from '../authService';
import { Database } from '../../db';
import { TokenService } from '../tokenService';
import { Logger } from '../../utils/logger';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('../../db');
jest.mock('../tokenService');
jest.mock('../../utils/logger');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockDb: jest.Mocked<Database>;
  let mockTokenService: jest.Mocked<TokenService>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    // Create fresh mocks for each test
    mockDb = new Database() as jest.Mocked<Database>;
    mockTokenService = new TokenService() as jest.Mocked<TokenService>;
    mockLogger = new Logger() as jest.Mocked<Logger>;

    authService = new AuthService(mockDb, mockTokenService, mockLogger);

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('login', () => {
    const validEmail = 'test@example.com';
    const validPassword = 'password123';
    const mockUser = {
      id: 'user-123',
      email: validEmail,
      passwordHash: '$2b$10$hashedpassword',
      role: 'partner',
      organizationId: 'org-456',
      isActive: true
    };

    it('should return access and refresh tokens for valid credentials', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([mockUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockTokenService.generateAccessToken.mockReturnValue('mock-access-token');
      mockTokenService.generateRefreshToken.mockResolvedValue('mock-refresh-token');

      // Act
      const result = await authService.login(validEmail, validPassword);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users WHERE email'),
        [validEmail]
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(validPassword, mockUser.passwordHash);
      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          organizationId: mockUser.organizationId
        }
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('User logged in'),
        expect.objectContaining({ userId: mockUser.id })
      );
    });

    it('should throw UnauthorizedError for non-existent user', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([]); // No user found

      // Act & Assert
      await expect(
        authService.login('nonexistent@example.com', validPassword)
      ).rejects.toThrow('Invalid credentials');

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Login attempt for non-existent user'),
        expect.any(Object)
      );
    });

    it('should throw UnauthorizedError for invalid password', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([mockUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        authService.login(validEmail, 'wrong-password')
      ).rejects.toThrow('Invalid credentials');

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Invalid password attempt'),
        expect.objectContaining({ email: validEmail })
      );
    });

    it('should throw UnauthorizedError for inactive user', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      mockDb.query.mockResolvedValueOnce([inactiveUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      // Act & Assert
      await expect(
        authService.login(validEmail, validPassword)
      ).rejects.toThrow('Account is inactive');

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Login attempt for inactive account'),
        expect.any(Object)
      );
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockDb.query.mockRejectedValueOnce(new Error('Database connection failed'));

      // Act & Assert
      await expect(
        authService.login(validEmail, validPassword)
      ).rejects.toThrow('Database connection failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Login error'),
        expect.any(Object)
      );
    });

    it('should sanitize email input (lowercase, trim)', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([mockUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      mockTokenService.generateAccessToken.mockReturnValue('mock-access-token');
      mockTokenService.generateRefreshToken.mockResolvedValue('mock-refresh-token');

      // Act
      await authService.login('  Test@EXAMPLE.COM  ', validPassword);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.any(String),
        ['test@example.com'] // Should be lowercased and trimmed
      );
    });

    it('should reject empty credentials', async () => {
      await expect(authService.login('', '')).rejects.toThrow('Email and password are required');
      await expect(authService.login(validEmail, '')).rejects.toThrow('Password is required');
      await expect(authService.login('', validPassword)).rejects.toThrow('Email is required');
    });
  });

  describe('refreshToken', () => {
    const validRefreshToken = 'valid-refresh-token-xyz';
    const mockRefreshTokenRecord = {
      id: 'token-123',
      userId: 'user-456',
      token: validRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      revokedAt: null,
      createdAt: new Date()
    };
    const mockUser = {
      id: 'user-456',
      email: 'user@example.com',
      role: 'partner',
      organizationId: 'org-789'
    };

    it('should generate new access token for valid refresh token', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([mockRefreshTokenRecord]); // Find refresh token
      mockDb.query.mockResolvedValueOnce([mockUser]); // Find user
      mockTokenService.generateAccessToken.mockReturnValue('new-access-token');

      // Act
      const result = await authService.refreshToken(validRefreshToken);

      // Assert
      expect(result).toEqual({
        accessToken: 'new-access-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          organizationId: mockUser.organizationId
        }
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Token refreshed'),
        expect.objectContaining({ userId: mockUser.id })
      );
    });

    it('should reject expired refresh token', async () => {
      // Arrange
      const expiredToken = {
        ...mockRefreshTokenRecord,
        expiresAt: new Date(Date.now() - 1000) // Expired 1 second ago
      };
      mockDb.query.mockResolvedValueOnce([expiredToken]);

      // Act & Assert
      await expect(
        authService.refreshToken(validRefreshToken)
      ).rejects.toThrow('Refresh token expired');

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Expired refresh token used'),
        expect.any(Object)
      );
    });

    it('should reject revoked refresh token', async () => {
      // Arrange
      const revokedToken = {
        ...mockRefreshTokenRecord,
        revokedAt: new Date() // Token was revoked
      };
      mockDb.query.mockResolvedValueOnce([revokedToken]);

      // Act & Assert
      await expect(
        authService.refreshToken(validRefreshToken)
      ).rejects.toThrow('Refresh token revoked');
    });

    it('should reject non-existent refresh token', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([]); // No token found

      // Act & Assert
      await expect(
        authService.refreshToken('non-existent-token')
      ).rejects.toThrow('Invalid refresh token');
    });

    it('should reject empty refresh token', async () => {
      await expect(authService.refreshToken('')).rejects.toThrow('Refresh token is required');
    });

    it('should handle race condition: concurrent refresh token requests', async () => {
      // This test ensures that concurrent requests don't create issues
      // Arrange
      mockDb.query.mockResolvedValue([mockRefreshTokenRecord]);
      mockDb.query.mockResolvedValue([mockUser]);
      mockTokenService.generateAccessToken.mockReturnValue('new-access-token-1');

      // Act - Make two concurrent refresh requests
      const [result1, result2] = await Promise.all([
        authService.refreshToken(validRefreshToken),
        authService.refreshToken(validRefreshToken)
      ]);

      // Assert - Both should succeed (idempotent operation)
      expect(result1).toHaveProperty('accessToken');
      expect(result2).toHaveProperty('accessToken');
    });
  });

  describe('revokeRefreshToken', () => {
    const tokenToRevoke = 'token-to-revoke';

    it('should mark refresh token as revoked', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce({ affectedRows: 1 });

      // Act
      await authService.revokeRefreshToken(tokenToRevoke);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE refresh_tokens SET revokedAt'),
        expect.arrayContaining([tokenToRevoke])
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Refresh token revoked'),
        expect.objectContaining({ token: tokenToRevoke })
      );
    });

    it('should handle non-existent token gracefully', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce({ affectedRows: 0 });

      // Act & Assert
      await expect(
        authService.revokeRefreshToken('non-existent-token')
      ).rejects.toThrow('Token not found');
    });

    it('should reject empty token', async () => {
      await expect(authService.revokeRefreshToken('')).rejects.toThrow('Token is required');
    });
  });

  describe('revokeAllUserTokens', () => {
    const userId = 'user-123';

    it('should revoke all refresh tokens for a user', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce({ affectedRows: 3 }); // 3 tokens revoked

      // Act
      const result = await authService.revokeAllUserTokens(userId);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE refresh_tokens SET revokedAt'),
        expect.arrayContaining([userId])
      );
      expect(result.revokedCount).toBe(3);
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('All user tokens revoked'),
        expect.objectContaining({ userId, count: 3 })
      );
    });

    it('should handle user with no tokens', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce({ affectedRows: 0 });

      // Act
      const result = await authService.revokeAllUserTokens(userId);

      // Assert
      expect(result.revokedCount).toBe(0);
    });
  });

  describe('validateAccessToken', () => {
    it('should validate and decode valid access token', () => {
      // Arrange
      const validToken = 'valid.access.token';
      const decodedPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'partner',
        organizationId: 'org-456'
      };
      (jwt.verify as jest.Mock).mockReturnValueOnce(decodedPayload);

      // Act
      const result = authService.validateAccessToken(validToken);

      // Assert
      expect(result).toEqual(decodedPayload);
      expect(jwt.verify).toHaveBeenCalledWith(validToken, expect.any(String));
    });

    it('should throw error for expired token', () => {
      // Arrange
      const expiredToken = 'expired.access.token';
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      // Act & Assert
      expect(() => authService.validateAccessToken(expiredToken)).toThrow('Token expired');
    });

    it('should throw error for invalid token', () => {
      // Arrange
      const invalidToken = 'invalid.token';
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      // Act & Assert
      expect(() => authService.validateAccessToken(invalidToken)).toThrow('Invalid token');
    });

    it('should reject empty token', () => {
      expect(() => authService.validateAccessToken('')).toThrow('Token is required');
    });
  });

  describe('changePassword', () => {
    const userId = 'user-123';
    const currentPassword = 'oldPassword123';
    const newPassword = 'newPassword456';
    const mockUser = {
      id: userId,
      passwordHash: '$2b$10$currenthash'
    };

    it('should change password when current password is correct', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([mockUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('$2b$10$newhash');
      mockDb.query.mockResolvedValueOnce({ affectedRows: 1 });

      // Act
      await authService.changePassword(userId, currentPassword, newPassword);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET passwordHash'),
        expect.arrayContaining(['$2b$10$newhash', userId])
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Password changed'),
        expect.objectContaining({ userId })
      );
    });

    it('should reject change when current password is incorrect', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([mockUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        authService.changePassword(userId, 'wrongPassword', newPassword)
      ).rejects.toThrow('Current password is incorrect');
    });

    it('should revoke all refresh tokens after password change', async () => {
      // Arrange
      mockDb.query.mockResolvedValueOnce([mockUser]);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('$2b$10$newhash');
      mockDb.query.mockResolvedValueOnce({ affectedRows: 1 });
      mockDb.query.mockResolvedValueOnce({ affectedRows: 2 }); // Revoke tokens

      // Act
      await authService.changePassword(userId, currentPassword, newPassword);

      // Assert
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE refresh_tokens SET revokedAt'),
        expect.arrayContaining([userId])
      );
    });

    it('should enforce password complexity requirements', async () => {
      const weakPassword = '123'; // Too short

      await expect(
        authService.changePassword(userId, currentPassword, weakPassword)
      ).rejects.toThrow('Password does not meet complexity requirements');
    });
  });
});

/**
 * TO RUN THESE TESTS:
 *
 * 1. Install dependencies:
 *    npm install --save-dev jest @types/jest ts-jest
 *
 * 2. Configure Jest (jest.config.js):
 *    module.exports = {
 *      preset: 'ts-jest',
 *      testEnvironment: 'node',
 *      testMatch: ['**/__tests__/**/*.test.ts'],
 *      collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
 *      coverageThreshold: {
 *        global: {
 *          branches: 80,
 *          functions: 80,
 *          lines: 80,
 *          statements: 80
 *        }
 *      }
 *    };
 *
 * 3. Run tests:
 *    npm test
 *    npm test -- --coverage
 *
 * 4. Add to CI/CD (.github/workflows/test.yml):
 *    - name: Run Backend Tests
 *      run: cd apps/api && npm test -- --coverage
 */
