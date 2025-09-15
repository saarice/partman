import { api } from './api';

export interface Alert {
  id: string;
  userId: string;
  type: 'opportunity' | 'partner' | 'goal' | 'task' | 'commission';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  entityId?: string;
  isAcknowledged: boolean;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export interface AlertSummary {
  type: string;
  priority: string;
  count: number;
  mostRecentDate: Date;
}

export interface AlertStats {
  totalAlerts: number;
  urgentAlerts: number;
  highPriorityAlerts: number;
  breakdown: AlertSummary[];
}

export const alertApi = {
  getAlerts: async (includeAcknowledged = false, limit = 50): Promise<Alert[]> => {
    const response = await api.get('/alerts', {
      params: { include_acknowledged: includeAcknowledged, limit }
    });
    return response.data.data;
  },

  getAlertSummary: async (): Promise<AlertSummary[]> => {
    const response = await api.get('/alerts/summary');
    return response.data.data;
  },

  getAlertStats: async (): Promise<AlertStats> => {
    const response = await api.get('/alerts/stats');
    return response.data.data;
  },

  acknowledgeAlert: async (alertId: string): Promise<void> => {
    await api.patch(`/alerts/${alertId}/acknowledge`);
  },

  acknowledgeMultipleAlerts: async (alertIds: string[]): Promise<{ acknowledgedCount: number }> => {
    const response = await api.patch('/alerts/acknowledge-multiple', { alertIds });
    return response.data.data;
  },

  createAlert: async (
    type: string,
    priority: string,
    title: string,
    message: string,
    entityId?: string,
    targetUserId?: string
  ): Promise<Alert> => {
    const response = await api.post('/alerts', {
      type,
      priority,
      title,
      message,
      entityId,
      targetUserId
    });
    return response.data.data;
  },

  generateAlerts: async (): Promise<void> => {
    await api.post('/alerts/generate');
  }
};