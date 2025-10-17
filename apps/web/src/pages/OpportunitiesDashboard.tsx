import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  ShowChart as ChartIcon,
} from '@mui/icons-material';
import KPICard from '../components/dashboard/KPICard';
import { Opportunity, OpportunityMetrics } from '../types/opportunity';
import {
  getMockOpportunities,
  getPreviousPeriodMetrics,
  getMockOpportunityHistory
} from '../services/mockOpportunityData';
import {
  calculateOpportunityMetrics,
  formatCurrency,
  formatLargeNumber,
  formatGrowthRate,
  getRevenueDistribution,
  calculatePerformanceTrends
} from '../utils/opportunityCalculations';

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
  // State management
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

  // KPI data calculated from metrics
  const kpiData = [
    {
      title: 'Active Opportunities',
      value: metrics.totalOpportunities,
      change: formatGrowthRate(metrics.growthRate),
      changeType: metrics.growthRate >= 0 ? ('positive' as const) : ('negative' as const),
      link: '/management/opportunities',
      linkText: 'View all opportunities',
      icon: <BusinessIcon />,
      iconColor: '#667eea',
    },
    {
      title: 'Pipeline Value',
      value: formatLargeNumber(metrics.totalValue, 'USD'),
      change: `Avg: ${formatLargeNumber(metrics.averageDealSize, 'USD')}`,
      changeType: 'neutral' as const,
      link: '/management/opportunities',
      linkText: 'View pipeline',
      icon: <MoneyIcon />,
      iconColor: '#22c55e',
    },
    {
      title: 'Weighted Value',
      value: formatLargeNumber(metrics.totalWeightedValue, 'USD'),
      change: `Avg probability: ${metrics.averageProbability.toFixed(0)}%`,
      changeType: 'neutral' as const,
      link: '/management/opportunities',
      linkText: 'View forecast',
      icon: <ChartIcon />,
      iconColor: '#f59e0b',
    },
    {
      title: 'Conversion Rate',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      change: `From ${metrics.totalOpportunities} opportunities`,
      changeType: metrics.conversionRate >= 20 ? ('positive' as const) : ('neutral' as const),
      link: '/management/opportunities',
      linkText: 'View details',
      icon: <TrendingUpIcon />,
      iconColor: '#06b6d4',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ flex: 1, padding: '32px', backgroundColor: 'background.default' }}>
        <Typography>Loading opportunities dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ flex: 1, padding: '32px', backgroundColor: 'background.default' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, padding: '32px', backgroundColor: 'background.default' }}>
      {/* Breadcrumb */}
      <Box
        component="nav"
        aria-label="Breadcrumb"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
          fontSize: '14px',
        }}
      >
        <Typography sx={{ color: 'text.primary', fontWeight: 500, fontSize: '14px' }}>
          Opportunities Dashboard
        </Typography>
      </Box>

      {/* Page Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <Box>
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
      </Box>

      {/* KPI Cards Grid - Data from calculations */}
      <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
        {kpiData.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={6} lg={3} key={index}>
            <KPICard {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
        {/* Revenue Distribution by Partner Type */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            }}
          >
            <Typography sx={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
              Revenue Distribution by Partner Type
            </Typography>
            <Typography sx={{ fontSize: '14px', color: 'text.secondary', marginBottom: '24px' }}>
              Weighted value across partner categories
            </Typography>

            {/* Legend calculated from data */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', fontSize: '12px' }}>
              {revenueDistribution.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Box sx={{ width: '12px', height: '12px', backgroundColor: item.color, borderRadius: '2px' }} />
                  <span>
                    {item.category} <strong>{formatLargeNumber(item.value, 'USD')}</strong>
                  </span>
                </Box>
              ))}
            </Box>

            {/* Bar chart calculated from data */}
            <Box sx={{ height: '180px' }}>
              {revenueDistribution.map((item, idx) => {
                const maxValue = Math.max(...revenueDistribution.map(d => d.value));
                const widthPercent = (item.value / maxValue) * 100;

                return (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <Typography sx={{ width: '120px', fontSize: '14px', color: 'text.secondary' }}>
                      {item.category.substring(0, 12)}
                    </Typography>
                    <Box sx={{ flex: 1, height: '32px', display: 'flex', borderRadius: '4px', overflow: 'hidden' }}>
                      <Box sx={{ width: `${widthPercent}%`, backgroundColor: item.color, height: '100%' }} />
                    </Box>
                    <Typography sx={{ width: '80px', textAlign: 'right', fontSize: '14px', fontWeight: 600 }}>
                      {formatLargeNumber(item.value, 'USD')}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>

        {/* Pipeline Performance Trends */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            }}
          >
            <Typography sx={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
              Pipeline Performance Trends
            </Typography>
            <Typography sx={{ fontSize: '14px', color: 'text.secondary', marginBottom: '24px' }}>
              Monthly growth and conversion metrics
            </Typography>

            {/* Metric cards calculated from data */}
            <Grid container spacing={2} sx={{ marginBottom: '24px' }}>
              {[
                { label: 'Avg Deal Size', value: formatLargeNumber(metrics.averageDealSize, 'USD') },
                { label: 'Avg Probability', value: `${metrics.averageProbability.toFixed(1)}%` },
                { label: 'Conversion', value: `${metrics.conversionRate.toFixed(1)}%` },
                {
                  label: 'At Risk',
                  value: metrics.healthDistribution.find(h => h.health === 'at-risk')?.count || 0,
                },
              ].map((metric, idx) => (
                <Grid item xs={3} key={idx}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700, color: 'text.primary' }}>
                      {metric.value}
                    </Typography>
                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', marginTop: '4px' }}>
                      {metric.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Line chart from performance trends */}
            <Box sx={{ height: '140px', position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
                <polyline
                  points={performanceTrends
                    .map((trend, idx) => {
                      const x = (idx / (performanceTrends.length - 1)) * 400;
                      const maxValue = Math.max(...performanceTrends.map(t => t.value));
                      const y = 100 - (trend.value / maxValue) * 100;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#667eea"
                  strokeWidth="2"
                />
                {performanceTrends.map((trend, idx) => {
                  const x = (idx / (performanceTrends.length - 1)) * 400;
                  const maxValue = Math.max(...performanceTrends.map(t => t.value));
                  const y = 100 - (trend.value / maxValue) * 100;
                  return <circle key={idx} cx={x} cy={y} r="3" fill="#667eea" />;
                })}
              </svg>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'text.secondary' }}>
                {performanceTrends.map((trend, idx) => (
                  <span key={idx}>{trend.period}</span>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Coming Soon Section */}
      <Paper
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, marginBottom: '8px' }}>
          More Analytics Coming Soon
        </Typography>
        <Typography color="text.secondary">
          Stage progression analysis, win/loss trends, and detailed forecast accuracy metrics
        </Typography>
      </Paper>
    </Box>
  );
};

export default OpportunitiesDashboard;
