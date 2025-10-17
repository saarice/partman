import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { TrendingUp, TrendingDown, Briefcase, DollarSign, Target, AlertCircle } from 'lucide-react';
import { opportunitiesApi, type Opportunity } from '../services/opportunitiesApi';

interface OpportunityMetrics {
  totalOpportunities: number;
  totalValue: number;
  weightedValue: number;
  averageDealSize: number;
  winRate: number;
  activeOpportunities: number;
  atRiskOpportunities: number;
}

interface StageDistribution {
  stage: string;
  count: number;
  value: number;
  percentage: number;
}

/**
 * Opportunities Dashboard
 *
 * Displays pipeline health, revenue forecasting, and opportunity metrics
 * Uses real opportunity data from opportunitiesApi service
 */
const OpportunitiesDashboard: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load opportunities data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await opportunitiesApi.getOpportunities({
          pageSize: 1000 // Get all opportunities for metrics
        });
        setOpportunities(response.opportunities);
        setError(null);
      } catch (err) {
        console.error('Error loading opportunities:', err);
        setError('Failed to load opportunities data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate metrics from opportunities data
  const metrics = useMemo((): OpportunityMetrics => {
    if (opportunities.length === 0) {
      return {
        totalOpportunities: 0,
        totalValue: 0,
        weightedValue: 0,
        averageDealSize: 0,
        winRate: 0,
        activeOpportunities: 0,
        atRiskOpportunities: 0
      };
    }

    const activeOpps = opportunities.filter(opp => !['won', 'lost'].includes(opp.stage));
    const wonOpps = opportunities.filter(opp => opp.stage === 'won');
    const closedOpps = opportunities.filter(opp => ['won', 'lost'].includes(opp.stage));
    const atRiskOpps = opportunities.filter(opp => opp.health === 'at-risk' || opp.health === 'critical');

    const totalValue = activeOpps.reduce((sum, opp) => sum + opp.amount, 0);
    const weightedValue = activeOpps.reduce((sum, opp) => sum + opp.weightedValue, 0);

    return {
      totalOpportunities: opportunities.length,
      totalValue,
      weightedValue,
      averageDealSize: activeOpps.length > 0 ? totalValue / activeOpps.length : 0,
      winRate: closedOpps.length > 0 ? (wonOpps.length / closedOpps.length) * 100 : 0,
      activeOpportunities: activeOpps.length,
      atRiskOpportunities: atRiskOpps.length
    };
  }, [opportunities]);

  // Calculate stage distribution
  const stageDistribution = useMemo((): StageDistribution[] => {
    const stages = ['qualified', 'proposal', 'negotiation', 'closing'];
    const activeOpps = opportunities.filter(opp => !['won', 'lost'].includes(opp.stage));
    const totalValue = activeOpps.reduce((sum, opp) => sum + opp.amount, 0);

    return stages.map(stage => {
      const stageOpps = activeOpps.filter(opp => opp.stage === stage);
      const stageValue = stageOpps.reduce((sum, opp) => sum + opp.amount, 0);

      return {
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),
        count: stageOpps.length,
        value: stageValue,
        percentage: totalValue > 0 ? (stageValue / totalValue) * 100 : 0
      };
    });
  }, [opportunities]);

  // Format currency
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: '32px' }}>
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
      <Box sx={{ marginBottom: '32px' }}>
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
      <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
        {/* Total Pipeline Value */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              padding: '24px',
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pipeline Value
              </Typography>
              <DollarSign size={20} color="#10b981" />
            </Box>
            <Typography sx={{ fontSize: '32px', fontWeight: 700, color: 'text.primary', marginBottom: '8px' }}>
              {formatCurrency(metrics.totalValue)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={16} color="#10b981" />
              <Typography sx={{ fontSize: '14px', color: '#10b981', fontWeight: 500 }}>
                {metrics.activeOpportunities} active opportunities
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Weighted Value */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              padding: '24px',
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Weighted Value
              </Typography>
              <Target size={20} color="#3b82f6" />
            </Box>
            <Typography sx={{ fontSize: '32px', fontWeight: 700, color: 'text.primary', marginBottom: '8px' }}>
              {formatCurrency(metrics.weightedValue)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Typography sx={{ fontSize: '14px', color: 'text.secondary', fontWeight: 500 }}>
                Expected revenue forecast
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Average Deal Size */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              padding: '24px',
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Avg Deal Size
              </Typography>
              <Briefcase size={20} color="#f59e0b" />
            </Box>
            <Typography sx={{ fontSize: '32px', fontWeight: 700, color: 'text.primary', marginBottom: '8px' }}>
              {formatCurrency(metrics.averageDealSize)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Typography sx={{ fontSize: '14px', color: 'text.secondary', fontWeight: 500 }}>
                Win rate: {formatPercentage(metrics.winRate)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* At Risk Opportunities */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              padding: '24px',
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '12px',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                At Risk
              </Typography>
              <AlertCircle size={20} color="#ef4444" />
            </Box>
            <Typography sx={{ fontSize: '32px', fontWeight: 700, color: 'text.primary', marginBottom: '8px' }}>
              {metrics.atRiskOpportunities}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {metrics.atRiskOpportunities > 0 ? (
                <>
                  <TrendingDown size={16} color="#ef4444" />
                  <Typography sx={{ fontSize: '14px', color: '#ef4444', fontWeight: 500 }}>
                    Needs attention
                  </Typography>
                </>
              ) : (
                <Typography sx={{ fontSize: '14px', color: '#10b981', fontWeight: 500 }}>
                  All opportunities healthy
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Pipeline Distribution */}
      <Paper
        sx={{
          padding: '32px',
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '12px',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        }}
      >
        <Typography sx={{ fontSize: '20px', fontWeight: 700, color: 'text.primary', marginBottom: '24px' }}>
          Pipeline Distribution by Stage
        </Typography>

        <Grid container spacing={3}>
          {stageDistribution.map((stage, index) => (
            <Grid item xs={12} sm={6} md={3} key={stage.stage}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.primary' }}>
                    {stage.stage}
                  </Typography>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'text.secondary' }}>
                    {stage.count}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: '8px',
                    backgroundColor: 'action.hover',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${stage.percentage}%`,
                      backgroundColor: index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : index === 2 ? '#f59e0b' : '#8b5cf6',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                  {formatCurrency(stage.value)} ({formatPercentage(stage.percentage)})
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default OpportunitiesDashboard;
