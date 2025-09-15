import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import { AttachMoney } from '@mui/icons-material';

interface RevenueData {
  currentQuarterTarget: number;
  currentQuarterActual: number;
  currentQuarterProgress: number;
  previousQuarterActual: number;
  yearToDateActual: number;
  forecastedQuarterEnd: number;
}

interface RevenueCardProps {
  data?: RevenueData;
}

const RevenueCard: React.FC<RevenueCardProps> = ({ data }) => {
  if (!data) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AttachMoney color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Revenue Progress</Typography>
        </Box>
        
        <Typography variant="h4" color="primary" gutterBottom>
          {formatCurrency(data.currentQuarterActual)}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          of {formatCurrency(data.currentQuarterTarget)} target
        </Typography>
        
        <LinearProgress 
          variant="determinate" 
          value={data.currentQuarterProgress} 
          sx={{ mb: 2, height: 8, borderRadius: 4 }}
        />
        
        <Typography variant="body2" color="text.secondary">
          {data.currentQuarterProgress}% complete
        </Typography>
        
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Forecast: {formatCurrency(data.forecastedQuarterEnd)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueCard;