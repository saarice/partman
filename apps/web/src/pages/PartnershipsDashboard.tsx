import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { Users, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { getMockPartners, getPreviousQuarterMetrics } from '../services/mockPartnerData';
import { calculatePartnerMetrics, getAtRiskPartners, formatHealthScore, getHealthColor } from '../utils/partnerCalculations';
import { formatLargeNumber } from '../utils/opportunityCalculations';
import type { Partner, PartnerMetrics } from '../types/partner';
import KPICard from '../components/dashboard/KPICard';

const PartnershipsDashboard: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        setPartners(getMockPartners());
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const metrics: PartnerMetrics = useMemo(() =>
    calculatePartnerMetrics(partners, getPreviousQuarterMetrics()),
    [partners]
  );

  const kpiData = [
    { title: 'Total Partners', value: metrics.totalPartners, change: `${metrics.excellentCount} excellent`, changeType: 'positive' as const, icon: <Users size={24} />, iconColor: '#667eea' },
    { title: 'Average Health Score', value: `${metrics.averageHealth.toFixed(0)}%`, change: `${metrics.healthyCount + metrics.excellentCount} healthy+`, changeType: 'positive' as const, icon: <TrendingUp size={24} />, iconColor: '#10b981' },
    { title: 'At-Risk Partners', value: metrics.atRiskCount, change: `${metrics.criticalCount} critical`, changeType: metrics.atRiskCount > 0 ? 'negative' as const : 'positive' as const, icon: <AlertTriangle size={24} />, iconColor: '#ef4444' },
    { title: 'Quarterly Revenue', value: formatLargeNumber(metrics.totalRevenue, 'USD'), change: `Avg: ${formatLargeNumber(metrics.averageRevenue, 'USD')}`, changeType: 'neutral' as const, icon: <DollarSign size={24} />, iconColor: '#f59e0b' }
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h1" sx={{ fontSize: '30px', fontWeight: 700, marginBottom: 1 }}>Partnerships Dashboard</Typography>
        <Typography sx={{ fontSize: '16px', color: 'text.secondary' }}>Partner portfolio health and relationship analytics</Typography>
      </Box>

      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        {kpiData.map((kpi, i) => <Grid item xs={12} sm={6} md={3} key={i}><KPICard {...kpi} /></Grid>)}
      </Grid>

      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 3, borderRadius: '12px' }}>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, marginBottom: 3 }}>Partner Health Distribution</Typography>
            {[
              { label: 'Excellent (90-100)', count: metrics.excellentCount, color: '#10b981' },
              { label: 'Healthy (70-89)', count: metrics.healthyCount, color: '#3b82f6' },
              { label: 'At-Risk (50-69)', count: metrics.atRiskCount - metrics.criticalCount, color: '#f59e0b' },
              { label: 'Critical (<50)', count: metrics.criticalCount, color: '#ef4444' }
            ].map((item) => (
              <Box key={item.label} sx={{ marginBottom: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>{item.count}</Typography>
                </Box>
                <Box sx={{ height: '8px', backgroundColor: 'action.hover', borderRadius: '4px', overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${(item.count / metrics.totalPartners) * 100}%`, backgroundColor: item.color, transition: 'width 0.3s ease' }} />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 3, borderRadius: '12px' }}>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, marginBottom: 3 }}>Revenue by Tier</Typography>
            {metrics.tierDistribution.map((tier) => (
              <Box key={tier.tier} sx={{ marginBottom: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>{tier.tier} ({tier.count})</Typography>
                  <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>{formatLargeNumber(tier.revenue, 'USD')}</Typography>
                </Box>
                <Box sx={{ height: '8px', backgroundColor: 'action.hover', borderRadius: '4px', overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${(tier.revenue / metrics.totalRevenue) * 100}%`, backgroundColor: tier.tier === 'Tier 1' ? '#8b5cf6' : tier.tier === 'Tier 2' ? '#3b82f6' : '#6b7280', transition: 'width 0.3s ease' }} />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ padding: 3, borderRadius: '12px' }}>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, marginBottom: 3 }}>Top Partners by Quarterly Revenue</Typography>
            <Grid container spacing={2}>
              {[...partners].sort((a, b) => b.quarterlyRevenue - a.quarterlyRevenue).slice(0, 5).map((p, i) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={p.id}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '12px', color: 'text.secondary', marginBottom: 1 }}>#{i + 1}</Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700, marginBottom: 0.5 }}>{p.name}</Typography>
                    <Typography sx={{ fontSize: '18px', fontWeight: 700, color: 'primary.main', marginBottom: 0.5 }}>{formatLargeNumber(p.quarterlyRevenue, 'USD')}</Typography>
                    <Box sx={{ display: 'inline-block', padding: '4px 8px', borderRadius: '4px', backgroundColor: getHealthColor(p.healthScore) + '20', color: getHealthColor(p.healthScore) }}>
                      <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>{formatHealthScore(p.healthScore)}</Typography>
                    </Box>
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

export default PartnershipsDashboard;
