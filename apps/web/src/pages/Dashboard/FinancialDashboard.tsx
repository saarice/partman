import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography
} from '@mui/material';
import { dashboardApi } from '../../services/api';
import RevenueCard from '../../components/dashboard/RevenueCard';

interface FinancialData {
  revenue: any;
}

const FinancialDashboard: React.FC = () => {
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        const revenueRes = await dashboardApi.getRevenueProgress();
        setFinancialData({
          revenue: revenueRes.data
        });
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading financial dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Financial Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Revenue tracking, commission analytics, and financial forecasting
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Revenue Progress */}
          <Grid item xs={12} md={6}>
            <RevenueCard data={financialData?.revenue} />
          </Grid>

          {/* Future Financial Components */}
          <Grid item xs={12} md={6}>
            <Box sx={{
              p: 3,
              border: '2px dashed #ccc',
              borderRadius: 2,
              textAlign: 'center',
              minHeight: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Typography variant="body1" color="text.secondary">
                Commission Analytics & Forecasting Components
                <br />
                (To be added based on business requirements)
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default FinancialDashboard;