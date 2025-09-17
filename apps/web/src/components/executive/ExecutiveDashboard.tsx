import React from 'react';
import { Box, Grid, useTheme } from '@mui/material';
import {
  TrendingUp,
  People as Users,
  AttachMoney as DollarSign,
  TrackChanges as Target,
  EmojiEvents as Award,
  CalendarToday as Calendar
} from '@mui/icons-material';
import { Card, Typography, Badge } from '../ui';
import { DESIGN_TOKENS } from '../../theme/designTokens';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'info';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  color
}) => {
  return (
    <Card variant="executive" hover>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box
          sx={{
            p: 2,
            borderRadius: DESIGN_TOKENS.borderRadius.lg,
            backgroundColor: DESIGN_TOKENS.colors[color === 'primary' ? 'primary' : color === 'success' ? 'secondary' : color === 'warning' ? 'accent' : 'primary'][50],
            color: DESIGN_TOKENS.colors[color === 'primary' ? 'primary' : color === 'success' ? 'secondary' : color === 'warning' ? 'accent' : 'primary'][600]
          }}
        >
          {icon}
        </Box>
        <Badge
          variant="soft"
          color={changeType === 'positive' ? 'success' : changeType === 'negative' ? 'error' : 'executive'}
          size="sm"
        >
          {change}
        </Badge>
      </Box>

      <Typography variant="small" color="muted" weight="medium">
        {title}
      </Typography>

      <Typography variant="title" weight="bold" color="executive">
        {value}
      </Typography>
    </Card>
  );
};

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  description,
  icon,
  onClick
}) => {
  return (
    <Card variant="outlined" interactive onClick={onClick}>
      <Box display="flex" alignItems="center" gap={3}>
        <Box
          sx={{
            p: 2,
            borderRadius: DESIGN_TOKENS.borderRadius.md,
            backgroundColor: DESIGN_TOKENS.colors.executive[100],
            color: DESIGN_TOKENS.colors.executive[600]
          }}
        >
          {icon}
        </Box>
        <Box flex={1}>
          <Typography variant="heading" weight="semibold">
            {title}
          </Typography>
          <Typography variant="caption" color="muted">
            {description}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

const ExecutiveDashboard: React.FC = () => {
  const mockMetrics = [
    {
      title: 'Total Revenue',
      value: '$2.4M',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: <DollarSign size={24} />,
      color: 'success' as const
    },
    {
      title: 'Active Partners',
      value: '24',
      change: '+3',
      changeType: 'positive' as const,
      icon: <Users size={24} />,
      color: 'primary' as const
    },
    {
      title: 'Pipeline Value',
      value: '$8.7M',
      change: '+18.2%',
      changeType: 'positive' as const,
      icon: <TrendingUp size={24} />,
      color: 'info' as const
    },
    {
      title: 'Goal Progress',
      value: '87%',
      change: '+5%',
      changeType: 'positive' as const,
      icon: <Target size={24} />,
      color: 'warning' as const
    }
  ];

  const quickActions = [
    {
      title: 'New Partnership',
      description: 'Create a new partnership agreement',
      icon: <Users size={20} />,
      onClick: () => console.log('New partnership')
    },
    {
      title: 'Review Opportunities',
      description: 'Review pending opportunities',
      icon: <TrendingUp size={20} />,
      onClick: () => console.log('Review opportunities')
    },
    {
      title: 'Commission Review',
      description: 'Approve pending commissions',
      icon: <Award size={20} />,
      onClick: () => console.log('Commission review')
    },
    {
      title: 'Schedule Meeting',
      description: 'Schedule partner meetings',
      icon: <Calendar size={20} />,
      onClick: () => console.log('Schedule meeting')
    }
  ];

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="display" gradient weight="extrabold">
          Executive Dashboard
        </Typography>
        <Typography variant="subtitle" color="muted" weight="normal">
          Strategic overview and key performance indicators
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Box mb={6}>
        <Typography variant="title" weight="semibold" sx={{ mb: 3 }}>
          Key Performance Indicators
        </Typography>
        <Grid container spacing={3}>
          {mockMetrics.map((metric, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <MetricCard {...metric} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Quick Actions */}
      <Box mb={6}>
        <Typography variant="title" weight="semibold" sx={{ mb: 3 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <QuickAction {...action} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Recent Activity Panel */}
      <Box>
        <Typography variant="title" weight="semibold" sx={{ mb: 3 }}>
          Recent Activity
        </Typography>
        <Card variant="executive" padding="lg">
          <Box display="flex" alignItems="center" justifyContent="center" py={6}>
            <Typography variant="body" color="muted">
              Recent activity feed would be displayed here with real-time updates
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default ExecutiveDashboard;