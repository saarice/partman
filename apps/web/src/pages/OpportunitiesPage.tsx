import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import OpportunityPortfolioManagement from '../components/opportunities/OpportunityPortfolioManagement';

const OpportunitiesPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <Box>
      <Box sx={{ p: 3 }}>
        <Typography variant="h3" gutterBottom>
          Opportunity Management
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Comprehensive opportunity portfolio and pipeline management
        </Typography>

        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="Opportunity Portfolio" />
          <Tab label="Pipeline Analytics" />
        </Tabs>

        {selectedTab === 0 && <OpportunityPortfolioManagement />}
        {selectedTab === 1 && (
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" color="text.secondary">
              Pipeline Analytics Coming Soon
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default OpportunitiesPage;
