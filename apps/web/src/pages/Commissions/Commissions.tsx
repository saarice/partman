import { Box } from '@mui/material';
import CommissionCalculator from '../../components/commissions/CommissionCalculator';

const Commissions = () => {
  return (
    <Box>
      <Box sx={{ p: 3 }}>
        <CommissionCalculator />
      </Box>
    </Box>
  );
};

export default Commissions;