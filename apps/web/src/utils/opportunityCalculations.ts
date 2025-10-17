/**
 * Opportunity Business Logic and Calculations
 *
 * All calculations are performed on data - NO hardcoded values.
 * These functions are pure and testable.
 */

import type {
  Opportunity,
  OpportunityMetrics,
  OpportunityStage,
  OpportunityHealth,
  RevenueDistribution,
  PerformanceTrend
} from '../types/opportunity';

/**
 * Calculate growth rate between two values
 */
export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Format growth rate as string with sign
 */
export const formatGrowthRate = (rate: number): string => {
  const sign = rate > 0 ? '+' : '';
  return `${sign}${rate.toFixed(1)}%`;
};

/**
 * Calculate total value from opportunities
 */
export const calculateTotalValue = (opportunities: Opportunity[]): number => {
  return opportunities.reduce((sum, opp) => sum + opp.amount, 0);
};

/**
 * Calculate total weighted value from opportunities
 */
export const calculateTotalWeightedValue = (opportunities: Opportunity[]): number => {
  return opportunities.reduce((sum, opp) => sum + opp.weightedValue, 0);
};

/**
 * Calculate average deal size
 */
export const calculateAverageDealSize = (opportunities: Opportunity[]): number => {
  if (opportunities.length === 0) return 0;
  return calculateTotalValue(opportunities) / opportunities.length;
};

/**
 * Calculate average probability
 */
export const calculateAverageProbability = (opportunities: Opportunity[]): number => {
  if (opportunities.length === 0) return 0;
  const sum = opportunities.reduce((total, opp) => total + opp.probability, 0);
  return sum / opportunities.length;
};

/**
 * Calculate conversion rate from historical data
 */
export const calculateConversionRate = (
  wonDeals: number,
  totalOpportunities: number
): number => {
  if (totalOpportunities === 0) return 0;
  return (wonDeals / totalOpportunities) * 100;
};

/**
 * Get stage distribution
 */
export const getStageDistribution = (opportunities: Opportunity[]) => {
  const distribution = new Map<OpportunityStage, { count: number; value: number }>();

  // Initialize all stages
  const stages: OpportunityStage[] = ['qualified', 'proposal', 'negotiation', 'closing', 'won', 'lost'];
  stages.forEach(stage => {
    distribution.set(stage, { count: 0, value: 0 });
  });

  // Count opportunities per stage
  opportunities.forEach(opp => {
    const current = distribution.get(opp.stage)!;
    distribution.set(opp.stage, {
      count: current.count + 1,
      value: current.value + opp.amount
    });
  });

  return Array.from(distribution.entries()).map(([stage, data]) => ({
    stage,
    count: data.count,
    value: data.value
  }));
};

/**
 * Get health distribution
 */
export const getHealthDistribution = (opportunities: Opportunity[]) => {
  const distribution = new Map<OpportunityHealth, number>();

  // Initialize all health statuses
  const healthStatuses: OpportunityHealth[] = ['healthy', 'at-risk', 'critical'];
  healthStatuses.forEach(health => {
    distribution.set(health, 0);
  });

  // Count opportunities per health status
  opportunities.forEach(opp => {
    const current = distribution.get(opp.health)!;
    distribution.set(opp.health, current + 1);
  });

  const total = opportunities.length;

  return Array.from(distribution.entries()).map(([health, count]) => ({
    health,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0
  }));
};

/**
 * Calculate comprehensive opportunity metrics
 */
export const calculateOpportunityMetrics = (
  opportunities: Opportunity[],
  previousMetrics?: {
    totalOpportunities: number;
    totalValue: number;
    wonDeals: number;
  }
): OpportunityMetrics => {
  const totalOpportunities = opportunities.length;
  const totalValue = calculateTotalValue(opportunities);
  const totalWeightedValue = calculateTotalWeightedValue(opportunities);
  const averageDealSize = calculateAverageDealSize(opportunities);
  const averageProbability = calculateAverageProbability(opportunities);

  // Calculate growth rate compared to previous period
  const growthRate = previousMetrics
    ? calculateGrowthRate(totalOpportunities, previousMetrics.totalOpportunities)
    : 0;

  // Calculate conversion rate (example: using historical data)
  const conversionRate = previousMetrics
    ? calculateConversionRate(previousMetrics.wonDeals, previousMetrics.totalOpportunities)
    : 0;

  return {
    totalOpportunities,
    totalValue,
    totalWeightedValue,
    averageDealSize,
    averageProbability,
    growthRate,
    conversionRate,
    stageDistribution: getStageDistribution(opportunities),
    healthDistribution: getHealthDistribution(opportunities)
  };
};

/**
 * Get revenue distribution by partner type
 */
export const getRevenueDistribution = (opportunities: Opportunity[]): RevenueDistribution[] => {
  const distribution = new Map<string, number>();

  opportunities.forEach(opp => {
    const type = opp.partner.type;
    const current = distribution.get(type) || 0;
    distribution.set(type, current + opp.weightedValue);
  });

  // Color mapping for partner types
  const colors: { [key: string]: string } = {
    'Technology': '#667eea',
    'Security': '#f59e0b',
    'Professional Services': '#06b6d4',
    'Data Analytics': '#10b981',
    'FinOps': '#8b5cf6',
    'DevOps': '#ec4899'
  };

  return Array.from(distribution.entries())
    .map(([category, value]) => ({
      category,
      value,
      color: colors[category] || '#6b7280'
    }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Calculate performance trends from historical data
 */
export const calculatePerformanceTrends = (
  historicalData: Array<{
    period: string;
    value: number;
    opportunities: number;
    wonDeals: number;
  }>
): PerformanceTrend[] => {
  return historicalData.map(data => ({
    period: data.period,
    value: data.value,
    opportunities: data.opportunities,
    conversionRate: calculateConversionRate(data.wonDeals, data.opportunities)
  }));
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format large numbers (e.g., 1500000 => "$1.5M")
 */
export const formatLargeNumber = (amount: number, currency?: string): string => {
  if (amount >= 1000000) {
    return `${currency ? '$' : ''}${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${currency ? '$' : ''}${(amount / 1000).toFixed(0)}K`;
  }
  return formatCurrency(amount, currency);
};

/**
 * Get opportunities by stage
 */
export const getOpportunitiesByStage = (
  opportunities: Opportunity[],
  stage: OpportunityStage
): Opportunity[] => {
  return opportunities.filter(opp => opp.stage === stage);
};

/**
 * Get opportunities by health
 */
export const getOpportunitiesByHealth = (
  opportunities: Opportunity[],
  health: OpportunityHealth
): Opportunity[] => {
  return opportunities.filter(opp => opp.health === health);
};

/**
 * Get at-risk opportunities (critical or at-risk health)
 */
export const getAtRiskOpportunities = (opportunities: Opportunity[]): Opportunity[] => {
  return opportunities.filter(opp => opp.health === 'at-risk' || opp.health === 'critical');
};

/**
 * Get top opportunities by weighted value
 */
export const getTopOpportunities = (
  opportunities: Opportunity[],
  limit: number = 5
): Opportunity[] => {
  return [...opportunities]
    .sort((a, b) => b.weightedValue - a.weightedValue)
    .slice(0, limit);
};
