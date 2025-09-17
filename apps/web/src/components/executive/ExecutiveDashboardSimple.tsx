import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Paper
} from '@mui/material';
import {
  TrendingUp,
  People as Users,
  AttachMoney as DollarSign,
  TrackChanges as Target,
  EmojiEvents as Award,
  CalendarToday as Calendar
} from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
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
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-4px)',
          transition: 'all 0.2s ease-in-out',
          boxShadow: 3
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${color} 0%, ${color}aa 100%)`,
          borderRadius: '4px 4px 0 0'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: `${color}15`,
              color: color,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {icon}
          </Box>
          <Chip
            label={change}
            size="small"
            color={changeType === 'positive' ? 'success' : changeType === 'negative' ? 'error' : 'default'}
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>

        <Typography variant="h4" component="div" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
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
    <Card
      sx={{
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out',
          boxShadow: 2
        }
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              backgroundColor: 'grey.100',
              color: 'grey.700'
            }}
          >
            {icon}
          </Box>
          <Box flex={1}>
            <Typography variant="h6" fontWeight="600">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const ExecutiveDashboardSimple: React.FC = () => {
  const mockMetrics = [
    {
      title: 'Total Revenue',
      value: '$2.4M',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: <DollarSign />,
      color: '#22c55e'
    },
    {
      title: 'Active Partners',
      value: '24',
      change: '+3',
      changeType: 'positive' as const,
      icon: <Users />,
      color: '#3b82f6'
    },
    {
      title: 'Pipeline Value',
      value: '$8.7M',
      change: '+18.2%',
      changeType: 'positive' as const,
      icon: <TrendingUp />,
      color: '#06b6d4'
    },
    {
      title: 'Goal Progress',
      value: '87%',
      change: '+5%',
      changeType: 'positive' as const,
      icon: <Target />,
      color: '#f59e0b'
    }
  ];

  const quickActions = [
    {
      title: 'New Partnership',
      description: 'Create a new partnership agreement',
      icon: <Users />,
      onClick: () => console.log('New partnership')
    },
    {
      title: 'Review Opportunities',
      description: 'Review pending opportunities',
      icon: <TrendingUp />,
      onClick: () => console.log('Review opportunities')
    },
    {
      title: 'Commission Review',
      description: 'Approve pending commissions',
      icon: <Award />,
      onClick: () => console.log('Commission review')
    },
    {
      title: 'Schedule Meeting',
      description: 'Schedule partner meetings',
      icon: <Calendar />,
      onClick: () => console.log('Schedule meeting')
    }
  ];

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography
          variant="h3"
          component="h1"
          fontWeight="800"
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: 1
          }}
        >
          Executive Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Strategic overview and key performance indicators
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Box mb={6}>
        <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
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
        <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
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
        <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
          Recent Activity
        </Typography>
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: 'grey.50',
            border: '2px dashed',
            borderColor: 'grey.300'
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Recent activity feed would be displayed here with real-time updates
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default ExecutiveDashboardSimple;