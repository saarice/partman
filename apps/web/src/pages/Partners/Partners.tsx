import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import TopNavigation from '../../components/common/TopNavigation';
import PartnerPortfolioManagement from '../../components/partners/PartnerPortfolioManagement';
import RelationshipHealthTracking from '../../components/partners/RelationshipHealthTracking';

const Partners = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <Box>
      <TopNavigation
        title="Partner Management"
        currentPage="partners"
      />
      <Box sx={{ p: 3 }}>
        <Typography variant="h3" gutterBottom>
          Partner Management
        </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Comprehensive partner portfolio and relationship management
      </Typography>

      <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Partner Portfolio" />
        <Tab label="Relationship Health" />
      </Tabs>

      {selectedTab === 0 && <PartnerPortfolioManagement />}
      {selectedTab === 1 && <RelationshipHealthTracking />}
      </Box>
    </Box>
  );
};

export default Partners;