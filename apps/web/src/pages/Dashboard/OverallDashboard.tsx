import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress
} from '@mui/material';
import { dashboardApi } from '../../services/dashboardApi';
import { notify } from '../../utils/notifications';
import RevenueCard from '../../components/dashboard/RevenueCard';
import PartnerHealth from '../../components/dashboard/PartnerHealth';
import EnhancedAlertCenter from '../../components/dashboard/EnhancedAlertCenter';

interface DashboardData {
  revenue: any;
  partners: any;
  alerts: any[];
}

const OverallDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getKPIs();
        setDashboardData(response.data);
        notify.success('Dashboard data loaded successfully');
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        notify.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Overall Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Executive KPIs and cross-functional metrics overview
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Revenue Progress */}
          <Grid item xs={12} md={6} lg={4}>
            <RevenueCard data={dashboardData?.revenue} />
          </Grid>

          {/* Partner Health */}
          <Grid item xs={12} md={6} lg={4}>
            <PartnerHealth data={dashboardData?.partners} />
          </Grid>

          {/* Enhanced Alert Center */}
          <Grid item xs={12}>
            <EnhancedAlertCenter onAlertCountChange={(count) => console.log(`Total alerts: ${count}`)} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default OverallDashboard;