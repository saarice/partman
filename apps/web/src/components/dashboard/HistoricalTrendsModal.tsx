import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  CircularProgress
} from '@mui/material';
import { GetApp } from '@mui/icons-material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { pipelineService } from '../../services/pipelineService';
import type { PipelineTrend } from '../../services/pipelineService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface HistoricalTrendsModalProps {
  open: boolean;
  onClose: () => void;
}

const HistoricalTrendsModal: React.FC<HistoricalTrendsModalProps> = ({ open, onClose }) => {
  const [trends, setTrends] = useState<PipelineTrend[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'monthly' | 'quarterly'>('quarterly');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadTrends();
    }
  }, [open, period]);

  const loadTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pipelineService.getPipelineTrends(period);
      setTrends(data);
    } catch (err) {
      setError('Failed to load historical trends');
      console.error('Error loading trends:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (stageId: string) => {
    const displayNames: Record<string, string> = {
      'lead': 'Lead',
      'demo': 'Demo',
      'poc': 'POC',
      'proposal': 'Proposal',
      'closed_won': 'Closed Won'
    };
    return displayNames[stageId] || stageId;
  };

  const STAGE_COLORS = {
    'lead': '#FF6B6B',
    'demo': '#4ECDC4',
    'poc': '#45B7D1',
    'proposal': '#96CEB4',
    'closed_won': '#FFEAA7'
  };

  // Group trends by stage for chart display
  const groupedTrends = trends.reduce((acc, trend) => {
    if (!acc[trend.stage]) {
      acc[trend.stage] = [];
    }
    acc[trend.stage].push(trend);
    return acc;
  }, {} as Record<string, PipelineTrend[]>);

  // Get unique periods for x-axis
  const periods = [...new Set(trends.map(t => t.period))].sort();

  const chartData = {
    labels: periods,
    datasets: Object.entries(groupedTrends).map(([stage, stageTrends]) => ({
      label: getDisplayName(stage),
      data: periods.map(period => {
        const trend = stageTrends.find(t => t.period === period);
        return trend ? trend.count : 0;
      }),
      borderColor: STAGE_COLORS[stage as keyof typeof STAGE_COLORS] || '#ccc',
      backgroundColor: `${STAGE_COLORS[stage as keyof typeof STAGE_COLORS] || '#ccc'}20`,
      tension: 0.1,
      pointRadius: 4,
      pointHoverRadius: 6
    }))
  };

  const valueChartData = {
    labels: periods,
    datasets: Object.entries(groupedTrends).map(([stage, stageTrends]) => ({
      label: getDisplayName(stage),
      data: periods.map(period => {
        const trend = stageTrends.find(t => t.period === period);
        return trend ? trend.value / 1000000 : 0; // Convert to millions
      }),
      borderColor: STAGE_COLORS[stage as keyof typeof STAGE_COLORS] || '#ccc',
      backgroundColor: `${STAGE_COLORS[stage as keyof typeof STAGE_COLORS] || '#ccc'}20`,
      tension: 0.1,
      pointRadius: 4,
      pointHoverRadius: 6
    }))
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Opportunity Count Trends'
      },
      tooltip: {
        callbacks: {
          label: (context: { dataset: { label: string }; raw: number }) => {
            return `${context.dataset.label}: ${context.raw} opportunities`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Opportunities'
        }
      },
      x: {
        title: {
          display: true,
          text: period === 'quarterly' ? 'Quarter' : 'Month'
        }
      }
    }
  };

  const valueChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Pipeline Value Trends'
      },
      tooltip: {
        callbacks: {
          label: (context: { dataset: { label: string }; raw: number }) => {
            return `${context.dataset.label}: $${context.raw.toFixed(1)}M`;
          }
        }
      }
    },
    scales: {
      ...chartOptions.scales,
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value (Millions USD)'
        }
      }
    }
  };

  const handleExportTrends = () => {
    if (trends.length === 0) return;

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `pipeline-trends-${period}-${timestamp}.csv`;
    pipelineService.exportPipelineTrends(trends, filename, period);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Historical Pipeline Trends</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'monthly' | 'quarterly')}
              label="Period"
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading trends...
            </Typography>
          </Box>
        )}

        {error && (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          </Box>
        )}

        {!loading && !error && trends.length === 0 && (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <Typography variant="body1" color="textSecondary">
              No historical data available
            </Typography>
          </Box>
        )}

        {!loading && !error && trends.length > 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Box height="300px">
                  <Line data={chartData} options={chartOptions} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Box height="300px">
                  <Line data={valueChartData} options={valueChartOptions} />
                </Box>
              </Paper>
            </Grid>

            {/* Summary Statistics */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" mb={2}>Trend Summary</Typography>
                <Grid container spacing={2}>
                  {Object.entries(groupedTrends).map(([stage, stageTrends]) => {
                    const latest = stageTrends[stageTrends.length - 1];
                    const previous = stageTrends[stageTrends.length - 2];
                    const countChange = previous ? ((latest.count - previous.count) / previous.count * 100) : 0;
                    const valueChange = previous ? ((latest.value - previous.value) / previous.value * 100) : 0;

                    return (
                      <Grid item xs={12} sm={6} md={4} key={stage}>
                        <Box
                          sx={{
                            p: 2,
                            border: `2px solid ${STAGE_COLORS[stage as keyof typeof STAGE_COLORS]}40`,
                            borderRadius: 2,
                            backgroundColor: `${STAGE_COLORS[stage as keyof typeof STAGE_COLORS]}10`
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {getDisplayName(stage)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Latest: {latest?.count || 0} opportunities
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Value: ${(latest?.value || 0) / 1000000}M
                          </Typography>
                          <Typography
                            variant="body2"
                            color={countChange >= 0 ? 'success.main' : 'error.main'}
                          >
                            Count: {countChange >= 0 ? '+' : ''}{countChange.toFixed(1)}%
                          </Typography>
                          <Typography
                            variant="body2"
                            color={valueChange >= 0 ? 'success.main' : 'error.main'}
                          >
                            Value: {valueChange >= 0 ? '+' : ''}{valueChange.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<GetApp />}
          onClick={handleExportTrends}
          disabled={trends.length === 0}
        >
          Export Trends
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HistoricalTrendsModal;