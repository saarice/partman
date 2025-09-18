import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useNavigationStore } from '../../stores/navigationStore';

export const NavigationTest: React.FC = () => {
  const { expandedSections, sidebarCollapsed, toggleSection, setSidebarCollapsed } = useNavigationStore();

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Navigation State Test
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Expanded Sections: {expandedSections.join(', ') || 'None'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sidebar Collapsed: {sidebarCollapsed ? 'Yes' : 'No'}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          onClick={() => toggleSection('dashboards')}
        >
          Toggle Dashboards
        </Button>
        <Button
          variant="outlined"
          onClick={() => toggleSection('management')}
        >
          Toggle Management
        </Button>
        <Button
          variant="outlined"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          Toggle Sidebar
        </Button>
      </Box>

      <Typography variant="caption" display="block" sx={{ mt: 2 }}>
        Changes should persist after page refresh
      </Typography>
    </Paper>
  );
};