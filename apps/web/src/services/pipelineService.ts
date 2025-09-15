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
      } catch {
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
            stage: 'lead',
            count: 45,
            value: 2250000,
            probability: 10,
            conversionRate: 32.5,
            trend: 'up'
          },
          {
            stage: 'demo',
            count: 28,
            value: 1680000,
            probability: 25,
            conversionRate: 68.2,
            trend: 'up'
          },
          {
            stage: 'poc',
            count: 15,
            value: 1125000,
            probability: 50,
            conversionRate: 73.5,
            trend: 'stable'
          },
          {
            stage: 'proposal',
            count: 8,
            value: 720000,
            probability: 75,
            conversionRate: 85.2,
            trend: 'down'
          },
          {
            stage: 'closed_won',
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

      // Return mock historical data as fallback
      const mockTrends: PipelineTrend[] = [];
      const stages = ['lead', 'demo', 'poc', 'proposal', 'closed_won'];

      if (period === 'quarterly') {
        const quarters = ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4'];
        quarters.forEach(quarter => {
          stages.forEach(stage => {
            const baseCount = stage === 'lead' ? 50 : stage === 'demo' ? 35 : stage === 'poc' ? 20 : stage === 'proposal' ? 12 : 8;
            const variation = Math.random() * 0.4 - 0.2; // ±20% variation
            const count = Math.round(baseCount * (1 + variation));
            const baseValue = count * (stage === 'lead' ? 50000 : stage === 'demo' ? 75000 : stage === 'poc' ? 100000 : stage === 'proposal' ? 125000 : 150000);

            mockTrends.push({
              period: quarter,
              stage,
              count,
              value: baseValue
            });
          });
        });
      } else {
        const months = ['2024-09', '2024-10', '2024-11', '2024-12'];
        months.forEach(month => {
          stages.forEach(stage => {
            const baseCount = stage === 'lead' ? 15 : stage === 'demo' ? 10 : stage === 'poc' ? 6 : stage === 'proposal' ? 4 : 3;
            const variation = Math.random() * 0.4 - 0.2; // ±20% variation
            const count = Math.round(baseCount * (1 + variation));
            const baseValue = count * (stage === 'lead' ? 50000 : stage === 'demo' ? 75000 : stage === 'poc' ? 100000 : stage === 'proposal' ? 125000 : 150000);

            mockTrends.push({
              period: month,
              stage,
              count,
              value: baseValue
            });
          });
        });
      }

      return mockTrends;
    }
  }

  exportPipelineData(data: PipelineData, filename: string = 'pipeline-health-data.csv', filters?: PipelineFilters) {
    const timestamp = new Date().toISOString();
    const csvData = data.stages.map(stage => ({
      Stage: stage.stage,
      'Stage Display Name': this.getDisplayName(stage.stage),
      Count: stage.count,
      'Total Value': stage.value,
      'Probability %': stage.probability,
      'Conversion Rate %': stage.conversionRate || 0,
      'Weighted Value': (stage.value * stage.probability / 100),
      'Trend': stage.trend || 'stable'
    }));

    // Create metadata header
    const metadata = [
      '# Pipeline Health Export',
      `# Generated: ${timestamp}`,
      `# Total Opportunities: ${data.totalOpportunities}`,
      `# Total Pipeline Value: $${(data.totalValue / 1000000).toFixed(2)}M`,
      `# Weighted Pipeline Value: $${(data.weightedValue / 1000000).toFixed(2)}M`,
      filters?.teamMember && filters.teamMember !== 'all' ? `# Filtered by Team Member: ${filters.teamMember}` : '',
      filters?.partner && filters.partner !== 'all' ? `# Filtered by Partner: ${filters.partner}` : '',
      filters?.dateRange ? `# Date Range: ${filters.dateRange}` : '',
      '# ',
      '# Stage Data:'
    ].filter(Boolean);

    const csv = [
      ...metadata,
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

  private getDisplayName(stageId: string): string {
    const displayNames: Record<string, string> = {
      'lead': 'Lead',
      'demo': 'Demo',
      'poc': 'POC',
      'proposal': 'Proposal',
      'closed_won': 'Closed Won'
    };
    return displayNames[stageId] || stageId;
  }

  exportPipelineTrends(trends: PipelineTrend[], filename: string = 'pipeline-trends-data.csv', period: 'monthly' | 'quarterly' = 'quarterly') {
    const timestamp = new Date().toISOString();

    const csvData = trends.map(trend => ({
      Period: trend.period,
      Stage: trend.stage,
      'Stage Display Name': this.getDisplayName(trend.stage),
      Count: trend.count,
      'Total Value': trend.value,
      'Value (Millions)': (trend.value / 1000000).toFixed(2)
    }));

    // Create metadata header
    const metadata = [
      '# Pipeline Trends Export',
      `# Generated: ${timestamp}`,
      `# Period Type: ${period}`,
      `# Total Records: ${trends.length}`,
      '# ',
      '# Trend Data:'
    ];

    const csv = [
      ...metadata,
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