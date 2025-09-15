import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { AccountCircle, ExitToApp, Business, Dashboard as DashboardIcon, Calculate, Timeline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
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
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

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
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Partnership Management Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              onClick={() => navigate('/partners')}
              title="Partner Portfolio"
            >
              <Business />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => navigate('/commissions')}
              title="Commission Calculator"
            >
              <Calculate />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => navigate('/opportunities')}
              title="Opportunity Pipeline"
            >
              <Timeline />
            </IconButton>
            <Typography variant="body2" color="inherit">
              Welcome, {user?.firstName} {user?.lastName}
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account menu"
              color="inherit"
              onClick={handleMenuOpen}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

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