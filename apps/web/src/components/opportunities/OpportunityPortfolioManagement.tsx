import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel
} from '@mui/material';
import {
  Add,
  Edit,
  Visibility,
  FilterList,
  Search,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';

interface Opportunity {
  id: string;
  name: string;
  partner: {
    name: string;
    type: string;
    tier: string;
  };
  stage: 'qualified' | 'proposal' | 'negotiation' | 'closing' | 'won' | 'lost';
  amount: number;
  currency: string;
  probability: number;
  weightedValue: number;
  owner: {
    name: string;
    avatar?: string;
  };
  expectedCloseDate: string;
  daysInStage: number;
  health: 'healthy' | 'at-risk' | 'critical';
}

const STAGE_COLORS = {
  qualified: '#2196F3',
  proposal: '#FF9800',
  negotiation: '#9C27B0',
  closing: '#4CAF50',
  won: '#4CAF50',
  lost: '#F44336'
};

const HEALTH_COLORS = {
  healthy: '#4caf50',
  'at-risk': '#ff9800',
  critical: '#f44336'
};

const OpportunityPortfolioManagement = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    stage: 'all',
    health: 'all',
    partner: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'amount' | 'probability' | 'weightedValue' | 'daysInStage'>('weightedValue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadOpportunityData();
  }, []);

  const loadOpportunityData = async () => {
    setLoading(false);
    try {
      // Mock data - would be replaced with API call
      const mockOpportunities: Opportunity[] = [
        {
          id: '1',
          name: 'Enterprise Cloud Migration',
          partner: {
            name: 'CloudTech Solutions',
            type: 'Technology',
            tier: 'Enterprise'
          },
          stage: 'proposal',
          amount: 500000,
          currency: 'USD',
          probability: 75,
          weightedValue: 375000,
          owner: {
            name: 'John Smith'
          },
          expectedCloseDate: '2025-11-15T00:00:00Z',
          daysInStage: 14,
          health: 'healthy'
        },
        {
          id: '2',
          name: 'Security Assessment Package',
          partner: {
            name: 'SecureData Inc',
            type: 'Security',
            tier: 'Premium'
          },
          stage: 'negotiation',
          amount: 150000,
          currency: 'USD',
          probability: 65,
          weightedValue: 97500,
          owner: {
            name: 'Sarah Johnson'
          },
          expectedCloseDate: '2025-10-30T00:00:00Z',
          daysInStage: 21,
          health: 'at-risk'
        },
        {
          id: '3',
          name: 'DevOps Transformation',
          partner: {
            name: 'DevOps Pro',
            type: 'Professional Services',
            tier: 'Standard'
          },
          stage: 'qualified',
          amount: 220000,
          currency: 'USD',
          probability: 40,
          weightedValue: 88000,
          owner: {
            name: 'Mike Davis'
          },
          expectedCloseDate: '2025-12-01T00:00:00Z',
          daysInStage: 7,
          health: 'healthy'
        },
        {
          id: '4',
          name: 'Analytics Platform Upgrade',
          partner: {
            name: 'Analytics Plus',
            type: 'Data Analytics',
            tier: 'Premium'
          },
          stage: 'closing',
          amount: 380000,
          currency: 'USD',
          probability: 90,
          weightedValue: 342000,
          owner: {
            name: 'Emily Chen'
          },
          expectedCloseDate: '2025-10-25T00:00:00Z',
          daysInStage: 35,
          health: 'healthy'
        },
        {
          id: '5',
          name: 'Digital Migration Project',
          partner: {
            name: 'Digital Partners Corp',
            type: 'Technology',
            tier: 'Strategic'
          },
          stage: 'negotiation',
          amount: 750000,
          currency: 'USD',
          probability: 55,
          weightedValue: 412500,
          owner: {
            name: 'Robert Lee'
          },
          expectedCloseDate: '2025-11-30T00:00:00Z',
          daysInStage: 42,
          health: 'critical'
        }
      ];

      setOpportunities(mockOpportunities);
    } catch (error) {
      console.error('Failed to load opportunity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (filters.stage !== 'all' && opp.stage !== filters.stage) return false;
    if (filters.health !== 'all' && opp.health !== filters.health) return false;
    if (filters.search && !opp.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const sortedOpportunities = [...filteredOpportunities].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Opportunity Portfolio Management
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Comprehensive opportunity directory with pipeline health and performance analytics
      </Typography>

      {/* Filters and Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search opportunities..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Stage</InputLabel>
              <Select
                value={filters.stage}
                onChange={(e) => setFilters({...filters, stage: e.target.value})}
              >
                <MenuItem value="all">All Stages</MenuItem>
                <MenuItem value="qualified">Qualified</MenuItem>
                <MenuItem value="proposal">Proposal</MenuItem>
                <MenuItem value="negotiation">Negotiation</MenuItem>
                <MenuItem value="closing">Closing</MenuItem>
                <MenuItem value="won">Won</MenuItem>
                <MenuItem value="lost">Lost</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Health</InputLabel>
              <Select
                value={filters.health}
                onChange={(e) => setFilters({...filters, health: e.target.value})}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="healthy">Healthy</MenuItem>
                <MenuItem value="at-risk">At Risk</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" gap={1}>
              <Button
                startIcon={<FilterList />}
                onClick={() => setFilters({ stage: 'all', health: 'all', partner: 'all', search: '' })}
                size="small"
                variant="outlined"
              >
                Clear Filters
              </Button>
              <Button startIcon={<Add />} size="small" variant="contained">
                Add Opportunity
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Opportunity Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Opportunity</TableCell>
              <TableCell>Partner</TableCell>
              <TableCell>Stage</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'amount'}
                  direction={sortOrder}
                  onClick={() => handleSort('amount')}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'probability'}
                  direction={sortOrder}
                  onClick={() => handleSort('probability')}
                >
                  Probability
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'weightedValue'}
                  direction={sortOrder}
                  onClick={() => handleSort('weightedValue')}
                >
                  Weighted Value
                </TableSortLabel>
              </TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Expected Close</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === 'daysInStage'}
                  direction={sortOrder}
                  onClick={() => handleSort('daysInStage')}
                >
                  Days in Stage
                </TableSortLabel>
              </TableCell>
              <TableCell>Health</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedOpportunities.map((opportunity) => (
              <TableRow
                key={opportunity.id}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {opportunity.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {opportunity.partner.name}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {opportunity.partner.type} · {opportunity.partner.tier}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={opportunity.stage.charAt(0).toUpperCase() + opportunity.stage.slice(1)}
                    sx={{
                      backgroundColor: `${STAGE_COLORS[opportunity.stage]}20`,
                      color: STAGE_COLORS[opportunity.stage],
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(opportunity.amount, opportunity.currency)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="body2" fontWeight="medium">
                      {opportunity.probability}%
                    </Typography>
                    {opportunity.probability >= 75 ? (
                      <TrendingUp fontSize="small" color="success" />
                    ) : opportunity.probability < 50 ? (
                      <TrendingDown fontSize="small" color="error" />
                    ) : null}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(opportunity.weightedValue, opportunity.currency)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {opportunity.owner.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(opportunity.expectedCloseDate)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {opportunity.daysInStage}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={opportunity.health.charAt(0).toUpperCase() + opportunity.health.slice(1).replace('-', ' ')}
                    sx={{
                      backgroundColor: `${HEALTH_COLORS[opportunity.health]}20`,
                      color: HEALTH_COLORS[opportunity.health],
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small">
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <Edit fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OpportunityPortfolioManagement;
