import React, { useState, useMemo } from 'react';
import { Box, Typography, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, TableSortLabel } from '@mui/material';
import {
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Warning as WarningIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import KPICard from '../components/dashboard/KPICard';

type SortColumn = 'partner' | 'activity' | 'date' | 'impact' | 'status';
type SortDirection = 'asc' | 'desc';

/**
 * Overall Dashboard - Pixel-perfect match to static HTML index.html
 * Source: apps/web/index.html
 */
const Dashboard: React.FC = () => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  // KPI data matching static HTML
  const kpiData = [
    {
      title: 'Total Partners',
      value: 247,
      change: '+12.3% from last month',
      changeType: 'positive' as const,
      link: '/management/partnerships',
      linkText: 'View partners',
      icon: <PeopleIcon />,
      iconColor: '#667eea', // --color-primary-500
    },
    {
      title: 'Quarterly Revenue',
      value: '$2.4M',
      change: '+18.7% from Q2',
      changeType: 'positive' as const,
      link: '/dashboards/financial',
      linkText: 'View report',
      icon: <MoneyIcon />,
      iconColor: '#22c55e', // --color-success-500
    },
    {
      title: 'Active Opportunities',
      value: 89,
      change: '+5.2% from last week',
      changeType: 'positive' as const,
      link: '/management/opportunities',
      linkText: 'View opportunities',
      icon: <BusinessIcon />,
      iconColor: '#f59e0b', // --color-warning-500
    },
    {
      title: 'At-Risk Partners',
      value: 12,
      change: '+2 from last month',
      changeType: 'negative' as const,
      link: '/management/partnerships',
      linkText: 'View details',
      icon: <WarningIcon />,
      iconColor: '#ef4444', // --color-error-500
    },
  ];

  // Activity data matching static HTML
  const activityData = [
    {
      partner: 'CloudTech Solutions',
      tier: 'Enterprise',
      activity: 'Contract renewal completed',
      date: '2 hours ago',
      dateValue: 2, // for sorting
      impact: '+$250K',
      impactType: 'high' as const,
      status: 'Active',
      statusType: 'success' as const,
    },
    {
      partner: 'SecureData Inc',
      tier: 'Premium',
      activity: 'New opportunity created',
      date: '5 hours ago',
      dateValue: 5, // for sorting
      impact: '+$75K',
      impactType: 'medium' as const,
      status: 'In Progress',
      statusType: 'warning' as const,
    },
    {
      partner: 'DevOps Pro',
      tier: 'Standard',
      activity: 'Health score updated',
      date: '1 day ago',
      dateValue: 24, // for sorting
      impact: 'Monitor',
      impactType: 'neutral' as const,
      status: 'Review',
      statusType: 'info' as const,
    },
    {
      partner: 'Analytics Plus',
      tier: 'Premium',
      activity: 'Commission payment processed',
      date: '2 days ago',
      dateValue: 48, // for sorting
      impact: '$45K',
      impactType: 'high' as const,
      status: 'Completed',
      statusType: 'success' as const,
    },
    {
      partner: 'Monitor Masters',
      tier: 'Enterprise',
      activity: 'Risk assessment flagged',
      date: '3 days ago',
      dateValue: 72, // for sorting
      impact: 'At Risk',
      impactType: 'risk' as const,
      status: 'Action Required',
      statusType: 'error' as const,
    },
  ];

  // Sort handler
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if clicking same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sorted data using useMemo for performance
  const sortedActivityData = useMemo(() => {
    const sorted = [...activityData].sort((a, b) => {
      let comparison = 0;

      switch (sortColumn) {
        case 'partner':
          comparison = a.partner.localeCompare(b.partner);
          break;
        case 'activity':
          comparison = a.activity.localeCompare(b.activity);
          break;
        case 'date':
          comparison = a.dateValue - b.dateValue;
          break;
        case 'impact':
          comparison = a.impact.localeCompare(b.impact);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [activityData, sortColumn, sortDirection]);

  return (
    <Box
      sx={{
        flex: 1,
        padding: '32px', // --spacing-8
        backgroundColor: 'background.default',
      }}
    >
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
        <Typography
          sx={{
            color: 'text.primary',
            fontWeight: 500,
            fontSize: '14px',
          }}
        >
          Overall Dashboard
        </Typography>
      </Box>

      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
        }}
      >
        <Box>
          <Typography
            variant="h1"
            sx={{
              fontSize: '30px', // --font-size-3xl
              fontWeight: 700,
              color: 'text.primary',
              margin: '0 0 8px 0',
            }}
          >
            Overall Dashboard
          </Typography>
          <Typography
            sx={{
              fontSize: '16px',
              color: 'text.secondary',
              margin: 0,
            }}
          >
            Executive KPIs and cross-functional metrics overview
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<BarChartIcon sx={{ width: '16px', height: '16px' }} />}
          onClick={(e) => {
            e.preventDefault();
            console.log('Generate Report clicked');
            // TODO: Implement report generation
          }}
          sx={{
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            textTransform: 'none',
            padding: '8px 16px',
            gap: '8px',
          }}
        >
          Generate Report
        </Button>
      </Box>

      {/* KPI Cards Grid */}
      <Grid
        container
        spacing={3} // 24px gap
        sx={{ marginBottom: '32px' }}
      >
        {kpiData.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={6} lg={3} key={index}>
            <KPICard {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
        {/* Revenue Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Box>
                <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>Revenue Distribution by Category</Typography>
                <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>Quarterly breakdown across business segments</Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Export clicked');
                  // TODO: Implement export functionality
                }}
                sx={{ fontSize: '12px' }}
              >
                Export
              </Button>
            </Box>

            {/* Legend */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', fontSize: '12px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Box sx={{ width: '12px', height: '12px', backgroundColor: '#667eea', borderRadius: '2px' }} />
                <span>FinOps <strong>$890K</strong></span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Box sx={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '2px' }} />
                <span>Security <strong>$640K</strong></span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Box sx={{ width: '12px', height: '12px', backgroundColor: '#06b6d4', borderRadius: '2px' }} />
                <span>DevOps <strong>$520K</strong></span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Box sx={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }} />
                <span>Data Analytics <strong>$380K</strong></span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Box sx={{ width: '12px', height: '12px', backgroundColor: '#8b5cf6', borderRadius: '2px' }} />
                <span>Observability <strong>$290K</strong></span>
              </Box>
            </Box>

            {/* Stacked bar chart */}
            <Box sx={{ height: '180px' }}>
              {[
                { label: 'Q3 2024', total: '$2.72M', bars: [{ width: '33%', color: '#667eea' }, { width: '23%', color: '#f59e0b' }, { width: '19%', color: '#06b6d4' }, { width: '14%', color: '#10b981' }] },
                { label: 'Q2 2024', total: '$2.31M', bars: [{ width: '30%', color: '#667eea' }, { width: '25%', color: '#f59e0b' }, { width: '20%', color: '#06b6d4' }, { width: '15%', color: '#10b981' }] },
                { label: 'Q1 2024', total: '$1.97M', bars: [{ width: '28%', color: '#667eea' }, { width: '27%', color: '#f59e0b' }, { width: '23%', color: '#06b6d4' }, { width: '15%', color: '#10b981' }] },
              ].map((quarter, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <Typography sx={{ width: '80px', fontSize: '14px', color: 'text.secondary' }}>{quarter.label}</Typography>
                  <Box sx={{ flex: 1, height: '32px', display: 'flex', borderRadius: '4px', overflow: 'hidden' }}>
                    {quarter.bars.map((bar, barIdx) => (
                      <Box key={barIdx} sx={{ width: bar.width, backgroundColor: bar.color, height: '100%' }} />
                    ))}
                  </Box>
                  <Typography sx={{ width: '80px', textAlign: 'right', fontSize: '14px', fontWeight: 600 }}>{quarter.total}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Partnership Performance Chart */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            }}
          >
            <Typography sx={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>Partnership Performance Trends</Typography>
            <Typography sx={{ fontSize: '14px', color: 'text.secondary', marginBottom: '24px' }}>Monthly growth and health metrics</Typography>

            {/* Metric cards */}
            <Grid container spacing={2} sx={{ marginBottom: '24px' }}>
              {[
                { label: 'Growth Rate', value: '24.7%', change: '+4.2%' },
                { label: 'Health Score', value: '94.2%', change: '+2.1%' },
                { label: 'Retention', value: '87.5%', change: '+1.8%' },
                { label: 'Avg Deal Size', value: '$42K', change: '+12%' },
              ].map((metric, idx) => (
                <Grid item xs={3} key={idx}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700, color: 'text.primary' }}>{metric.value}</Typography>
                    <Typography sx={{ fontSize: '10px', color: 'text.secondary', textTransform: 'uppercase', marginTop: '4px' }}>{metric.label}</Typography>
                    <Typography sx={{ fontSize: '11px', color: 'success.main', marginTop: '2px' }}>{metric.change}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Line chart */}
            <Box sx={{ height: '140px', position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
                <polyline
                  points="0,100 66,88 133,72 200,58 266,44 333,28 400,16"
                  fill="none"
                  stroke="#667eea"
                  strokeWidth="2"
                />
                {[0, 66, 133, 200, 266, 333, 400].map((x, idx) => (
                  <circle key={idx} cx={x} cy={[100, 88, 72, 58, 44, 28, 16][idx]} r="3" fill="#667eea" />
                ))}
              </svg>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'text.secondary' }}>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => (
                  <span key={idx}>{month}</span>
                ))}
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Recent Activity Table */}
      <Box
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '20px', fontWeight: 600 }}>Recent Partnership Activity</Typography>
            <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>Latest updates and changes across your partnership portfolio</Typography>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>
                  <TableSortLabel
                    active={sortColumn === 'partner'}
                    direction={sortColumn === 'partner' ? sortDirection : 'asc'}
                    onClick={() => handleSort('partner')}
                  >
                    Partner
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>
                  <TableSortLabel
                    active={sortColumn === 'activity'}
                    direction={sortColumn === 'activity' ? sortDirection : 'asc'}
                    onClick={() => handleSort('activity')}
                  >
                    Activity
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>
                  <TableSortLabel
                    active={sortColumn === 'date'}
                    direction={sortColumn === 'date' ? sortDirection : 'asc'}
                    onClick={() => handleSort('date')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>
                  <TableSortLabel
                    active={sortColumn === 'impact'}
                    direction={sortColumn === 'impact' ? sortDirection : 'asc'}
                    onClick={() => handleSort('impact')}
                  >
                    Impact
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>
                  <TableSortLabel
                    active={sortColumn === 'status'}
                    direction={sortColumn === 'status' ? sortDirection : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedActivityData.map((row, index) => (
                <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'background.default' } }}>
                  <TableCell>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>{row.partner}</Typography>
                      <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>{row.tier}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: '14px' }}>{row.activity}</TableCell>
                  <TableCell sx={{ fontSize: '14px', color: 'text.secondary' }}>{row.date}</TableCell>
                  <TableCell>
                    <Chip label={row.impact} size="small" sx={{ fontSize: '12px' }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={row.status} size="small" color={row.statusType} sx={{ fontSize: '12px' }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Dashboard;
