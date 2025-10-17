/**
 * Partner Data Models
 * Define data structures for partner management
 */

export type PartnerTier = 'Tier 1' | 'Tier 2' | 'Tier 3';
export type PartnerCategory = 'Technology' | 'Security' | 'Professional Services' | 'Data Analytics' | 'FinOps' | 'DevOps';
export type PartnerHealthStatus = 'excellent' | 'healthy' | 'at-risk' | 'critical';

export interface PartnerContact {
  name: string;
  title: string;
  email: string;
  phone?: string;
}

export interface Partner {
  id: string;
  name: string;
  logo?: string;
  category: PartnerCategory;
  tier: PartnerTier;
  healthScore: number; // 0-100
  healthStatus: PartnerHealthStatus;
  quarterlyRevenue: number;
  activeOpportunities: number;
  contact: PartnerContact;
  nextAction?: string;
  lastActivity: Date;
  tags?: string[];
}

export interface PartnerMetrics {
  totalPartners: number;
  averageHealth: number;
  atRiskCount: number;
  totalRevenue: number;
  averageRevenue: number;
  healthyCount: number;
  excellentCount: number;
  criticalCount: number;
  tierDistribution: {
    tier: PartnerTier;
    count: number;
    revenue: number;
  }[];
  categoryDistribution: {
    category: PartnerCategory;
    count: number;
    revenue: number;
  }[];
}
