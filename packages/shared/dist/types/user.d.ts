export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    permissions: string[];
    isActive: boolean;
    lastLoginAt?: Date;
    failedLoginAttempts: number;
    lockedUntil?: Date;
    passwordChangedAt?: Date;
    twoFactorEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    organizationId?: string;
}
export declare enum UserRole {
    SYSTEM_OWNER = "system_owner",
    VP_STRATEGIC_PARTNERSHIPS = "vp_strategic_partnerships",
    SALES_MANAGER = "sales_manager",
    PARTNERSHIP_MANAGER = "partnership_manager",
    SALES_REP = "sales_rep",
    READ_ONLY = "read_only"
}
export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    isSystemRole: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Permission {
    id: string;
    resource: PermissionResource;
    action: PermissionAction;
    conditions?: PermissionCondition[];
}
export declare enum PermissionResource {
    USERS = "users",
    PARTNERS = "partners",
    OPPORTUNITIES = "opportunities",
    COMMISSIONS = "commissions",
    REPORTS = "reports",
    SYSTEM = "system",
    AUDIT_LOGS = "audit_logs"
}
export declare enum PermissionAction {
    CREATE = "create",
    READ = "read",
    UPDATE = "update",
    DELETE = "delete",
    MANAGE = "manage",
    IMPERSONATE = "impersonate",
    EXPORT = "export"
}
export interface PermissionCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'in' | 'not_in';
    value: any;
}
export interface UserRole_Assignment {
    userId: string;
    roleId: string;
    assignedBy: string;
    assignedAt: Date;
    expiresAt?: Date;
}
export interface AuditLog {
    id: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    organizationId?: string;
    timestamp: Date;
}
export interface WeeklyStatus {
    id: string;
    userId: string;
    weekStarting: Date;
    accomplishments: string;
    upcomingTasks: string;
    blockers: string;
    submittedAt: Date;
    isLate: boolean;
}
export interface Task {
    id: string;
    userId: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: Date;
    completedAt?: Date;
    category: TaskCategory;
    opportunityId?: string;
    partnerId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare enum TaskStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    BLOCKED = "blocked"
}
export declare enum TaskCategory {
    OPPORTUNITY = "opportunity",
    PARTNER = "partner",
    ADMINISTRATIVE = "administrative",
    PERSONAL = "personal"
}
//# sourceMappingURL=user.d.ts.map