import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  probability: number;
  conversionRate?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface PipelineData {
  stages: PipelineStage[];
  totalValue: number;
  weightedValue: number;
  totalOpportunities: number;
}

export interface PipelineFilters {
  teamMember?: string;
  partner?: string;
  dateRange?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  value: number;
  stage: string;
  partnerName: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineTrend {
  period: string;
  stage: string;
  count: number;
  value: number;
}

class PipelineService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const parsed = JSON.parse(token);
        return {
          'Authorization': `Bearer ${parsed.state.token}`
        };
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  async getPipelineHealth(filters: PipelineFilters = {}): Promise<PipelineData> {
    try {
      const params = new URLSearchParams();
      if (filters.teamMember) params.append('teamMember', filters.teamMember);
      if (filters.partner) params.append('partner', filters.partner);
      if (filters.dateRange) params.append('dateRange', filters.dateRange);

      const response = await axios.get(`${API_BASE_URL}/api/pipeline/health?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching pipeline health:', error);

      // Return mock data as fallback
      return {
        stages: [
          {
            stage: 'Lead',
            count: 45,
            value: 2250000,
            probability: 10,
            conversionRate: 32.5,
            trend: 'up'
          },
          {
            stage: 'Demo',
            count: 28,
            value: 1680000,
            probability: 25,
            conversionRate: 68.2,
            trend: 'up'
          },
          {
            stage: 'POC',
            count: 15,
            value: 1125000,
            probability: 50,
            conversionRate: 73.5,
            trend: 'stable'
          },
          {
            stage: 'Proposal',
            count: 8,
            value: 720000,
            probability: 75,
            conversionRate: 85.2,
            trend: 'down'
          },
          {
            stage: 'Closed Won',
            count: 12,
            value: 960000,
            probability: 100,
            conversionRate: 100,
            trend: 'up'
          }
        ],
        totalValue: 6735000,
        weightedValue: 2845000,
        totalOpportunities: 108
      };
    }
  }

  async getOpportunitiesByStage(stage: string, filters: PipelineFilters = {}): Promise<Opportunity[]> {
    try {
      const params = new URLSearchParams();
      if (filters.teamMember) params.append('teamMember', filters.teamMember);
      if (filters.partner) params.append('partner', filters.partner);
      if (filters.dateRange) params.append('dateRange', filters.dateRange);

      const response = await axios.get(`${API_BASE_URL}/api/pipeline/opportunities/${stage}?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching opportunities by stage:', error);
      return [];
    }
  }

  async getPipelineTrends(period: 'monthly' | 'quarterly' = 'quarterly'): Promise<PipelineTrend[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/pipeline/trends?period=${period}`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching pipeline trends:', error);
      return [];
    }
  }

  exportPipelineData(data: PipelineData, filename: string = 'pipeline-health-data.csv') {
    const csvData = data.stages.map(stage => ({
      Stage: stage.stage,
      Count: stage.count,
      'Total Value': stage.value,
      'Probability %': stage.probability,
      'Conversion Rate %': stage.conversionRate || 0,
      'Weighted Value': (stage.value * stage.probability / 100)
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

export const pipelineService = new PipelineService();