import { useMemo } from 'react';
import { useAuthStore } from '../stores/authStoreSimple';
import {
  PermissionCategory,
  PermissionAction,
  SYSTEM_ROLES,
  RolePermissions
} from '../types/permissions';

export const usePermissions = () => {
  const { user } = useAuthStore();

  const userPermissions = useMemo((): RolePermissions | null => {
    if (!user) return null;

    const systemRole = SYSTEM_ROLES[user.role];
    if (systemRole) {
      return systemRole.permissions;
    }

    // For custom roles, would fetch from database
    // For now, return empty permissions for unknown roles
    return {
      PARTNERS: [],
      OPPORTUNITIES: [],
      COMMISSIONS: [],
      REPORTS: [],
      USERS: [],
      SYSTEM: []
    };
  }, [user]);

  const hasPermission = (category: PermissionCategory, action: PermissionAction): boolean => {
    if (!userPermissions) return false;

    // System Owner has all permissions
    if (user?.role === 'system_owner') return true;

    return userPermissions[category]?.includes(action) || false;
  };

  const hasAnyPermission = (category: PermissionCategory, actions: PermissionAction[]): boolean => {
    return actions.some(action => hasPermission(category, action));
  };

  const hasAllPermissions = (category: PermissionCategory, actions: PermissionAction[]): boolean => {
    return actions.every(action => hasPermission(category, action));
  };

  const canManageUsers = (): boolean => {
    return hasPermission(PermissionCategory.USERS, PermissionAction.CREATE) ||
           hasPermission(PermissionCategory.USERS, PermissionAction.UPDATE) ||
           hasPermission(PermissionCategory.USERS, PermissionAction.DELETE) ||
           hasPermission(PermissionCategory.USERS, PermissionAction.MANAGE_ROLES);
  };

  const canAccessSystem = (): boolean => {
    return hasAnyPermission(PermissionCategory.SYSTEM, [
      PermissionAction.SETTINGS,
      PermissionAction.LOGS,
      PermissionAction.BACKUPS,
      PermissionAction.IMPERSONATE
    ]);
  };

  const canImpersonate = (): boolean => {
    return hasPermission(PermissionCategory.SYSTEM, PermissionAction.IMPERSONATE);
  };

  const getPermissionsByCategory = () => {
    if (!userPermissions) return {};

    return Object.entries(userPermissions).reduce((acc, [category, actions]) => {
      acc[category as PermissionCategory] = actions;
      return acc;
    }, {} as Record<PermissionCategory, PermissionAction[]>);
  };

  const getUserRole = () => {
    if (!user) return null;
    return SYSTEM_ROLES[user.role] || null;
  };

  return {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canManageUsers,
    canAccessSystem,
    canImpersonate,
    getPermissionsByCategory,
    getUserRole,
    isSystemOwner: user?.role === 'system_owner',
    isVPStrategicPartnerships: user?.role === 'vp_strategic_partnerships'
  };
};