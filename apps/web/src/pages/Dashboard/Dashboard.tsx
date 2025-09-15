import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography
} from '@mui/material';
import TopNavigation from '../../components/common/TopNavigation';
import { dashboardApi } from '../../services/api';
import RevenueCard from '../../components/dashboard/RevenueCard';
import PipelineFunnel from '../../components/dashboard/PipelineFunnel';
import EnhancedTeamPerformance from '../../components/dashboard/EnhancedTeamPerformance';
import PartnerHealth from '../../components/dashboard/PartnerHealth';
import EnhancedAlertCenter from '../../components/dashboard/EnhancedAlertCenter';
import PipelineHealthMonitoring from '../../components/dashboard/PipelineHealthMonitoring';

interface DashboardData {
  revenue: any;
  pipeline: any;
  team: any;
  partners: any;
  alerts: any[];
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getKPIs();
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <TopNavigation
        title="Partnership Management Dashboard"
        currentPage="dashboard"
      />

      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Executive Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Real-time department performance and KPI tracking
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Revenue Progress */}
          <Grid item xs={12} md={6} lg={3}>
            <RevenueCard data={dashboardData?.revenue} />
          </Grid>

          {/* Pipeline Overview */}
          <Grid item xs={12} md={6} lg={3}>
            <PipelineFunnel data={dashboardData?.pipeline} />
          </Grid>

          {/* Team Performance */}
          <Grid item xs={12}>
            <EnhancedTeamPerformance />
          </Grid>

          {/* Partner Health */}
          <Grid item xs={12} md={6} lg={3}>
            <PartnerHealth data={dashboardData?.partners} />
          </Grid>

          {/* Pipeline Health Monitoring */}
          <Grid item xs={12}>
            <PipelineHealthMonitoring />
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

export default Dashboard;