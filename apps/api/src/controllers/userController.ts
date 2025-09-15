import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole, AuditLog } from '../../../packages/shared/src/types/user.js';
import { AuthenticatedRequest } from '../middleware/authorization.js';
import { createError } from '../middleware/errorHandler.js';

// Mock database - replace with actual database in production
let users: User[] = [
  {
    id: 'system-owner-1',
    email: 'admin@partman.com',
    firstName: 'System',
    lastName: 'Owner',
    role: UserRole.SYSTEM_OWNER,
    permissions: ['*'],
    isActive: true,
    lastLoginAt: new Date(),
    failedLoginAttempts: 0,
    twoFactorEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordChangedAt: new Date(),
    organizationId: 'default'
  },
  {
    id: 'vp-user-1',
    email: 'vp@partman.com',
    firstName: 'VP',
    lastName: 'Strategic',
    role: UserRole.VP_STRATEGIC_PARTNERSHIPS,
    permissions: ['partners:*', 'opportunities:*', 'commissions:*', 'reports:*', 'users:read,create,update'],
    isActive: true,
    lastLoginAt: new Date(),
    failedLoginAttempts: 0,
    twoFactorEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    passwordChangedAt: new Date(),
    organizationId: 'default'
  }
];

let auditLogs: AuditLog[] = [];

// Helper function to log user actions
function logUserAction(
  userId: string | undefined,
  action: string,
  resource: string,
  resourceId?: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  req?: AuthenticatedRequest
) {
  const auditLog: AuditLog = {
    id: uuidv4(),
    userId,
    action,
    resource,
    resourceId,
    oldValues,
    newValues,
    ipAddress: req?.ip,
    userAgent: req?.get('User-Agent'),
    organizationId: req?.user?.organizationId || 'default',
    timestamp: new Date()
  };

  auditLogs.push(auditLog);
  console.log('Audit Log:', auditLog);
}

/**
 * Get all users
 */
export const getUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;

    let filteredUsers = users.filter(user => user.organizationId === req.user?.organizationId);

    // Apply filters
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    if (isActive !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.isActive === (isActive === 'true'));
    }

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Remove sensitive data
    const safeUsers = paginatedUsers.map(user => {
      const { passwordChangedAt, ...safeUser } = user;
      return safeUser;
    });

    logUserAction(req.user?.id, 'READ', 'users', undefined, undefined, { count: safeUsers.length }, req);

    res.json({
      users: safeUsers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredUsers.length,
        pages: Math.ceil(filteredUsers.length / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = users.find(u => u.id === id && u.organizationId === req.user?.organizationId);

    if (!user) {
      return next(createError('User not found', 404));
    }

    // Remove sensitive data
    const { passwordChangedAt, ...safeUser } = user;

    logUserAction(req.user?.id, 'READ', 'users', id, undefined, undefined, req);

    res.json(safeUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new user
 */
export const createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { email, firstName, lastName, role, isActive = true } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName || !role) {
      return next(createError('Missing required fields', 400));
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email && u.organizationId === req.user?.organizationId);
    if (existingUser) {
      return next(createError('User with this email already exists', 409));
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      return next(createError('Invalid role', 400));
    }

    // Check if actor can assign this role
    if (req.user?.role !== UserRole.SYSTEM_OWNER && role === UserRole.SYSTEM_OWNER) {
      return next(createError('Cannot create System Owner user', 403));
    }

    const newUser: User = {
      id: uuidv4(),
      email,
      firstName,
      lastName,
      role,
      permissions: [], // Will be set based on role
      isActive,
      failedLoginAttempts: 0,
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user?.id,
      organizationId: req.user?.organizationId || 'default'
    };

    users.push(newUser);

    // Remove sensitive data from response
    const { passwordChangedAt, ...safeUser } = newUser;

    logUserAction(
      req.user?.id,
      'CREATE',
      'users',
      newUser.id,
      undefined,
      { email, firstName, lastName, role, isActive },
      req
    );

    res.status(201).json(safeUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user
 */
export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const userIndex = users.findIndex(u => u.id === id && u.organizationId === req.user?.organizationId);
    if (userIndex === -1) {
      return next(createError('User not found', 404));
    }

    const existingUser = users[userIndex];

    // Store old values for audit
    const oldValues = { ...existingUser };

    // Check permissions for role changes
    if (updates.role && updates.role !== existingUser.role) {
      if (req.user?.role !== UserRole.SYSTEM_OWNER &&
          (updates.role === UserRole.SYSTEM_OWNER || existingUser.role === UserRole.SYSTEM_OWNER)) {
        return next(createError('Cannot modify System Owner role', 403));
      }
    }

    // Update user
    const updatedUser = {
      ...existingUser,
      ...updates,
      id, // Ensure ID cannot be changed
      updatedAt: new Date(),
      organizationId: existingUser.organizationId // Ensure org cannot be changed
    };

    users[userIndex] = updatedUser;

    // Remove sensitive data from response
    const { passwordChangedAt, ...safeUser } = updatedUser;

    logUserAction(
      req.user?.id,
      'UPDATE',
      'users',
      id,
      oldValues,
      updates,
      req
    );

    res.json(safeUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const userIndex = users.findIndex(u => u.id === id && u.organizationId === req.user?.organizationId);
    if (userIndex === -1) {
      return next(createError('User not found', 404));
    }

    const existingUser = users[userIndex];

    // Prevent deletion of System Owner
    if (existingUser.role === UserRole.SYSTEM_OWNER) {
      return next(createError('Cannot delete System Owner', 403));
    }

    // Prevent self-deletion
    if (existingUser.id === req.user?.id) {
      return next(createError('Cannot delete your own account', 403));
    }

    // Soft delete by deactivating
    users[userIndex] = {
      ...existingUser,
      isActive: false,
      updatedAt: new Date()
    };

    logUserAction(
      req.user?.id,
      'DELETE',
      'users',
      id,
      { isActive: true },
      { isActive: false },
      req
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit logs
 */
export const getAuditLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 50, resource, action, userId } = req.query;

    let filteredLogs = auditLogs.filter(log => log.organizationId === req.user?.organizationId);

    // Apply filters
    if (resource) {
      filteredLogs = filteredLogs.filter(log => log.resource === resource);
    }

    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }

    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }

    // Sort by timestamp descending
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    logUserAction(req.user?.id, 'READ', 'audit_logs', undefined, undefined, { count: paginatedLogs.length }, req);

    res.json({
      logs: paginatedLogs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredLogs.length,
        pages: Math.ceil(filteredLogs.length / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Impersonate user (System Owner only)
 */
export const impersonateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (req.user?.role !== UserRole.SYSTEM_OWNER) {
      return next(createError('Only System Owner can impersonate users', 403));
    }

    const targetUser = users.find(u => u.id === id && u.organizationId === req.user?.organizationId);
    if (!targetUser) {
      return next(createError('User not found', 404));
    }

    if (!targetUser.isActive) {
      return next(createError('Cannot impersonate inactive user', 400));
    }

    logUserAction(
      req.user?.id,
      'IMPERSONATE',
      'users',
      id,
      undefined,
      { targetUserId: id, targetUserEmail: targetUser.email },
      req
    );

    // Generate impersonation token (simplified for demo)
    const impersonationToken = `impersonation_${req.user.id}_${id}_${Date.now()}`;

    res.json({
      message: 'Impersonation initiated',
      impersonationToken,
      targetUser: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        role: targetUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export { logUserAction };