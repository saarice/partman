export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  VP = 'vp',
  SALES_MANAGER = 'sales_manager',
  PARTNERSHIP_MANAGER = 'partnership_manager',
  TEAM_MEMBER = 'team_member'
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

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}

export enum TaskCategory {
  OPPORTUNITY = 'opportunity',
  PARTNER = 'partner',
  ADMINISTRATIVE = 'administrative',
  PERSONAL = 'personal'
}