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
import PartnerHealth from '../../components/dashboard/PartnerHealth';

interface PartnershipAnalytics {
  partners: any;
  relationships: any;
  performance: any;
}

const PartnershipsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<PartnershipAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartnershipAnalytics = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getPartnerAnalytics();
        setAnalyticsData({
          partners: response.data,
          relationships: response.data,
          performance: response.data
        });
        notify.success('Partnership analytics loaded successfully');
      } catch (error) {
        console.error('Error fetching partnership analytics:', error);
        notify.error('Failed to load partnership analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchPartnershipAnalytics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography>Loading partnerships analytics...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Partnerships Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Partner performance metrics, relationship analytics, and partnership health monitoring
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Partner Health Analytics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Partner Health Overview" />
              <CardContent>
                <PartnerHealth data={analyticsData?.partners} />
              </CardContent>
            </Card>
          </Grid>

          {/* Partner Performance Metrics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Partner Performance" />
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
                    Partner Performance Chart
                    <br />
                    (Revenue, deals, growth metrics)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Relationship Analytics */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Relationship Analytics" />
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
                    Partnership Relationship Analytics
                    <br />
                    (Engagement levels, communication metrics, collaboration data)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Partner Tier Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Partner Tier Distribution" />
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
                    Partner Tier Analytics
                    <br />
                    (Gold, Silver, Bronze distribution)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Partnership Revenue Trends */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Revenue Trends" />
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
                    Partnership Revenue Trends
                    <br />
                    (Historical partnership revenue data)
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

export default PartnershipsDashboard;