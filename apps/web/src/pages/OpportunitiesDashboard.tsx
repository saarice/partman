import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { TrendingUp, TrendingDown, Briefcase, DollarSign, Target, AlertCircle } from 'lucide-react';
import { getMockOpportunities, getPreviousPeriodMetrics, getMockOpportunityHistory } from '../services/mockOpportunityData';
import {
  calculateOpportunityMetrics,
  formatLargeNumber,
  formatGrowthRate,
  getRevenueDistribution,
  calculatePerformanceTrends,
  getAtRiskOpportunities
} from '../utils/opportunityCalculations';
import type { Opportunity, OpportunityMetrics } from '../types/opportunity';
import KPICard from '../components/dashboard/KPICard';

/**
 * Opportunities Dashboard
 *
 * Data-driven dashboard that:
 * - Loads data from mock service (will be replaced with API)
 * - Calculates all metrics from data
 * - Passes data to reusable components
 * - NO hardcoded values in UI
 */
const OpportunitiesDashboard: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  /**
   * Load dashboard data
   * TODO: Replace with real API call
   * const response = await fetch('/api/opportunities');
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // In production: const data = await fetchOpportunitiesFromAPI();
      const data = getMockOpportunities();
      setOpportunities(data);
      setError(null);
    } catch (err) {
      setError('Failed to load opportunity data');
      console.error('Error loading opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics from data
  const metrics: OpportunityMetrics = useMemo(() => {
    const previousMetrics = getPreviousPeriodMetrics();
    return calculateOpportunityMetrics(opportunities, previousMetrics);
  }, [opportunities]);

  // Calculate revenue distribution for charts
  const revenueDistribution = useMemo(() => {
    return getRevenueDistribution(opportunities);
  }, [opportunities]);

  // Calculate performance trends
  const performanceTrends = useMemo(() => {
    const historyData = getMockOpportunityHistory();
    return calculatePerformanceTrends(historyData);
  }, []);

  // Get at-risk opportunities
  const atRiskOpportunities = useMemo(() => {
    return getAtRiskOpportunities(opportunities);
  }, [opportunities]);

  // Get active opportunities (not won or lost)
  const activeOpportunities = useMemo(() => {
    return opportunities.filter(opp => opp.stage !== 'won' && opp.stage !== 'lost');
  }, [opportunities]);

  // KPI data calculated from metrics
  const kpiData = [
    {
      title: 'Active Opportunities',
      value: activeOpportunities.length,
      change: formatGrowthRate(metrics.growthRate),
      changeType: metrics.growthRate >= 0 ? ('positive' as const) : ('negative' as const),
      link: '/management/opportunities',
      linkText: 'View all opportunities',
      icon: <Briefcase size={24} />,
      iconColor: '#667eea',
    },
    {
      title: 'Pipeline Value',
      value: formatLargeNumber(metrics.totalValue, 'USD'),
      change: `Avg: ${formatLargeNumber(metrics.averageDealSize, 'USD')}`,
      changeType: 'neutral' as const,
      link: '/management/opportunities',
      linkText: 'Manage pipeline',
      icon: <DollarSign size={24} />,
      iconColor: '#10b981',
    },
    {
      title: 'Weighted Value',
      value: formatLargeNumber(metrics.totalWeightedValue, 'USD'),
      change: `${metrics.averageProbability.toFixed(0)}% avg probability`,
      changeType: 'neutral' as const,
      link: '/management/opportunities',
      linkText: 'View forecasts',
      icon: <Target size={24} />,
      iconColor: '#f59e0b',
    },
    {
      title: 'At Risk',
      value: atRiskOpportunities.length,
      change: `${((atRiskOpportunities.length / activeOpportunities.length) * 100).toFixed(1)}% of active`,
      changeType: atRiskOpportunities.length > 0 ? ('negative' as const) : ('positive' as const),
      link: '/management/opportunities',
      linkText: 'Review at-risk',
      icon: <AlertCircle size={24} />,
      iconColor: '#ef4444',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      {/* Breadcrumb */}
      <Box
        component="nav"
        aria-label="Breadcrumb"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          marginBottom: 3,
          fontSize: '14px',
        }}
      >
        <Typography sx={{ color: 'text.primary', fontWeight: 500, fontSize: '14px' }}>
          Opportunities Dashboard
        </Typography>
      </Box>

      {/* Page Header */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: '30px',
            fontWeight: 700,
            color: 'text.primary',
            margin: '0 0 8px 0',
          }}
        >
          Opportunities Dashboard
        </Typography>
        <Typography sx={{ fontSize: '16px', color: 'text.secondary', margin: 0 }}>
          Pipeline health, revenue forecasting, and opportunity metrics
        </Typography>
      </Box>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        {kpiData.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <KPICard {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        {/* Revenue Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              padding: 3,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            }}
          >
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: 'text.primary', marginBottom: 3 }}>
              Pipeline Distribution by Stage
            </Typography>

            {/* Stage Breakdown */}
            {metrics.stageDistribution
              .filter(s => s.count > 0 && s.stage !== 'won' && s.stage !== 'lost')
              .map((stage, index) => (
                <Box key={stage.stage} sx={{ marginBottom: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.primary', textTransform: 'capitalize' }}>
                      {stage.stage}
                    </Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.secondary' }}>
                      {stage.count} ({formatLargeNumber(stage.value, 'USD')})
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      height: '8px',
                      backgroundColor: 'action.hover',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${(stage.value / metrics.totalValue) * 100}%`,
                        backgroundColor: index === 0 ? '#667eea' : index === 1 ? '#10b981' : index === 2 ? '#f59e0b' : '#8b5cf6',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                </Box>
              ))}
          </Paper>
        </Grid>

        {/* Revenue by Category */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              padding: 3,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            }}
          >
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: 'text.primary', marginBottom: 3 }}>
              Revenue Distribution by Category
            </Typography>

            {/* Category Breakdown */}
            {revenueDistribution.slice(0, 5).map((category, index) => (
              <Box key={category.category} sx={{ marginBottom: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: category.color,
                        borderRadius: '2px',
                      }}
                    />
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.primary' }}>
                      {category.category}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.secondary' }}>
                    {formatLargeNumber(category.value, 'USD')}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: '8px',
                    backgroundColor: 'action.hover',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${(category.value / metrics.totalWeightedValue) * 100}%`,
                      backgroundColor: category.color,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Performance Trends */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper
            sx={{
              padding: 3,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            }}
          >
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: 'text.primary', marginBottom: 3 }}>
              Performance Trends (Last 6 Months)
            </Typography>

            <Grid container spacing={2}>
              {performanceTrends.map((trend) => (
                <Grid item xs={6} sm={4} md={2} key={trend.period}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '12px', color: 'text.secondary', marginBottom: 1 }}>
                      {trend.period}
                    </Typography>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700, color: 'text.primary', marginBottom: 0.5 }}>
                      {formatLargeNumber(trend.value, 'USD')}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                      {trend.opportunities} opps
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#10b981', fontWeight: 500 }}>
                      {trend.conversionRate.toFixed(1)}% won
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OpportunitiesDashboard;
