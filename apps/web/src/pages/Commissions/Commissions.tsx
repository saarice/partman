import { Box } from '@mui/material';
import CommissionCalculator from '../../components/commissions/CommissionCalculator';

const Commissions = () => {
  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      <CommissionCalculator />
    </Box>
  );
};

export default Commissions;