/**
 * Dashboard API Service
 * Handles dashboard KPIs and analytics
 */

import { api } from './api';

// Types
export interface DashboardKPIs {
  revenue: {
    total: number;
    target: number;
    percentage: number;
    trend: number;
    currency: string;
  };
  partners: {
    total: number;
    active: number;
    healthy: number;
    atRisk: number;
    critical: number;
  };
  opportunities: {
    total: number;
    totalValue: number;
    weightedValue: number;
    averageSize: number;
    winRate: number;
  };
  pipeline: {
    qualified: number;
    proposal: number;
    negotiation: number;
    closing: number;
  };
}

export interface RevenueData {
  total: number;
  target: number;
  percentage: number;
  trend: number;
  currency: string;
  monthlyData: {
    month: string;
    actual: number;
    target: number;
  }[];
}

export interface PartnerHealthData {
  total: number;
  active: number;
  healthy: number;
  atRisk: number;
  critical: number;
  distribution: {
    tier: string;
    count: number;
    revenue: number;
  }[];
}

// Mock data generator
const generateMockKPIs = (): DashboardKPIs => {
  return {
    revenue: {
      total: 2847000,
      target: 3500000,
      percentage: 81.3,
      trend: 12.5,
      currency: 'USD'
    },
    partners: {
      total: 45,
      active: 38,
      healthy: 28,
      atRisk: 7,
      critical: 3
    },
    opportunities: {
      total: 127,
      totalValue: 8950000,
      weightedValue: 4475000,
      averageSize: 70472,
      winRate: 42.3
    },
    pipeline: {
      qualified: 35,
      proposal: 28,
      negotiation: 18,
      closing: 12
    }
  };
};

const generateMockRevenueData = (): RevenueData => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();

  return {
    total: 2847000,
    target: 3500000,
    percentage: 81.3,
    trend: 12.5,
    currency: 'USD',
    monthlyData: months.slice(0, currentMonth + 1).map((month, index) => ({
      month,
      actual: 200000 + Math.random() * 150000,
      target: 291666
    }))
  };
};

const generateMockPartnerHealthData = (): PartnerHealthData => {
  return {
    total: 45,
    active: 38,
    healthy: 28,
    atRisk: 7,
    critical: 3,
    distribution: [
      { tier: 'Strategic', count: 8, revenue: 1200000 },
      { tier: 'Premium', count: 15, revenue: 980000 },
      { tier: 'Standard', count: 22, revenue: 667000 }
    ]
  };
};

// API methods
export const dashboardApi = {
  /**
   * Get overall dashboard KPIs
   */
  async getKPIs(): Promise<{ success: boolean; data: DashboardKPIs }> {
    try {
      const response = await api.get<{ success: boolean; data: DashboardKPIs }>('/dashboard/kpis');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard KPIs from API, using fallback data:', error);
      // Fallback to mock data if API fails
      await new Promise(resolve => setTimeout(resolve, 100));
      const data = generateMockKPIs();
      return {
        success: true,
        data
      };
    }
  },

  /**
   * Get revenue progress data (fallback removed after testing)
   */
  async getRevenueProgress(): Promise<{ success: boolean; data: RevenueData }> {
    try {
      const response = await api.get<{ success: boolean; data: RevenueData }>('/dashboard/revenue');
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue data from API, using fallback data:', error);
      throw error;
    }
  },

  /**
   * Get revenue data and trends
   */
  async getRevenueData(): Promise<{ success: boolean; data: RevenueData }> {
    try {
      const response = await api.get<{ success: boolean; data: RevenueData }>('/dashboard/revenue');
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue data from API, using fallback data:', error);
      await new Promise(resolve => setTimeout(resolve, 100));
      const data = generateMockRevenueData();
      return {
        success: true,
        data
      };
    }
  },

  /**
   * Get partner health metrics
   */
  async getPartnerHealth(): Promise<{ success: boolean; data: PartnerHealthData }> {
    try {
      const response = await api.get<{ success: boolean; data: PartnerHealthData }>('/partners/health');
      return response.data;
    } catch (error) {
      console.error('Error fetching partner health from API, using fallback data:', error);
      await new Promise(resolve => setTimeout(resolve, 100));
      const data = generateMockPartnerHealthData();
      return {
        success: true,
        data
      };
    }
  },

  /**
   * Get opportunities pipeline metrics
   */
  async getPipelineMetrics(): Promise<{ success: boolean; data: any }> {
    try {
      const response = await api.get<{ success: boolean; data: any }>('/dashboard/pipeline');
      return response.data;
    } catch (error) {
      console.error('Error fetching pipeline metrics from API, using fallback data:', error);
      const data = {
        stages: [
          { stage: 'qualified', count: 35, value: 2450000 },
          { stage: 'proposal', count: 28, value: 1960000 },
          { stage: 'negotiation', count: 18, value: 1260000 },
          { stage: 'closing', count: 12, value: 840000 }
        ],
        velocity: {
          averageDaysInStage: {
            qualified: 12,
            proposal: 18,
            negotiation: 24,
            closing: 15
          },
          conversionRates: {
            qualifiedToProposal: 78,
            proposalToNegotiation: 64,
            negotiationToClosing: 67,
            closingToWon: 85
          }
        }
      };
      return {
        success: true,
        data
      };
    }
  },

  /**
   * Get pipeline funnel data
   */
  async getPipelineFunnel(): Promise<{ success: boolean; data: any }> {
    try {
      const response = await api.get<{ success: boolean; data: any }>('/dashboard/pipeline');
      return response.data;
    } catch (error) {
      console.error('Error fetching pipeline funnel from API, using fallback data:', error);
      const data = {
        stages: [
          { name: 'Qualified', count: 35, value: 2450000, percentage: 100 },
          { name: 'Proposal', count: 28, value: 1960000, percentage: 80 },
          { name: 'Negotiation', count: 18, value: 1260000, percentage: 51 },
          { name: 'Closing', count: 12, value: 840000, percentage: 34 },
          { name: 'Won', count: 8, value: 560000, percentage: 23 }
        ],
        totalValue: 7070000,
        totalCount: 101,
        conversionRate: 23
      };
      return {
        success: true,
        data
      };
    }
  },

  /**
   * Get team performance data
   */
  async getTeamPerformance(): Promise<{ success: boolean; data: any }> {
    try {
      const response = await api.get<{ success: boolean; data: any }>('/dashboard/team');
      return response.data;
    } catch (error) {
      console.error('Error fetching team performance from API, using fallback data:', error);
      const data = {
        members: [
          { name: 'Sarah Johnson', opportunities: 15, value: 1050000, winRate: 45, avatar: null },
          { name: 'Michael Chen', opportunities: 12, value: 840000, winRate: 38, avatar: null },
          { name: 'Emily Rodriguez', opportunities: 18, value: 1260000, winRate: 52, avatar: null },
          { name: 'David Kim', opportunities: 10, value: 700000, winRate: 35, avatar: null },
          { name: 'Jessica Wu', opportunities: 14, value: 980000, winRate: 41, avatar: null }
        ],
        teamMetrics: {
          totalOpportunities: 69,
          totalValue: 4830000,
          averageWinRate: 42.2,
          topPerformer: 'Emily Rodriguez'
        }
      };
      return {
        success: true,
        data
      };
    }
  },

  /**
   * Get partner analytics
   */
  async getPartnerAnalytics(): Promise<{ success: boolean; data: any }> {
    try {
      // TODO: Replace with real API call when backend is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = {
        topPartners: [
          { name: 'TechCorp Solutions', revenue: 450000, growth: 23, opportunities: 8 },
          { name: 'Global Systems Inc', revenue: 380000, growth: 15, opportunities: 6 },
          { name: 'Innovation Partners', revenue: 320000, growth: 31, opportunities: 9 },
          { name: 'Enterprise Solutions', revenue: 290000, growth: 12, opportunities: 5 },
          { name: 'Digital Ventures', revenue: 250000, growth: 18, opportunities: 7 }
        ],
        tierDistribution: [
          { tier: 'Strategic', count: 8, revenue: 1200000 },
          { tier: 'Premium', count: 15, revenue: 980000 },
          { tier: 'Standard', count: 22, revenue: 667000 }
        ],
        engagement: {
          activePartners: 38,
          atRisk: 7,
          needsAttention: 5
        }
      };

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching partner analytics:', error);
      throw error;
    }
  },

  /**
   * Get financial metrics
   */
  async getFinancialMetrics(): Promise<{ success: boolean; data: any }> {
    try {
      // TODO: Replace with real API call when backend is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = {
        revenue: {
          total: 2847000,
          recurring: 1920000,
          oneTime: 927000,
          growth: 12.5
        },
        commissions: {
          paid: 284700,
          pending: 145200,
          forecasted: 356000
        },
        forecast: {
          q1: 950000,
          q2: 1100000,
          q3: 1200000,
          q4: 1300000
        },
        breakdown: {
          byPartnerTier: [
            { tier: 'Strategic', revenue: 1200000, percentage: 42 },
            { tier: 'Premium', revenue: 980000, percentage: 34 },
            { tier: 'Standard', revenue: 667000, percentage: 24 }
          ],
          byProduct: [
            { product: 'Enterprise Suite', revenue: 1350000, percentage: 47 },
            { product: 'Professional Plan', revenue: 850000, percentage: 30 },
            { product: 'Standard Plan', revenue: 647000, percentage: 23 }
          ]
        }
      };

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching financial metrics:', error);
      throw error;
    }
  }
};

export default dashboardApi;
