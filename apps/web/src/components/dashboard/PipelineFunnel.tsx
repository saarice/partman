import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Timeline } from '@mui/icons-material';

interface PipelineData {
  totalWeightedValue: number;
  totalOpportunities: number;
  conversionRateByStage: Record<string, number>;
  averageDealSize: number;
  averageSalesCycle: number;
  stageDistribution: Record<string, { count: number; value: number }>;
}

interface PipelineFunnelProps {
  data?: PipelineData;
}

const PipelineFunnel: React.FC<PipelineFunnelProps> = ({ data }) => {
  if (!data) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const stages = [
    { key: 'lead', name: 'Lead', color: '#e3f2fd' },
    { key: 'demo', name: 'Demo', color: '#fff3e0' },
    { key: 'poc', name: 'POC', color: '#f3e5f5' },
    { key: 'proposal', name: 'Proposal', color: '#e8f5e8' }
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Timeline color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Pipeline Health</Typography>
        </Box>
        
        <Typography variant="h4" color="primary" gutterBottom>
          {data.totalOpportunities}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Active opportunities
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          {formatCurrency(data.totalWeightedValue)} weighted value
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          {stages.map((stage) => {
            const stageData = data.stageDistribution[stage.key];
            if (!stageData) return null;
            
            return (
              <Box key={stage.key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Chip
                  label={stage.name}
                  size="small"
                  sx={{ bgcolor: stage.color, minWidth: 60 }}
                />
                <Typography variant="body2">
                  {stageData.count}
                </Typography>
              </Box>
            );
          })}
        </Box>
        
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Avg Cycle: {data.averageSalesCycle} days
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PipelineFunnel;