/**
 * Partner Business Logic and Calculations
 */

import type { Partner, PartnerMetrics, PartnerHealthStatus, PartnerTier } from '../types/partner';

/**
 * Get health status from score
 */
export const getHealthStatus = (score: number): PartnerHealthStatus => {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'healthy';
  if (score >= 50) return 'at-risk';
  return 'critical';
};

/**
 * Get health color
 */
export const getHealthColor = (score: number): string => {
  if (score >= 90) return '#10b981'; // green
  if (score >= 70) return '#3b82f6'; // blue
  if (score >= 50) return '#f59e0b'; // yellow
  return '#ef4444'; // red
};

/**
 * Get tier badge color
 */
export const getTierBadgeColor = (tier: PartnerTier): string => {
  switch (tier) {
    case 'Tier 1':
      return '#8b5cf6'; // purple
    case 'Tier 2':
      return '#3b82f6'; // blue
    case 'Tier 3':
      return '#6b7280'; // gray
  }
};

/**
 * Calculate revenue trend
 */
export const calculateRevenueTrend = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Calculate comprehensive partner metrics
 */
export const calculatePartnerMetrics = (
  partners: Partner[]
): PartnerMetrics => {
  const totalPartners = partners.length;
  const totalRevenue = partners.reduce((sum, p) => sum + p.quarterlyRevenue, 0);
  const averageHealth = totalPartners > 0
    ? partners.reduce((sum, p) => sum + p.healthScore, 0) / totalPartners
    : 0;
  const averageRevenue = totalPartners > 0 ? totalRevenue / totalPartners : 0;

  const atRiskCount = partners.filter(p => p.healthStatus === 'at-risk' || p.healthStatus === 'critical').length;
  const healthyCount = partners.filter(p => p.healthStatus === 'healthy').length;
  const excellentCount = partners.filter(p => p.healthStatus === 'excellent').length;
  const criticalCount = partners.filter(p => p.healthStatus === 'critical').length;

  // Tier distribution
  const tierMap = new Map<PartnerTier, { count: number; revenue: number }>();
  ['Tier 1', 'Tier 2', 'Tier 3'].forEach(tier => {
    tierMap.set(tier as PartnerTier, { count: 0, revenue: 0 });
  });

  partners.forEach(p => {
    const current = tierMap.get(p.tier)!;
    tierMap.set(p.tier, {
      count: current.count + 1,
      revenue: current.revenue + p.quarterlyRevenue
    });
  });

  const tierDistribution = Array.from(tierMap.entries()).map(([tier, data]) => ({
    tier,
    count: data.count,
    revenue: data.revenue
  }));

  // Category distribution
  const categoryMap = new Map();
  partners.forEach(p => {
    const current = categoryMap.get(p.category) || { count: 0, revenue: 0 };
    categoryMap.set(p.category, {
      count: current.count + 1,
      revenue: current.revenue + p.quarterlyRevenue
    });
  });

  const categoryDistribution = Array.from(categoryMap.entries()).map(([category, data]: [string, { count: number; revenue: number }]) => ({
    category,
    count: data.count,
    revenue: data.revenue
  }));

  return {
    totalPartners,
    averageHealth,
    atRiskCount,
    totalRevenue,
    averageRevenue,
    healthyCount,
    excellentCount,
    criticalCount,
    tierDistribution,
    categoryDistribution
  };
};

/**
 * Get partners by tier
 */
export const getPartnersByTier = (partners: Partner[], tier: PartnerTier): Partner[] => {
  return partners.filter(p => p.tier === tier);
};

/**
 * Get at-risk partners
 */
export const getAtRiskPartners = (partners: Partner[]): Partner[] => {
  return partners.filter(p => p.healthStatus === 'at-risk' || p.healthStatus === 'critical');
};

/**
 * Format health score as percentage
 */
export const formatHealthScore = (score: number): string => {
  return `${score.toFixed(0)}%`;
};
