import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import { dashboardApi } from '../../services/api';
import RevenueCard from '../../components/dashboard/RevenueCard';

interface FinancialAnalytics {
  revenue: any;
  commissions: any;
  forecasting: any;
}

const FinancialDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<FinancialAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialAnalytics = async () => {
      try {
        setLoading(true);
        const revenueRes = await dashboardApi.getRevenueProgress();
        setAnalyticsData({
          revenue: revenueRes.data,
          commissions: revenueRes.data,
          forecasting: revenueRes.data
        });
      } catch (error) {
        console.error('Error fetching financial analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialAnalytics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading financial analytics...</Typography>
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
            <Card>
              <CardHeader title="Revenue Progress" />
              <CardContent>
                <RevenueCard data={analyticsData?.revenue} />
              </CardContent>
            </Card>
          </Grid>

          {/* Commission Analytics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Commission Analytics" />
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
                    Commission Analytics Chart
                    <br />
                    (Team commissions, payout trends)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Financial Forecasting */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Financial Forecasting" />
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
                    Revenue Forecasting & Predictions
                    <br />
                    (Quarterly projections, pipeline value forecasts)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Revenue by Partner */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Revenue by Partner" />
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
                    Partner Revenue Breakdown
                    <br />
                    (Revenue attribution by partner)
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Financial KPIs */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Financial KPIs" />
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
                    Key Financial Metrics
                    <br />
                    (ARR, MRR, conversion rates)
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

export default FinancialDashboard;