import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Business, Warning } from '@mui/icons-material';

interface PartnerPerformance {
  partnerId: string;
  partnerName: string;
  revenue: number;
  opportunityCount: number;
  healthScore: number;
  lastInteraction: Date;
}

interface PartnerData {
  totalPartners: number;
  activePartners: number;
  healthDistribution: Record<string, number>;
  topPerformingPartners: PartnerPerformance[];
  relationshipMaintenanceAlerts: number;
}

interface PartnerHealthProps {
  data?: PartnerData;
}

const PartnerHealth: React.FC<PartnerHealthProps> = ({ data }) => {
  if (!data) return null;

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#4caf50';
      case 'healthy': return '#8bc34a';
      case 'needs_attention': return '#ff9800';
      case 'at_risk': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getHealthLabel = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excellent';
      case 'healthy': return 'Healthy';
      case 'needs_attention': return 'Needs Attention';
      case 'at_risk': return 'At Risk';
      default: return status;
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Business color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Partner Health</Typography>
        </Box>
        
        <Typography variant="h4" color="primary" gutterBottom>
          {data.activePartners}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          of {data.totalPartners} total partners
        </Typography>
        
        {data.relationshipMaintenanceAlerts > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2 }}>
            <Warning color="warning" sx={{ mr: 1 }} />
            <Typography variant="body2" color="warning.main">
              {data.relationshipMaintenanceAlerts} maintenance alerts
            </Typography>
          </Box>
        )}
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Health Distribution
          </Typography>
          {Object.entries(data.healthDistribution).map(([status, count]) => (
            <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Chip
                label={getHealthLabel(status)}
                size="small"
                sx={{ 
                  bgcolor: getHealthColor(status), 
                  color: 'white',
                  minWidth: 100
                }}
              />
              <Typography variant="body2">{count}</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PartnerHealth;