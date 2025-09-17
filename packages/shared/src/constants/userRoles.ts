import { UserRole } from '../types/user.js';

export const USER_ROLE_PERMISSIONS: Record<UserRole, {
  canViewDashboard: boolean;
  canManagePartners: boolean;
  canManageOpportunities: boolean;
  canViewAllTeamData: boolean;
  canManageCommissions: boolean;
  canConfigureAlerts: boolean;
  canViewReports: boolean;
}> = {
  [UserRole.SYSTEM_OWNER]: {
    canViewDashboard: true,
    canManagePartners: true,
    canManageOpportunities: true,
    canViewAllTeamData: true,
    canManageCommissions: true,
    canConfigureAlerts: true,
    canViewReports: true
  },
  [UserRole.VP_STRATEGIC_PARTNERSHIPS]: {
    canViewDashboard: true,
    canManagePartners: true,
    canManageOpportunities: true,
    canViewAllTeamData: true,
    canManageCommissions: true,
    canConfigureAlerts: true,
    canViewReports: true
  },
  [UserRole.SALES_MANAGER]: {
    canViewDashboard: true,
    canManagePartners: false,
    canManageOpportunities: true,
    canViewAllTeamData: true,
    canManageCommissions: true,
    canConfigureAlerts: false,
    canViewReports: true
  },
  [UserRole.PARTNERSHIP_MANAGER]: {
    canViewDashboard: true,
    canManagePartners: true,
    canManageOpportunities: false,
    canViewAllTeamData: false,
    canManageCommissions: false,
    canConfigureAlerts: false,
    canViewReports: false
  },
  [UserRole.SALES_REP]: {
    canViewDashboard: true,
    canManagePartners: false,
    canManageOpportunities: true,
    canViewAllTeamData: false,
    canManageCommissions: false,
    canConfigureAlerts: false,
    canViewReports: false
  },
  [UserRole.READ_ONLY]: {
    canViewDashboard: true,
    canManagePartners: false,
    canManageOpportunities: false,
    canViewAllTeamData: false,
    canManageCommissions: false,
    canConfigureAlerts: false,
    canViewReports: false
  }
};