import { Box } from '@mui/material';
import TopNavigation from '../../components/common/TopNavigation';
import CommissionCalculator from '../../components/commissions/CommissionCalculator';

const Commissions = () => {
  return (
    <Box>
      <TopNavigation
        title="Commission Calculator"
        currentPage="commissions"
      />
      <Box sx={{ p: 3 }}>
        <CommissionCalculator />
      </Box>
    </Box>
  );
};

export default Commissions;