import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CircularProgress
} from '@mui/material';
import { dashboardApi } from '../../services/dashboardApi';
import { notify } from '../../utils/notifications';
import PipelineFunnel from '../../components/dashboard/PipelineFunnel';
import PipelineHealthMonitoring from '../../components/dashboard/PipelineHealthMonitoring';
import EnhancedTeamPerformance from '../../components/dashboard/EnhancedTeamPerformance';
import FunnelChart from '../../components/dashboard/FunnelChart';

interface OpportunityAnalytics {
  pipeline: any;
  team: any;
  funnel: any;
  trends: any;
}

const OpportunitiesDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<OpportunityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const [pipelineRes, teamRes] = await Promise.all([
          dashboardApi.getPipelineFunnel(),
          dashboardApi.getTeamPerformance()
        ]);
        setAnalyticsData({
          pipeline: pipelineRes.data,
          team: teamRes.data,
          funnel: pipelineRes.data,
          trends: pipelineRes.data
        });
        notify.success('Opportunities analytics loaded successfully');
      } catch (error) {
        console.error('Error fetching opportunity analytics:', error);
        notify.error('Failed to load opportunities analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography>Loading opportunities analytics...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Opportunities Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Pipeline analytics, opportunity tracking, and sales performance metrics
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Pipeline Funnel Analytics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Sales Pipeline Funnel" />
              <CardContent>
                <PipelineFunnel data={analyticsData?.pipeline} />
              </CardContent>
            </Card>
          </Grid>

          {/* Advanced Funnel Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Conversion Analytics" />
              <CardContent>
                <FunnelChart data={analyticsData?.funnel} />
              </CardContent>
            </Card>
          </Grid>

          {/* Pipeline Health Monitoring */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Pipeline Health Monitoring" />
              <CardContent>
                <PipelineHealthMonitoring />
              </CardContent>
            </Card>
          </Grid>

          {/* Team Performance Analytics */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Sales Team Performance" />
              <CardContent>
                <EnhancedTeamPerformance />
              </CardContent>
            </Card>
          </Grid>

          {/* Opportunity Trends */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Opportunity Trends" />
              <CardContent>
                <Box sx={{
                  p: 3,
                  textAlign: 'center',
                  minHeight: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #ccc',
                  borderRadius: 2
                }}>
                  <Typography variant="body1" color="text.secondary">
                    Opportunity Trends Chart
                    <br />
                    (Historical opportunity data visualization)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Metrics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Performance Metrics" />
              <CardContent>
                <Box sx={{
                  p: 3,
                  textAlign: 'center',
                  minHeight: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #ccc',
                  borderRadius: 2
                }}>
                  <Typography variant="body1" color="text.secondary">
                    Performance KPI Cards
                    <br />
                    (Opportunity-specific metrics)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default OpportunitiesDashboard;