/**
 * Opportunity Data Models
 * These interfaces define the data structure for opportunities.
 * When we replace mock data with real API calls, the API responses
 * should match these interfaces.
 */

export type OpportunityStage =
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closing'
  | 'won'
  | 'lost';

export type OpportunityHealth =
  | 'healthy'
  | 'at-risk'
  | 'critical';

export type PartnerTier =
  | 'Strategic'
  | 'Enterprise'
  | 'Premium'
  | 'Standard';

export type PartnerType =
  | 'Technology'
  | 'Security'
  | 'Professional Services'
  | 'Data Analytics'
  | 'FinOps'
  | 'DevOps';

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  tier: PartnerTier;
  logoUrl?: string;
}

export interface OpportunityOwner {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface Opportunity {
  id: string;
  name: string;
  description?: string;
  partner: Partner;
  stage: OpportunityStage;
  amount: number;
  currency: string;
  probability: number; // 0-100
  weightedValue: number; // amount * (probability / 100)
  owner: OpportunityOwner;
  expectedCloseDate: Date;
  createdDate: Date;
  lastModifiedDate: Date;
  daysInStage: number;
  health: OpportunityHealth;
  tags?: string[];
}

export interface OpportunityMetrics {
  totalOpportunities: number;
  totalValue: number;
  totalWeightedValue: number;
  averageDealSize: number;
  averageProbability: number;
  growthRate: number; // percentage
  conversionRate: number; // percentage
  stageDistribution: {
    stage: OpportunityStage;
    count: number;
    value: number;
  }[];
  healthDistribution: {
    health: OpportunityHealth;
    count: number;
    percentage: number;
  }[];
}

export interface RevenueDistribution {
  category: string;
  value: number;
  color: string;
}

export interface PerformanceTrend {
  period: string; // e.g., "Jan", "Feb", "Q1 2024"
  value: number;
  opportunities: number;
  conversionRate: number;
}

export interface OpportunityFilters {
  stage?: OpportunityStage | 'all';
  health?: OpportunityHealth | 'all';
  partner?: string | 'all';
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
