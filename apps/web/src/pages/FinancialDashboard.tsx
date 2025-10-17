import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { DollarSign, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { getMockRevenue, getMockDeals } from '../services/mockFinancialData';
import { formatLargeNumber } from '../utils/opportunityCalculations';
import type { RevenueData, Deal } from '../types/financial';
import KPICard from '../components/dashboard/KPICard';

const FinancialDashboard: React.FC = () => {
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        setRevenue(getMockRevenue());
        setDeals(getMockDeals());
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const metrics = useMemo(() => {
    const total = revenue.reduce((sum, r) => sum + r.amount, 0);
    const avgGrowth = revenue.length > 0 ? revenue.reduce((sum, r) => sum + r.growth, 0) / revenue.length : 0;
    const target = 8000000;
    const avgDeal = deals.length > 0 ? deals.reduce((sum, d) => sum + d.amount, 0) / deals.length : 0;
    return { totalRevenue: total, averageDealSize: avgDeal, revenueGrowth: avgGrowth, targetRevenue: target, achievementRate: (total / target) * 100 };
  }, [revenue, deals]);

  const categoryRevenue = useMemo(() => {
    const map = new Map<string, number>();
    deals.forEach(d => map.set(d.category, (map.get(d.category) || 0) + d.amount));
    const total = deals.reduce((sum, d) => sum + d.amount, 0);
    const colors: Record<string, string> = { 'Technology': '#667eea', 'Security': '#f59e0b', 'Data Analytics': '#10b981', 'FinOps': '#8b5cf6', 'DevOps': '#ec4899' };
    return Array.from(map.entries()).map(([category, amount]) => ({
      category, amount, percentage: (amount / total) * 100, color: colors[category] || '#6b7280'
    })).sort((a, b) => b.amount - a.amount);
  }, [deals]);

  const kpiData = [
    { title: 'Total Revenue (YTD)', value: formatLargeNumber(metrics.totalRevenue, 'USD'), change: `${metrics.revenueGrowth.toFixed(1)}% avg growth`, changeType: metrics.revenueGrowth >= 0 ? 'positive' as const : 'negative' as const, icon: <DollarSign size={24} />, iconColor: '#10b981' },
    { title: 'Average Deal Size', value: formatLargeNumber(metrics.averageDealSize, 'USD'), change: `${deals.length} deals closed`, changeType: 'neutral' as const, icon: <BarChart3 size={24} />, iconColor: '#667eea' },
    { title: 'Target Achievement', value: `${metrics.achievementRate.toFixed(1)}%`, change: `Target: ${formatLargeNumber(metrics.targetRevenue, 'USD')}`, changeType: metrics.achievementRate >= 75 ? 'positive' as const : 'negative' as const, icon: <Target size={24} />, iconColor: '#f59e0b' },
    { title: 'Annual Run Rate', value: formatLargeNumber((metrics.totalRevenue / 10) * 12, 'USD'), change: 'Based on current pace', changeType: 'neutral' as const, icon: <TrendingUp size={24} />, iconColor: '#8b5cf6' }
  ];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h1" sx={{ fontSize: '30px', fontWeight: 700, marginBottom: 1 }}>Financial Dashboard</Typography>
        <Typography sx={{ fontSize: '16px', color: 'text.secondary' }}>Revenue analytics and financial performance metrics</Typography>
      </Box>

      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        {kpiData.map((kpi, i) => <Grid item xs={12} sm={6} md={3} key={i}><KPICard {...kpi} /></Grid>)}
      </Grid>

      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 3, borderRadius: '12px' }}>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, marginBottom: 3 }}>Monthly Revenue Trend (2025)</Typography>
            {revenue.map((r) => (
              <Box key={r.period} sx={{ marginBottom: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>{r.period}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>{formatLargeNumber(r.amount, 'USD')}</Typography>
                    <Typography sx={{ fontSize: '12px', color: r.growth >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                      {r.growth >= 0 ? '+' : ''}{r.growth.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ height: '6px', backgroundColor: 'action.hover', borderRadius: '3px', overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${(r.amount / 900000) * 100}%`, backgroundColor: '#10b981', transition: 'width 0.3s ease' }} />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ padding: 3, borderRadius: '12px' }}>
            <Typography sx={{ fontSize: '18px', fontWeight: 700, marginBottom: 3 }}>Revenue by Category</Typography>
            {categoryRevenue.map((cat) => (
              <Box key={cat.category} sx={{ marginBottom: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '12px', height: '12px', backgroundColor: cat.color, borderRadius: '2px' }} />
                    <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>{cat.category}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>{formatLargeNumber(cat.amount, 'USD')} ({cat.percentage.toFixed(0)}%)</Typography>
                </Box>
                <Box sx={{ height: '8px', backgroundColor: 'action.hover', borderRadius: '4px', overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${cat.percentage}%`, backgroundColor: cat.color, transition: 'width 0.3s ease' }} />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialDashboard;
