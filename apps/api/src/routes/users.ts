import express from 'express';
import { authenticate } from '../middleware/authentication.js';
import {
  requirePermission,
  requireSystemOwner,
  requireAdmin,
  PermissionResource,
  PermissionAction
} from '../middleware/authorization.js';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAuditLogs,
  impersonateUser
} from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/users
 * @desc Get all users with pagination and filtering
 * @access Requires users:read permission
 */
router.get('/',
  requirePermission(PermissionResource.USERS, PermissionAction.READ),
  getUsers
);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Requires users:read permission
 */
router.get('/:id',
  requirePermission(PermissionResource.USERS, PermissionAction.READ),
  getUserById
);

/**
 * @route POST /api/users
 * @desc Create new user
 * @access Requires users:create permission
 */
router.post('/',
  requirePermission(PermissionResource.USERS, PermissionAction.CREATE),
  createUser
);

/**
 * @route PUT /api/users/:id
 * @desc Update user
 * @access Requires users:update permission
 */
router.put('/:id',
  requirePermission(PermissionResource.USERS, PermissionAction.UPDATE),
  updateUser
);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user (soft delete)
 * @access Requires users:delete permission
 */
router.delete('/:id',
  requirePermission(PermissionResource.USERS, PermissionAction.DELETE),
  deleteUser
);

/**
 * @route GET /api/users/audit/logs
 * @desc Get audit logs
 * @access Admin only
 */
router.get('/audit/logs',
  requireAdmin,
  getAuditLogs
);

/**
 * @route POST /api/users/:id/impersonate
 * @desc Impersonate user
 * @access System Owner only
 */
router.post('/:id/impersonate',
  requireSystemOwner,
  impersonateUser
);

export default router;