export enum PermissionCategory {
  PARTNERS = 'PARTNERS',
  OPPORTUNITIES = 'OPPORTUNITIES',
  COMMISSIONS = 'COMMISSIONS',
  REPORTS = 'REPORTS',
  USERS = 'USERS',
  SYSTEM = 'SYSTEM'
}

export enum PermissionAction {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE_COMMISSIONS = 'manage_commissions',
  CHANGE_STAGE = 'change_stage',
  ASSIGN = 'assign',
  CALCULATE = 'calculate',
  APPROVE = 'approve',
  EXPORT = 'export',
  ADMIN_REPORTS = 'admin_reports',
  MANAGE_ROLES = 'manage_roles',
  SETTINGS = 'settings',
  LOGS = 'logs',
  BACKUPS = 'backups',
  IMPERSONATE = 'impersonate'
}

export interface Permission {
  category: PermissionCategory;
  action: PermissionAction;
  description: string;
}

export interface RolePermissions {
  [PermissionCategory.PARTNERS]: PermissionAction[];
  [PermissionCategory.OPPORTUNITIES]: PermissionAction[];
  [PermissionCategory.COMMISSIONS]: PermissionAction[];
  [PermissionCategory.REPORTS]: PermissionAction[];
  [PermissionCategory.USERS]: PermissionAction[];
  [PermissionCategory.SYSTEM]: PermissionAction[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  permissions: RolePermissions;
  color: string;
  createdAt: string;
}

export const PERMISSION_DEFINITIONS: Record<string, Permission> = {
  'PARTNERS.read': {
    category: PermissionCategory.PARTNERS,
    action: PermissionAction.READ,
    description: 'View partner information and data'
  },
  'PARTNERS.create': {
    category: PermissionCategory.PARTNERS,
    action: PermissionAction.CREATE,
    description: 'Create new partners'
  },
  'PARTNERS.update': {
    category: PermissionCategory.PARTNERS,
    action: PermissionAction.UPDATE,
    description: 'Edit partner information'
  },
  'PARTNERS.delete': {
    category: PermissionCategory.PARTNERS,
    action: PermissionAction.DELETE,
    description: 'Delete partners'
  },
  'PARTNERS.manage_commissions': {
    category: PermissionCategory.PARTNERS,
    action: PermissionAction.MANAGE_COMMISSIONS,
    description: 'Manage partner commission structures'
  },
  'OPPORTUNITIES.read': {
    category: PermissionCategory.OPPORTUNITIES,
    action: PermissionAction.READ,
    description: 'View opportunities and pipeline data'
  },
  'OPPORTUNITIES.create': {
    category: PermissionCategory.OPPORTUNITIES,
    action: PermissionAction.CREATE,
    description: 'Create new opportunities'
  },
  'OPPORTUNITIES.update': {
    category: PermissionCategory.OPPORTUNITIES,
    action: PermissionAction.UPDATE,
    description: 'Edit opportunity details'
  },
  'OPPORTUNITIES.delete': {
    category: PermissionCategory.OPPORTUNITIES,
    action: PermissionAction.DELETE,
    description: 'Delete opportunities'
  },
  'OPPORTUNITIES.change_stage': {
    category: PermissionCategory.OPPORTUNITIES,
    action: PermissionAction.CHANGE_STAGE,
    description: 'Move opportunities between pipeline stages'
  },
  'OPPORTUNITIES.assign': {
    category: PermissionCategory.OPPORTUNITIES,
    action: PermissionAction.ASSIGN,
    description: 'Assign opportunities to team members'
  },
  'COMMISSIONS.read': {
    category: PermissionCategory.COMMISSIONS,
    action: PermissionAction.READ,
    description: 'View commission data and calculations'
  },
  'COMMISSIONS.calculate': {
    category: PermissionCategory.COMMISSIONS,
    action: PermissionAction.CALCULATE,
    description: 'Run commission calculations'
  },
  'COMMISSIONS.approve': {
    category: PermissionCategory.COMMISSIONS,
    action: PermissionAction.APPROVE,
    description: 'Approve commission payments'
  },
  'COMMISSIONS.export': {
    category: PermissionCategory.COMMISSIONS,
    action: PermissionAction.EXPORT,
    description: 'Export commission reports'
  },
  'REPORTS.read': {
    category: PermissionCategory.REPORTS,
    action: PermissionAction.READ,
    description: 'View standard reports and dashboards'
  },
  'REPORTS.create': {
    category: PermissionCategory.REPORTS,
    action: PermissionAction.CREATE,
    description: 'Create custom reports'
  },
  'REPORTS.export': {
    category: PermissionCategory.REPORTS,
    action: PermissionAction.EXPORT,
    description: 'Export reports and data'
  },
  'REPORTS.admin_reports': {
    category: PermissionCategory.REPORTS,
    action: PermissionAction.ADMIN_REPORTS,
    description: 'Access administrative and system reports'
  },
  'USERS.read': {
    category: PermissionCategory.USERS,
    action: PermissionAction.READ,
    description: 'View user information'
  },
  'USERS.create': {
    category: PermissionCategory.USERS,
    action: PermissionAction.CREATE,
    description: 'Create new users'
  },
  'USERS.update': {
    category: PermissionCategory.USERS,
    action: PermissionAction.UPDATE,
    description: 'Edit user information'
  },
  'USERS.delete': {
    category: PermissionCategory.USERS,
    action: PermissionAction.DELETE,
    description: 'Deactivate or delete users'
  },
  'USERS.manage_roles': {
    category: PermissionCategory.USERS,
    action: PermissionAction.MANAGE_ROLES,
    description: 'Assign and manage user roles'
  },
  'SYSTEM.settings': {
    category: PermissionCategory.SYSTEM,
    action: PermissionAction.SETTINGS,
    description: 'Access system configuration and settings'
  },
  'SYSTEM.logs': {
    category: PermissionCategory.SYSTEM,
    action: PermissionAction.LOGS,
    description: 'View system logs and audit trails'
  },
  'SYSTEM.backups': {
    category: PermissionCategory.SYSTEM,
    action: PermissionAction.BACKUPS,
    description: 'Manage system backups and data export'
  },
  'SYSTEM.impersonate': {
    category: PermissionCategory.SYSTEM,
    action: PermissionAction.IMPERSONATE,
    description: 'Impersonate other users for troubleshooting'
  }
};

export const SYSTEM_ROLES: Record<string, Omit<Role, 'id' | 'createdAt'>> = {
  system_owner: {
    name: 'System Owner',
    description: 'Complete system access with all permissions',
    isSystemRole: true,
    color: '#f44336',
    permissions: {
      [PermissionCategory.PARTNERS]: Object.values(PermissionAction),
      [PermissionCategory.OPPORTUNITIES]: Object.values(PermissionAction),
      [PermissionCategory.COMMISSIONS]: Object.values(PermissionAction),
      [PermissionCategory.REPORTS]: Object.values(PermissionAction),
      [PermissionCategory.USERS]: Object.values(PermissionAction),
      [PermissionCategory.SYSTEM]: Object.values(PermissionAction)
    }
  },
  vp_strategic_partnerships: {
    name: 'VP Strategic Partnerships',
    description: 'Full business operations access',
    isSystemRole: true,
    color: '#2196f3',
    permissions: {
      [PermissionCategory.PARTNERS]: [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.MANAGE_COMMISSIONS],
      [PermissionCategory.OPPORTUNITIES]: [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.CHANGE_STAGE, PermissionAction.ASSIGN],
      [PermissionCategory.COMMISSIONS]: [PermissionAction.READ, PermissionAction.CALCULATE, PermissionAction.APPROVE, PermissionAction.EXPORT],
      [PermissionCategory.REPORTS]: [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.EXPORT, PermissionAction.ADMIN_REPORTS],
      [PermissionCategory.USERS]: [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.UPDATE],
      [PermissionCategory.SYSTEM]: []
    }
  },
  sales_manager: {
    name: 'Sales Manager',
    description: 'Sales operations and reporting',
    isSystemRole: true,
    color: '#9c27b0',
    permissions: {
      [PermissionCategory.PARTNERS]: [PermissionAction.READ],
      [PermissionCategory.OPPORTUNITIES]: [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.DELETE, PermissionAction.CHANGE_STAGE, PermissionAction.ASSIGN],
      [PermissionCategory.COMMISSIONS]: [PermissionAction.READ, PermissionAction.CALCULATE],
      [PermissionCategory.REPORTS]: [PermissionAction.READ, PermissionAction.EXPORT],
      [PermissionCategory.USERS]: [PermissionAction.READ],
      [PermissionCategory.SYSTEM]: []
    }
  },
  partnership_manager: {
    name: 'Partnership Manager',
    description: 'Partner relationship management',
    isSystemRole: true,
    color: '#00bcd4',
    permissions: {
      [PermissionCategory.PARTNERS]: [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.DELETE],
      [PermissionCategory.OPPORTUNITIES]: [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.UPDATE],
      [PermissionCategory.COMMISSIONS]: [PermissionAction.READ],
      [PermissionCategory.REPORTS]: [PermissionAction.READ],
      [PermissionCategory.USERS]: [PermissionAction.READ],
      [PermissionCategory.SYSTEM]: []
    }
  },
  sales_rep: {
    name: 'Sales Rep',
    description: 'Individual sales activities',
    isSystemRole: true,
    color: '#4caf50',
    permissions: {
      [PermissionCategory.PARTNERS]: [PermissionAction.READ],
      [PermissionCategory.OPPORTUNITIES]: [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.UPDATE],
      [PermissionCategory.COMMISSIONS]: [PermissionAction.READ],
      [PermissionCategory.REPORTS]: [PermissionAction.READ],
      [PermissionCategory.USERS]: [],
      [PermissionCategory.SYSTEM]: []
    }
  },
  read_only: {
    name: 'Read Only',
    description: 'View-only access to all data',
    isSystemRole: true,
    color: '#757575',
    permissions: {
      [PermissionCategory.PARTNERS]: [PermissionAction.READ],
      [PermissionCategory.OPPORTUNITIES]: [PermissionAction.READ],
      [PermissionCategory.COMMISSIONS]: [PermissionAction.READ],
      [PermissionCategory.REPORTS]: [PermissionAction.READ],
      [PermissionCategory.USERS]: [PermissionAction.READ],
      [PermissionCategory.SYSTEM]: []
    }
  }
};