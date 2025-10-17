import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const OpportunitiesDashboard: React.FC = () => {
  return (
    <Box sx={{ padding: '32px' }}>
      <Typography variant="h4" sx={{ marginBottom: '24px', fontWeight: 700 }}>
        Opportunities Dashboard
      </Typography>
      <Paper sx={{ padding: '48px', textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary" sx={{ marginBottom: '16px' }}>
          🚀 Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Opportunities-focused dashboard with pipeline metrics, conversion rates, and forecasting.
        </Typography>
      </Paper>
    </Box>
  );
};

export default OpportunitiesDashboard;
