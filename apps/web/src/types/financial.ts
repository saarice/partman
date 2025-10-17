export interface RevenueData {
  period: string;
  amount: number;
  category: string;
  growth: number;
}

export interface Deal {
  id: string;
  partner: string;
  amount: number;
  closeDate: Date;
  category: string;
}

export interface FinancialMetrics {
  totalRevenue: number;
  averageDealSize: number;
  revenueGrowth: number;
  targetRevenue: number;
  achievementRate: number;
}

export interface CategoryRevenue {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}
