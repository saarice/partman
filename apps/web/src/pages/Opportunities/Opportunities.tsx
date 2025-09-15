import { Box } from '@mui/material';
import OpportunityLifecycleManagement from '../../components/opportunities/OpportunityLifecycleManagement';

const Opportunities = () => {
  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      <OpportunityLifecycleManagement />
    </Box>
  );
};

export default Opportunities;