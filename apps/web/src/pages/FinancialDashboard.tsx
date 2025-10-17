import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const FinancialDashboard: React.FC = () => {
  return (
    <Box sx={{ padding: '32px' }}>
      <Typography variant="h4" sx={{ marginBottom: '24px', fontWeight: 700 }}>
        Financial Dashboard
      </Typography>
      <Paper sx={{ padding: '48px', textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary" sx={{ marginBottom: '16px' }}>
          💰 Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Financial dashboard with revenue tracking, commission payments, and profitability analysis.
        </Typography>
      </Paper>
    </Box>
  );
};

export default FinancialDashboard;
