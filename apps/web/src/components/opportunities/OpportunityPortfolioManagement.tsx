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
  TableSortLabel,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Visibility,
  FilterList,
  Search,
  TrendingUp,
  TrendingDown,
  ViewList,
  ViewKanban,
  AccountCircle
} from '@mui/icons-material';
import { OpportunityEditDialog } from './OpportunityEditDialog';

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
  commissionRate: number; // Commission rate as decimal (e.g., 0.15 for 15%)
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

const STAGE_CONFIG = {
  qualified: { title: 'Qualified', color: '#2196F3' },
  proposal: { title: 'Proposal', color: '#FF9800' },
  negotiation: { title: 'Negotiation', color: '#9C27B0' },
  closing: { title: 'Closing', color: '#4CAF50' },
  won: { title: 'Won', color: '#4CAF50' },
  lost: { title: 'Lost', color: '#F44336' }
};

const OpportunityPortfolioManagement = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [filters, setFilters] = useState({
    stage: 'all',
    health: 'all',
    partner: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'amount' | 'probability' | 'weightedValue' | 'daysInStage'>('weightedValue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [draggedOpportunity, setDraggedOpportunity] = useState<Opportunity | null>(null);

  useEffect(() => {
    loadOpportunityData();
  }, []);

  const loadOpportunityData = async () => {
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
          commissionRate: 0.12, // 12%
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
          commissionRate: 0.15, // 15%
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
          commissionRate: 0.10, // 10%
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
          commissionRate: 0.18, // 18%
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
          commissionRate: 0.08, // 8%
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

  const handleDragStart = (opportunity: Opportunity) => {
    setDraggedOpportunity(opportunity);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetStage: string) => {
    if (!draggedOpportunity) return;

    setOpportunities(prev =>
      prev.map(opp =>
        opp.id === draggedOpportunity.id
          ? { ...opp, stage: targetStage as Opportunity['stage'] }
          : opp
      )
    );

    setDraggedOpportunity(null);
  };

  const calculateCommission = (opportunity: Opportunity) => {
    return opportunity.amount * opportunity.commissionRate;
  };

  const getColumnTotal = (stage: string) => {
    return opportunities
      .filter(opp => opp.stage === stage)
      .reduce((sum, opp) => sum + calculateCommission(opp), 0);
  };

  const renderKanbanView = () => {
    const columns = Object.entries(STAGE_CONFIG).map(([stage, config]) => ({
      id: stage,
      title: config.title,
      color: config.color,
      opportunities: filteredOpportunities.filter(opp => opp.stage === stage)
    }));

    return (
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
        {columns.map((column) => (
          <Paper
            key={column.id}
            sx={{ minWidth: 320, maxWidth: 320, backgroundColor: '#f5f5f5', p: 2 }}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            {/* Column Header */}
            <Box sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: column.color }} />
                  <Typography variant="h6" fontWeight="bold">{column.title}</Typography>
                  <Chip label={column.opportunities.length} size="small" sx={{ fontWeight: 'bold' }} />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">
                {formatCurrency(getColumnTotal(column.id), 'USD')}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Opportunity Cards */}
            <Stack spacing={2}>
              {column.opportunities.map((opportunity) => (
                <Card
                  key={opportunity.id}
                  draggable
                  onDragStart={() => handleDragStart(opportunity)}
                  onClick={() => {
                    setSelectedOpportunity(opportunity);
                    setEditDialogOpen(true);
                  }}
                  sx={{
                    cursor: 'move',
                    '&:hover': { boxShadow: 3, transform: 'translateY(-2px)', transition: 'all 0.2s' },
                    borderLeft: `4px solid ${STAGE_COLORS[opportunity.stage]}`
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{opportunity.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{opportunity.partner.name}</Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {formatCurrency(opportunity.amount, opportunity.currency)}
                      </Typography>
                      <Chip
                        label={`${(opportunity.commissionRate * 100).toFixed(0)}%`}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      Commission: {formatCurrency(calculateCommission(opportunity), opportunity.currency)}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AccountCircle fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">{opportunity.owner.name}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">{formatDate(opportunity.expectedCloseDate)}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} mt={1}>
                      <Chip
                        label={opportunity.health.replace('-', ' ').toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: HEALTH_COLORS[opportunity.health],
                          color: 'white',
                          fontWeight: 500,
                          fontSize: '0.7rem'
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">{opportunity.daysInStage} days</Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {/* Empty State */}
              {column.opportunities.length === 0 && (
                <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', backgroundColor: 'background.paper', borderRadius: 1, border: '2px dashed', borderColor: 'divider' }}>
                  <Typography variant="body2">Drop opportunities here</Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        ))}
      </Box>
    );
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
      <Paper sx={{ p: 2, mb: 3, minHeight: 72 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2.5}>
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
          <Grid item xs={12} sm={6} md={1.5}>
            <Button
              fullWidth
              startIcon={<FilterList />}
              onClick={() => setFilters({ stage: 'all', health: 'all', partner: 'all', search: '' })}
              size="small"
              variant="outlined"
            >
              Clear
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box display="flex" gap={1} justifyContent="flex-end">
              <ToggleButtonGroup
                value={view}
                exclusive
                onChange={(_, newView) => newView && setView(newView)}
                size="small"
              >
                <ToggleButton value="table">
                  <ViewList fontSize="small" />
                </ToggleButton>
                <ToggleButton value="kanban">
                  <ViewKanban fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
              <Button startIcon={<Add />} size="small" variant="contained">
                Add
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Table View */}
      {view === 'table' && (
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
                onClick={() => {
                  setSelectedOpportunity(opportunity);
                  setEditDialogOpen(true);
                }}
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
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOpportunity(opportunity);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOpportunity(opportunity);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>
      )}

      {/* Kanban View */}
      {view === 'kanban' && renderKanbanView()}

      <OpportunityEditDialog
        open={editDialogOpen}
        opportunity={selectedOpportunity}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedOpportunity(null);
        }}
        onSave={(updatedData) => {
          if (selectedOpportunity) {
            // Update the opportunity in the local state
            setOpportunities(prevOpportunities =>
              prevOpportunities.map(opp =>
                opp.id === selectedOpportunity.id
                  ? { ...opp, ...updatedData }
                  : opp
              )
            );
          }
        }}
      />
    </Box>
  );
};

export default OpportunityPortfolioManagement;
