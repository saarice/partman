import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const PartnershipsDashboard: React.FC = () => {
  return (
    <Box sx={{ padding: '32px' }}>
      <Typography variant="h4" sx={{ marginBottom: '24px', fontWeight: 700 }}>
        Partnerships Dashboard
      </Typography>
      <Paper sx={{ padding: '48px', textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary" sx={{ marginBottom: '16px' }}>
          🤝 Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Partnership-focused dashboard with relationship health, engagement metrics, and partner performance.
        </Typography>
      </Paper>
    </Box>
  );
};

export default PartnershipsDashboard;
