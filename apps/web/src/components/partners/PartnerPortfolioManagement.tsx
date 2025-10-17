import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Avatar,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Menu,
  Paper,
  LinearProgress,
  Divider,
  Badge,
  Tooltip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel
} from '@mui/material';
import {
  Business,
  Person,
  Email,
  Phone,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error,
  Schedule,
  MoreVert,
  Add,
  Edit,
  Visibility,
  Compare,
  FilterList,
  Search,
  AttachMoney,
  CalendarToday,
  Star,
  StarBorder
} from '@mui/icons-material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip as ChartTooltip, Legend, PointElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, ChartTooltip, Legend);

interface PartnerContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isPrimary: boolean;
  lastContact?: string;
}

interface PartnerActivity {
  id: string;
  type: 'meeting' | 'opportunity' | 'contract' | 'issue' | 'renewal';
  title: string;
  date: string;
  description?: string;
  value?: number;
  status?: string;
}

interface CommissionStructure {
  id: string;
  tier: string;
  rate: number;
  threshold: number;
  type: 'percentage' | 'flat' | 'tiered';
}

interface Partner {
  id: string;
  name: string;
  category: 'FinOps' | 'Security' | 'Observability' | 'DevOps' | 'Data';
  logo?: string;
  website?: string;
  relationshipHealth: {
    score: number;
    status: 'excellent' | 'healthy' | 'needs_attention' | 'at_risk';
    lastInteraction: string;
    nextContactDue: string;
  };
  performance: {
    quarterlyRevenue: number;
    annualRevenue: number;
    activeOpportunities: number;
    closedDeals: number;
    avgDealSize: number;
    trend: 'up' | 'down' | 'stable';
  };
  contacts: PartnerContact[];
  commissionStructure: CommissionStructure[];
  activities: PartnerActivity[];
  tags: string[];
  tier: 'strategic' | 'tactical' | 'emerging';
  contractStatus: 'active' | 'renewal_due' | 'expired' | 'negotiating';
}

const CATEGORY_COLORS = {
  FinOps: '#FF6B6B',
  Security: '#4ECDC4',
  Observability: '#45B7D1',
  DevOps: '#96CEB4',
  Data: '#FFEAA7'
};

const HEALTH_COLORS = {
  excellent: '#4caf50',
  healthy: '#8bc34a',
  needs_attention: '#ff9800',
  at_risk: '#f44336'
};

const PartnerPortfolioManagement = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: 'all',
    health: 'all',
    tier: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState<keyof Partner['performance']>('quarterlyRevenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [menuAnchor, setMenuAnchor] = useState<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    loadPartnerData();
  }, []);

  const loadPartnerData = async () => {
    setLoading(true);
    try {
      // Mock data - would be replaced with API call
      const mockPartners: Partner[] = [
        {
          id: '1',
          name: 'ACME FinOps Solutions',
          category: 'FinOps',
          website: 'https://acme-finops.com',
          tier: 'strategic',
          contractStatus: 'active',
          relationshipHealth: {
            score: 95,
            status: 'excellent',
            lastInteraction: '2025-09-10T14:30:00Z',
            nextContactDue: '2025-10-10T00:00:00Z'
          },
          performance: {
            quarterlyRevenue: 1250000,
            annualRevenue: 4800000,
            activeOpportunities: 8,
            closedDeals: 12,
            avgDealSize: 400000,
            trend: 'up'
          },
          contacts: [
            { id: '1', name: 'John Smith', email: 'john@acme.com', phone: '+1-555-0123', role: 'VP Partnerships', isPrimary: true, lastContact: '2025-09-10T14:30:00Z' },
            { id: '2', name: 'Sarah Johnson', email: 'sarah@acme.com', role: 'Technical Lead', isPrimary: false }
          ],
          commissionStructure: [
            { id: '1', tier: 'Base', rate: 10, threshold: 0, type: 'percentage' },
            { id: '2', tier: 'Premium', rate: 15, threshold: 1000000, type: 'percentage' }
          ],
          activities: [
            { id: '1', type: 'opportunity', title: 'New enterprise deal - GlobalCorp', date: '2025-09-15T10:00:00Z', value: 500000, status: 'proposal' },
            { id: '2', type: 'meeting', title: 'Quarterly business review', date: '2025-09-10T14:30:00Z' }
          ],
          tags: ['Enterprise', 'Cloud Cost', 'Strategic']
        },
        {
          id: '2',
          name: 'SecureGuard Technologies',
          category: 'Security',
          tier: 'strategic',
          contractStatus: 'renewal_due',
          relationshipHealth: {
            score: 72,
            status: 'healthy',
            lastInteraction: '2025-08-25T09:00:00Z',
            nextContactDue: '2025-09-25T00:00:00Z'
          },
          performance: {
            quarterlyRevenue: 890000,
            annualRevenue: 3200000,
            activeOpportunities: 5,
            closedDeals: 8,
            avgDealSize: 320000,
            trend: 'stable'
          },
          contacts: [
            { id: '3', name: 'Mike Davis', email: 'mike@secureguard.com', role: 'Director of Partnerships', isPrimary: true, lastContact: '2025-08-25T09:00:00Z' }
          ],
          commissionStructure: [
            { id: '3', tier: 'Standard', rate: 12, threshold: 0, type: 'percentage' }
          ],
          activities: [
            { id: '3', type: 'renewal', title: 'Contract renewal discussion', date: '2025-08-25T09:00:00Z', status: 'in_progress' },
            { id: '4', type: 'issue', title: 'Integration support ticket', date: '2025-08-20T15:30:00Z' }
          ],
          tags: ['Cybersecurity', 'Compliance', 'Mid-Market']
        },
        {
          id: '3',
          name: 'DataFlow Analytics',
          category: 'Data',
          tier: 'tactical',
          contractStatus: 'active',
          relationshipHealth: {
            score: 45,
            status: 'at_risk',
            lastInteraction: '2025-07-15T11:00:00Z',
            nextContactDue: '2025-08-15T00:00:00Z'
          },
          performance: {
            quarterlyRevenue: 180000,
            annualRevenue: 650000,
            activeOpportunities: 2,
            closedDeals: 3,
            avgDealSize: 90000,
            trend: 'down'
          },
          contacts: [
            { id: '4', name: 'Emily Chen', email: 'emily@dataflow.com', role: 'Partnership Manager', isPrimary: true, lastContact: '2025-07-15T11:00:00Z' }
          ],
          commissionStructure: [
            { id: '4', tier: 'Base', rate: 8, threshold: 0, type: 'percentage' }
          ],
          activities: [
            { id: '5', type: 'opportunity', title: 'Small business analytics package', date: '2025-07-15T11:00:00Z', value: 50000, status: 'stalled' }
          ],
          tags: ['Analytics', 'SMB', 'Data Viz']
        }
      ];

      setPartners(mockPartners);
    } catch (error) {
      console.error('Failed to load partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle sx={{ color: HEALTH_COLORS.excellent }} />;
      case 'healthy': return <CheckCircle sx={{ color: HEALTH_COLORS.healthy }} />;
      case 'needs_attention': return <Warning sx={{ color: HEALTH_COLORS.needs_attention }} />;
      case 'at_risk': return <Error sx={{ color: HEALTH_COLORS.at_risk }} />;
      default: return <Schedule color="action" />;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp color="success" fontSize="small" />;
      case 'down': return <TrendingDown color="error" fontSize="small" />;
      default: return null;
    }
  };

  const filteredPartners = partners.filter(partner => {
    if (filters.category !== 'all' && partner.category !== filters.category) return false;
    if (filters.health !== 'all' && partner.relationshipHealth.status !== filters.health) return false;
    if (filters.tier !== 'all' && partner.tier !== filters.tier) return false;
    if (filters.search && !partner.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const sortedPartners = [...filteredPartners].sort((a, b) => {
    const aValue = a.performance[sortBy];
    const bValue = b.performance[sortBy];
    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const handleSort = (field: keyof Partner['performance']) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleCompareToggle = (partnerId: string) => {
    if (selectedForComparison.includes(partnerId)) {
      setSelectedForComparison(selectedForComparison.filter(id => id !== partnerId));
    } else if (selectedForComparison.length < 3) {
      setSelectedForComparison([...selectedForComparison, partnerId]);
    }
  };

  const revenueChartData = {
    labels: sortedPartners.slice(0, 10).map(p => p.name.split(' ')[0]),
    datasets: [
      {
        label: 'Quarterly Revenue',
        data: sortedPartners.slice(0, 10).map(p => p.performance.quarterlyRevenue),
        backgroundColor: sortedPartners.slice(0, 10).map(p => CATEGORY_COLORS[p.category]),
        borderRadius: 4
      }
    ]
  };

  const healthDistributionData = {
    labels: ['Excellent', 'Healthy', 'Needs Attention', 'At Risk'],
    datasets: [
      {
        data: [
          partners.filter(p => p.relationshipHealth.status === 'excellent').length,
          partners.filter(p => p.relationshipHealth.status === 'healthy').length,
          partners.filter(p => p.relationshipHealth.status === 'needs_attention').length,
          partners.filter(p => p.relationshipHealth.status === 'at_risk').length
        ],
        backgroundColor: [
          HEALTH_COLORS.excellent,
          HEALTH_COLORS.healthy,
          HEALTH_COLORS.needs_attention,
          HEALTH_COLORS.at_risk
        ]
      }
    ]
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Partner Portfolio Management
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Comprehensive partner directory with relationship health and performance analytics
      </Typography>

      {/* Filters and Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search partners..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                label="Category"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="FinOps">FinOps</MenuItem>
                <MenuItem value="Security">Security</MenuItem>
                <MenuItem value="Observability">Observability</MenuItem>
                <MenuItem value="DevOps">DevOps</MenuItem>
                <MenuItem value="Data">Data</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={2} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="health-label">Health</InputLabel>
              <Select
                labelId="health-label"
                label="Health"
                value={filters.health}
                onChange={(e) => setFilters({...filters, health: e.target.value})}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="excellent">Excellent</MenuItem>
                <MenuItem value="healthy">Healthy</MenuItem>
                <MenuItem value="needs_attention">Needs Attention</MenuItem>
                <MenuItem value="at_risk">At Risk</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={2} lg={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="tier-label">Tier</InputLabel>
              <Select
                labelId="tier-label"
                label="Tier"
                value={filters.tier}
                onChange={(e) => setFilters({...filters, tier: e.target.value})}
              >
                <MenuItem value="all">All Tiers</MenuItem>
                <MenuItem value="strategic">Strategic</MenuItem>
                <MenuItem value="tactical">Tactical</MenuItem>
                <MenuItem value="emerging">Emerging</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={2} lg={1.5}>
            <Button
              fullWidth
              startIcon={<Compare />}
              onClick={() => setCompareMode(!compareMode)}
              variant={compareMode ? 'contained' : 'outlined'}
              size="small"
            >
              Compare ({selectedForComparison.length})
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2} lg={1.5}>
            <Button
              startIcon={<FilterList />}
              onClick={() => setFilters({ category: 'all', health: 'all', tier: 'all', search: '' })}
              size="small"
              variant="outlined"
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2} lg={1.5}>
            <Button
              startIcon={<Add />}
              size="small"
              variant="contained"
              fullWidth
            >
              Add Partner
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Directory" />
        <Tab label="Analytics" />
        <Tab label="Health Dashboard" />
      </Tabs>

      {selectedTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Partner</TableCell>
                <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Health</TableCell>
                <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                  <TableSortLabel
                    active={sortBy === 'quarterlyRevenue'}
                    direction={sortOrder}
                    onClick={() => handleSort('quarterlyRevenue')}
                  >
                    Q Revenue
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                  <TableSortLabel
                    active={sortBy === 'activeOpportunities'}
                    direction={sortOrder}
                    onClick={() => handleSort('activeOpportunities')}
                  >
                    Active Opps
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Next Action</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPartners.map((partner) => (
                <TableRow
                  key={partner.id}
                  sx={{
                    backgroundColor: selectedForComparison.includes(partner.id) ? 'primary.50' : 'inherit',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                  onClick={() => {
                    if (compareMode) {
                      handleCompareToggle(partner.id);
                    } else {
                      setSelectedPartner(partner);
                      setIsEditMode(false);
                      setPartnerDialogOpen(true);
                    }
                  }}
                >
                  <TableCell sx={{ verticalAlign: 'middle' }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Badge
                        color="primary"
                        variant="dot"
                        invisible={!selectedForComparison.includes(partner.id)}
                      >
                        <Avatar sx={{ bgcolor: CATEGORY_COLORS[partner.category] }}>
                          {partner.name.substring(0, 2)}
                        </Avatar>
                      </Badge>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {partner.name}
                        </Typography>
                        <Box display="flex" gap={0.5} mt={0.5}>
                          <Chip
                            size="small"
                            label={partner.category}
                            sx={{
                              backgroundColor: `${CATEGORY_COLORS[partner.category]}30`,
                              color: CATEGORY_COLORS[partner.category]
                            }}
                          />
                          <Chip
                            size="small"
                            label={partner.tier}
                            variant="outlined"
                            icon={partner.tier === 'strategic' ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'middle' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getHealthIcon(partner.relationshipHealth.status)}
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {partner.relationshipHealth.score}/100
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {partner.relationshipHealth.status.replace('_', ' ')}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'middle' }}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Typography variant="body2" fontWeight="bold">
                        ${(partner.performance.quarterlyRevenue / 1000000).toFixed(1)}M
                      </Typography>
                      {getTrendIcon(partner.performance.trend)}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'middle' }}>
                    <Typography variant="body2" fontWeight="bold">
                      {partner.performance.activeOpportunities}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'middle' }}>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {partner.contacts.find(c => c.isPrimary)?.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {partner.contacts.find(c => c.isPrimary)?.role}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'middle' }}>
                    <Chip
                      size="small"
                      label={new Date(partner.relationshipHealth.nextContactDue) < new Date() ? 'Overdue' : 'Due Soon'}
                      color={new Date(partner.relationshipHealth.nextContactDue) < new Date() ? 'error' : 'warning'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ verticalAlign: 'middle' }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPartner(partner);
                        setIsEditMode(false);
                        setPartnerDialogOpen(true);
                      }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPartner(partner);
                        setIsEditMode(true);
                        setPartnerDialogOpen(true);
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

      {selectedTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>Revenue by Partner</Typography>
                <Box height={400}>
                  <Bar data={revenueChartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context: any) => `$${(context.raw / 1000000).toFixed(1)}M`
                        }
                      }
                    },
                    scales: {
                      y: {
                        ticks: {
                          callback: (value: any) => `$${(value / 1000000).toFixed(1)}M`
                        }
                      }
                    }
                  }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {partners.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Partners
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    ${(partners.reduce((sum, p) => sum + p.performance.quarterlyRevenue, 0) / 1000000).toFixed(1)}M
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Q Revenue
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main" fontWeight="bold">
                    {partners.filter(p => p.relationshipHealth.status === 'at_risk').length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    At Risk Partners
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}

      {selectedTab === 2 && (
        <Grid container spacing={3}>
          {partners.map((partner) => (
            <Grid item xs={12} sm={6} md={4} key={partner.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ bgcolor: CATEGORY_COLORS[partner.category] }}>
                        {partner.name.substring(0, 2)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {partner.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={partner.category}
                          sx={{
                            backgroundColor: `${CATEGORY_COLORS[partner.category]}30`,
                            color: CATEGORY_COLORS[partner.category]
                          }}
                        />
                      </Box>
                    </Box>
                    {getHealthIcon(partner.relationshipHealth.status)}
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" fontWeight="medium" mb={1}>
                      Relationship Health: {partner.relationshipHealth.score}/100
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={partner.relationshipHealth.score}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: HEALTH_COLORS[partner.relationshipHealth.status]
                        }
                      }}
                    />
                  </Box>

                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      Last Contact: {new Date(partner.relationshipHealth.lastInteraction).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Next Due: {new Date(partner.relationshipHealth.nextContactDue).toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight="bold">
                      ${(partner.performance.quarterlyRevenue / 1000000).toFixed(1)}M
                    </Typography>
                    <Button size="small" variant="outlined">
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Partner Details Dialog */}
      <Dialog
        open={partnerDialogOpen}
        onClose={() => {
          setPartnerDialogOpen(false);
          setIsEditMode(false);
        }}
        maxWidth="md"
        fullWidth
      >
        {selectedPartner && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: CATEGORY_COLORS[selectedPartner.category] }}>
                    {selectedPartner.name.substring(0, 2)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedPartner.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedPartner.category} Partner
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={isEditMode ? "Edit Mode" : "View Mode"}
                  color={isEditMode ? "primary" : "default"}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Tabs value={0}>
                <Tab label="Overview" />
                <Tab label="Performance" />
                <Tab label="Contacts" />
                <Tab label="Activity" />
              </Tabs>

              <Box mt={2}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Performance Metrics</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Quarterly Revenue"
                          secondary={`$${(selectedPartner.performance.quarterlyRevenue / 1000000).toFixed(1)}M`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Active Opportunities"
                          secondary={selectedPartner.performance.activeOpportunities}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Average Deal Size"
                          secondary={`$${(selectedPartner.performance.avgDealSize / 1000).toFixed(0)}K`}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Commission Structure</Typography>
                    <List dense>
                      {selectedPartner.commissionStructure.map((commission) => (
                        <ListItem key={commission.id}>
                          <ListItemText
                            primary={`${commission.tier} Tier`}
                            secondary={`${commission.rate}% on $${(commission.threshold / 1000).toFixed(0)}K+`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setPartnerDialogOpen(false);
                setIsEditMode(false);
              }}>
                Close
              </Button>
              {isEditMode ? (
                <Button variant="contained" color="primary">
                  Save Changes
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setIsEditMode(true)}
                  startIcon={<Edit />}
                >
                  Edit Partner
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PartnerPortfolioManagement;