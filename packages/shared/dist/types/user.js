export var UserRole;
(function (UserRole) {
    UserRole["SYSTEM_OWNER"] = "system_owner";
    UserRole["VP_STRATEGIC_PARTNERSHIPS"] = "vp_strategic_partnerships";
    UserRole["SALES_MANAGER"] = "sales_manager";
    UserRole["PARTNERSHIP_MANAGER"] = "partnership_manager";
    UserRole["SALES_REP"] = "sales_rep";
    UserRole["READ_ONLY"] = "read_only";
})(UserRole || (UserRole = {}));
export var PermissionResource;
(function (PermissionResource) {
    PermissionResource["USERS"] = "users";
    PermissionResource["PARTNERS"] = "partners";
    PermissionResource["OPPORTUNITIES"] = "opportunities";
    PermissionResource["COMMISSIONS"] = "commissions";
    PermissionResource["REPORTS"] = "reports";
    PermissionResource["SYSTEM"] = "system";
    PermissionResource["AUDIT_LOGS"] = "audit_logs";
})(PermissionResource || (PermissionResource = {}));
export var PermissionAction;
(function (PermissionAction) {
    PermissionAction["CREATE"] = "create";
    PermissionAction["READ"] = "read";
    PermissionAction["UPDATE"] = "update";
    PermissionAction["DELETE"] = "delete";
    PermissionAction["MANAGE"] = "manage";
    PermissionAction["IMPERSONATE"] = "impersonate";
    PermissionAction["EXPORT"] = "export";
})(PermissionAction || (PermissionAction = {}));
export var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["HIGH"] = "high";
    TaskPriority["URGENT"] = "urgent";
})(TaskPriority || (TaskPriority = {}));
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["BLOCKED"] = "blocked";
})(TaskStatus || (TaskStatus = {}));
export var TaskCategory;
(function (TaskCategory) {
    TaskCategory["OPPORTUNITY"] = "opportunity";
    TaskCategory["PARTNER"] = "partner";
    TaskCategory["ADMINISTRATIVE"] = "administrative";
    TaskCategory["PERSONAL"] = "personal";
})(TaskCategory || (TaskCategory = {}));
//# sourceMappingURL=user.js.map