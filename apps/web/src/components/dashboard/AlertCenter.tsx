import React from 'react';
import { Card, CardContent, Typography, Box, Alert, Chip } from '@mui/material';
import { Notifications, Warning, Error, Info } from '@mui/icons-material';

interface AlertSummary {
  type: string;
  priority: string;
  count: number;
  mostRecentDate: Date;
}

interface AlertCenterProps {
  alerts: AlertSummary[];
}

const AlertCenter: React.FC<AlertCenterProps> = ({ alerts }) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Error color="error" />;
      case 'high': return <Warning color="warning" />;
      case 'medium': return <Info color="info" />;
      default: return <Info color="action" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'default';
    }
  };

  const formatAlertType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Notifications color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Alert Center</Typography>
          </Box>
          <Alert severity="success">
            No active alerts - all systems running smoothly!
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Notifications color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Alert Center</Typography>
          <Chip
            label={alerts.reduce((sum, alert) => sum + alert.count, 0)}
            size="small"
            color="error"
            sx={{ ml: 1 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {alerts.map((alert, index) => (
            <Alert
              key={index}
              severity={getPriorityColor(alert.priority) as any}
              icon={getPriorityIcon(alert.priority)}
              sx={{ flex: '1 1 300px', minWidth: 250 }}
            >
              <Typography variant="subtitle2" gutterBottom>
                {alert.count} {formatAlertType(alert.type)} {alert.count === 1 ? 'Alert' : 'Alerts'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Most recent: {new Date(alert.mostRecentDate).toLocaleDateString()}
              </Typography>
            </Alert>
          ))}
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Review and acknowledge alerts to maintain optimal performance
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AlertCenter;