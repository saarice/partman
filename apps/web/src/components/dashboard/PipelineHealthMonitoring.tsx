import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Tooltip,
  IconButton,
  Menu,
  Paper,
  Chip
} from '@mui/material';
import {
  GetApp,
  FilterList,
  MoreVert,
  TrendingUp,
  TrendingDown,
  Remove
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement);

interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  probability: number;
  conversionRate?: number;
  trend?: 'up' | 'down' | 'stable';
}

interface PipelineData {
  stages: PipelineStage[];
  totalValue: number;
  weightedValue: number;
  totalOpportunities: number;
}

interface PipelineFilters {
  teamMember: string;
  partner: string;
  dateRange: string;
}

const STAGE_COLORS = {
  'lead': '#FF6B6B',
  'demo': '#4ECDC4',
  'poc': '#45B7D1',
  'proposal': '#96CEB4',
  'closed_won': '#FFEAA7'
};

const STAGE_PROBABILITIES = {
  'lead': 10,
  'demo': 25,
  'poc': 50,
  'proposal': 75,
  'closed_won': 100
};

const PipelineHealthMonitoring = () => {
  const navigate = useNavigate();
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [filters, setFilters] = useState<PipelineFilters>({
    teamMember: 'all',
    partner: 'all',
    dateRange: '30d'
  });
  const [loading, setLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  useEffect(() => {
    loadPipelineData();
  }, [filters]);

  const loadPipelineData = async () => {
    setLoading(true);
    try {
      const { pipelineService } = await import('../../services/pipelineService');
      const data = await pipelineService.getPipelineHealth(filters);
      setPipelineData(data);
    } catch (error) {
      console.error('Failed to load pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageClick = (stage: string) => {
    console.log('Stage clicked:', stage);
    setSelectedStage(stage);
    // Navigate to opportunities page with stage filter
    navigate(`/opportunities?stage=${encodeURIComponent(stage)}`);
    console.log('Navigation attempted to:', `/opportunities?stage=${encodeURIComponent(stage)}`);
  };

  const handleExportCSV = async () => {
    if (!pipelineData) return;

    try {
      const { pipelineService } = await import('../../services/pipelineService');
      pipelineService.exportPipelineData(pipelineData, 'pipeline-health-data.csv');
    } catch (error) {
      console.error('Failed to export pipeline data:', error);
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp color="success" fontSize="small" />;
      case 'down': return <TrendingDown color="error" fontSize="small" />;
      default: return <Remove color="action" fontSize="small" />;
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

  const chartData = {
    labels: pipelineData?.stages.map(s => getDisplayName(s.stage)) || [],
    datasets: [
      {
        label: 'Opportunities',
        data: pipelineData?.stages.map(s => s.count) || [],
        backgroundColor: pipelineData?.stages.map(s => STAGE_COLORS[s.stage as keyof typeof STAGE_COLORS]) || [],
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const stage = pipelineData?.stages[context.dataIndex];
            if (!stage) return '';
            return [
              `Opportunities: ${stage.count}`,
              `Value: $${(stage.value / 1000000).toFixed(1)}M`,
              `Weighted: $${((stage.value * stage.probability / 100) / 1000000).toFixed(1)}M`,
              `Conversion: ${stage.conversionRate}%`
            ];
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
      }
    },
    onClick: (_: any, elements: any) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const stage = pipelineData?.stages[index];
        if (stage) {
          handleStageClick(stage.stage);
        }
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading pipeline data...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2" fontWeight="bold">
            Pipeline Health Monitoring
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              startIcon={<GetApp />}
              onClick={handleExportCSV}
              size="small"
            >
              Export CSV
            </Button>
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Team Member</InputLabel>
              <Select
                value={filters.teamMember}
                onChange={(e) => setFilters({...filters, teamMember: e.target.value})}
              >
                <MenuItem value="all">All Team Members</MenuItem>
                <MenuItem value="john">John Smith</MenuItem>
                <MenuItem value="sarah">Sarah Johnson</MenuItem>
                <MenuItem value="mike">Mike Davis</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Partner</InputLabel>
              <Select
                value={filters.partner}
                onChange={(e) => setFilters({...filters, partner: e.target.value})}
              >
                <MenuItem value="all">All Partners</MenuItem>
                <MenuItem value="acme">ACME Corp</MenuItem>
                <MenuItem value="global">GlobalTech</MenuItem>
                <MenuItem value="tech">TechSolutions</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Date Range</InputLabel>
              <Select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              >
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
                <MenuItem value="1y">Last Year</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {pipelineData?.totalOpportunities}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Opportunities
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                ${(pipelineData?.totalValue ? pipelineData.totalValue / 1000000 : 0).toFixed(1)}M
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Pipeline Value
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                ${(pipelineData?.weightedValue ? pipelineData.weightedValue / 1000000 : 0).toFixed(1)}M
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Weighted Pipeline
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {pipelineData ? Math.round((pipelineData.stages.find(s => s.stage === 'Closed Won')?.count || 0) / pipelineData.totalOpportunities * 100) : 0}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Win Rate
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box height={400} mb={3} sx={{ cursor: 'pointer' }}>
          <Bar data={chartData} options={chartOptions} />
        </Box>

        <Box>
          <Typography variant="h6" mb={2}>Stage Details</Typography>
          <Grid container spacing={2}>
            {pipelineData?.stages.map((stage, index) => (
              <Grid item xs={12} sm={6} md={4} key={stage.stage}>
                <Paper
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    border: `2px solid ${STAGE_COLORS[stage.stage as keyof typeof STAGE_COLORS]}20`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'grey.50',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: `2px solid ${STAGE_COLORS[stage.stage as keyof typeof STAGE_COLORS]}60`
                    }
                  }}
                  onClick={() => handleStageClick(stage.stage)}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {getDisplayName(stage.stage)}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {getTrendIcon(stage.trend)}
                      <Chip
                        label={`${stage.probability}%`}
                        size="small"
                        sx={{
                          backgroundColor: `${STAGE_COLORS[stage.stage as keyof typeof STAGE_COLORS]}30`,
                          color: STAGE_COLORS[stage.stage as keyof typeof STAGE_COLORS]
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary" mb={1}>
                    {stage.count} opportunities
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" mb={1}>
                    ${(stage.value / 1000000).toFixed(1)}M total
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    Conversion: {stage.conversionRate}%
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={() => {
            setMenuAnchor(null);
            // Handle historical view
          }}>
            Historical Trends
          </MenuItem>
          <MenuItem onClick={() => {
            setMenuAnchor(null);
            // Handle detailed analysis
          }}>
            Detailed Analysis
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

export default PipelineHealthMonitoring;