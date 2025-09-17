import { Request, Response, NextFunction } from 'express';
import { UserRole, PermissionResource, PermissionAction } from '../../../../packages/shared/src/types/user.js';
import { createError } from './errorHandler.js';

// System Owner bypass - has all permissions
const SYSTEM_OWNER_PERMISSIONS = '*';

// Define role-based permissions
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SYSTEM_OWNER]: [SYSTEM_OWNER_PERMISSIONS],
  [UserRole.VP_STRATEGIC_PARTNERSHIPS]: [
    'partners:*',
    'opportunities:*',
    'commissions:*',
    'reports:*',
    'users:read,create,update'
  ],
  [UserRole.SALES_MANAGER]: [
    'opportunities:*',
    'partners:read',
    'commissions:read,calculate',
    'reports:read,export'
  ],
  [UserRole.PARTNERSHIP_MANAGER]: [
    'partners:*',
    'opportunities:read,create,update',
    'commissions:read',
    'reports:read'
  ],
  [UserRole.SALES_REP]: [
    'opportunities:read,create,update',
    'partners:read',
    'commissions:read'
  ],
  [UserRole.READ_ONLY]: [
    '*.read'
  ]
};

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    permissions?: string[];
  };
}

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole: UserRole, resource: string, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];

  // System Owner has all permissions
  if (permissions.includes(SYSTEM_OWNER_PERMISSIONS)) {
    return true;
  }

  // Check exact permission
  const exactPermission = `${resource}:${action}`;
  if (permissions.includes(exactPermission)) {
    return true;
  }

  // Check wildcard permissions
  const resourceWildcard = `${resource}:*`;
  if (permissions.includes(resourceWildcard)) {
    return true;
  }

  // Check action wildcard
  const actionWildcard = `*.${action}`;
  if (permissions.includes(actionWildcard)) {
    return true;
  }

  // Check comma-separated permissions
  for (const permission of permissions) {
    if (permission.includes(':')) {
      const [permResource, permActions] = permission.split(':');
      if (permResource === resource && permActions.includes(action)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Middleware to require specific permission
 */
export function requirePermission(resource: PermissionResource, action: PermissionAction) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Authentication required', 401));
    }

    const userRole = req.user.role;

    if (!hasPermission(userRole, resource, action)) {
      return next(createError('Insufficient permissions', 403));
    }

    next();
  };
}

/**
 * Middleware to require system owner role
 */
export function requireSystemOwner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(createError('Authentication required', 401));
  }

  if (req.user.role !== UserRole.SYSTEM_OWNER) {
    return next(createError('System Owner access required', 403));
  }

  next();
}

/**
 * Middleware to require admin role (System Owner or VP)
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(createError('Authentication required', 401));
  }

  const adminRoles = [UserRole.SYSTEM_OWNER, UserRole.VP_STRATEGIC_PARTNERSHIPS];

  if (!adminRoles.includes(req.user.role)) {
    return next(createError('Administrative access required', 403));
  }

  next();
}

/**
 * Check if user can manage other users
 */
export function canManageUser(actorRole: UserRole, targetRole: UserRole): boolean {
  // System Owner can manage anyone
  if (actorRole === UserRole.SYSTEM_OWNER) {
    return true;
  }

  // VP can manage everyone except System Owner
  if (actorRole === UserRole.VP_STRATEGIC_PARTNERSHIPS && targetRole !== UserRole.SYSTEM_OWNER) {
    return true;
  }

  // Users can only manage themselves (for profile updates)
  return false;
}

/**
 * Organization context middleware (future multi-tenant support)
 */
export function setOrganizationContext(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // For now, single organization
  req.user = {
    ...req.user!,
    organizationId: 'default'
  };

  next();
}

export { UserRole, PermissionResource, PermissionAction };