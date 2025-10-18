import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface OpportunityFilters {
  stage?: string;
  partnerId?: string;
  assignedUserId?: string;
  minValue?: number;
  maxValue?: number;
  minProbability?: number;
  maxProbability?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface OpportunityCreateData {
  title: string;
  description?: string;
  customerId: string;
  customerName: string;
  partnerId: string;
  assignedUserId?: string;
  value: number;
  stage?: string;
  probability?: number;
  expectedCloseDate?: string;
}

export interface OpportunityUpdateData {
  title?: string;
  description?: string;
  value?: number;
  stage?: string;
  probability?: number;
  partnerId?: string;
  assignedUserId?: string;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  customerId?: string;
  customerName?: string;
}

export interface OpportunityStageHistory {
  id: string;
  opportunityId: string;
  fromStage: string | null;
  toStage: string;
  changedBy: string;
  changedAt: string;
  notes?: string;
}

/**
 * Get all opportunities with optional filters
 */
export const getOpportunities = async (filters?: OpportunityFilters) => {
  const response = await api.get('/opportunities', { params: filters });
  return response.data;
};

/**
 * Get a single opportunity by ID
 */
export const getOpportunity = async (id: string) => {
  const response = await api.get(`/opportunities/${id}`);
  return response.data;
};

/**
 * Create a new opportunity
 */
export const createOpportunity = async (data: OpportunityCreateData) => {
  const response = await api.post('/opportunities', data);
  return response.data;
};

/**
 * Update an existing opportunity
 */
export const updateOpportunity = async (id: string, data: OpportunityUpdateData) => {
  const response = await api.patch(`/opportunities/${id}`, data);
  return response.data;
};

/**
 * Delete an opportunity
 */
export const deleteOpportunity = async (id: string) => {
  const response = await api.delete(`/opportunities/${id}`);
  return response.data;
};

/**
 * Clone an existing opportunity
 */
export const cloneOpportunity = async (id: string) => {
  const response = await api.post(`/opportunities/${id}/clone`);
  return response.data;
};

/**
 * Get stage history for an opportunity
 */
export const getOpportunityStageHistory = async (id: string): Promise<OpportunityStageHistory[]> => {
  const response = await api.get(`/opportunities/${id}/history`);
  return response.data.data;
};

/**
 * Update stage for an opportunity with validation
 */
export const updateOpportunityStage = async (
  id: string,
  newStage: string,
  notes?: string
) => {
  const response = await api.patch(`/opportunities/${id}/stage`, {
    stage: newStage,
    notes,
  });
  return response.data;
};

/**
 * Bulk update opportunities
 */
export const bulkUpdateOpportunities = async (
  ids: string[],
  updates: OpportunityUpdateData
) => {
  const response = await api.patch('/opportunities/bulk', {
    ids,
    updates,
  });
  return response.data;
};

/**
 * Bulk delete opportunities
 */
export const bulkDeleteOpportunities = async (ids: string[]) => {
  const response = await api.delete('/opportunities/bulk', {
    data: { ids },
  });
  return response.data;
};

/**
 * Get opportunity forecast/metrics
 */
export const getOpportunityMetrics = async (filters?: OpportunityFilters) => {
  const response = await api.get('/opportunities/metrics', { params: filters });
  return response.data;
};

export default {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  cloneOpportunity,
  getOpportunityStageHistory,
  updateOpportunityStage,
  bulkUpdateOpportunities,
  bulkDeleteOpportunities,
  getOpportunityMetrics,
};
