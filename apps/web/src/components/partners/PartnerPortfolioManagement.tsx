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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  LinearProgress,
  Divider,
  Badge,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Error,
  Schedule,
  Add,
  Edit,
  Visibility,
  Star,
  StarBorder
} from '@mui/icons-material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip as ChartTooltip, Legend, PointElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FilterBar } from '../common/FilterBar';
import type { FilterConfig } from '../common/FilterBar';
import { designTokens } from '../../theme/tokens';

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
  const [addPartnerDialogOpen, setAddPartnerDialogOpen] = useState(false);
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

  // Filter configurations for FilterBar component
  const filterConfigs: FilterConfig[] = [
    {
      id: 'search',
      type: 'search',
      placeholder: 'Search partners...',
      value: filters.search,
      onChange: (value) => setFilters({...filters, search: value}),
      gridWidth: { xs: 12, sm: 6, md: 3 }
    },
    {
      id: 'category',
      type: 'select',
      label: 'Category',
      value: filters.category,
      onChange: (value) => setFilters({...filters, category: value}),
      options: [
        { value: 'all', label: 'All Categories' },
        { value: 'FinOps', label: 'FinOps' },
        { value: 'Security', label: 'Security' },
        { value: 'Observability', label: 'Observability' },
        { value: 'DevOps', label: 'DevOps' },
        { value: 'Data', label: 'Data' }
      ],
      gridWidth: { xs: 12, sm: 6, md: 2 }
    },
    {
      id: 'health',
      type: 'select',
      label: 'Health',
      value: filters.health,
      onChange: (value) => setFilters({...filters, health: value}),
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'excellent', label: 'Excellent' },
        { value: 'healthy', label: 'Healthy' },
        { value: 'needs_attention', label: 'Needs Attention' },
        { value: 'at_risk', label: 'At Risk' }
      ],
      gridWidth: { xs: 12, sm: 6, md: 2 }
    },
    {
      id: 'tier',
      type: 'select',
      label: 'Tier',
      value: filters.tier,
      onChange: (value) => setFilters({...filters, tier: value}),
      options: [
        { value: 'all', label: 'All Tiers' },
        { value: 'strategic', label: 'Strategic' },
        { value: 'tactical', label: 'Tactical' },
        { value: 'emerging', label: 'Emerging' }
      ],
      gridWidth: { xs: 12, sm: 6, md: 1.5 }
    }
  ];

  const handleClearFilters = () => {
    setFilters({ category: 'all', health: 'all', tier: 'all', search: '' });
  };

  const filterActions = [
    <Button
      key="add-partner"
      startIcon={<Add />}
      size="small"
      variant="contained"
      fullWidth
      onClick={() => setAddPartnerDialogOpen(true)}
      sx={{
        height: designTokens.components.filter.height.small,
        minHeight: designTokens.components.filter.height.small
      }}
    >
      Add Partner
    </Button>
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100vw', position: 'relative' }}>
      {/* Fixed-width content area - constrained to viewport */}
      <Box sx={{
        p: 3,
        width: '100vw',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: 'background.default'
      }}>
        {/* Modern Clean Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 400 }}>
            Partner Portfolio Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive partner directory with relationship health and performance analytics
          </Typography>
        </Box>

        {/* Unified Filter Bar - Fixed width, doesn't expand */}
        <FilterBar
          filters={filterConfigs}
          actions={filterActions}
          onClearFilters={handleClearFilters}
          showClearButton={true}
        />

        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{ mb: 0, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Directory" sx={{ textTransform: 'none', fontWeight: 400 }} />
          <Tab label="Analytics" sx={{ textTransform: 'none', fontWeight: 400 }} />
          <Tab label="Health Dashboard" sx={{ textTransform: 'none', fontWeight: 400 }} />
        </Tabs>
      </Box>

      {/* Content Area - Scrollable container */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 3, pb: 3 }}>
      {selectedTab === 0 && (
        <TableContainer component={Paper} sx={{ boxShadow: designTokens.components.card.shadow.light }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Partner</TableCell>
                <TableCell>Health</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortBy === 'quarterlyRevenue'}
                    direction={sortOrder}
                    onClick={() => handleSort('quarterlyRevenue')}
                  >
                    Q Revenue
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortBy === 'activeOpportunities'}
                    direction={sortOrder}
                    onClick={() => handleSort('activeOpportunities')}
                  >
                    Active Opps
                  </TableSortLabel>
                </TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Next Action</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPartners.map((partner, index) => (
                <TableRow
                  key={partner.id}
                  sx={{
                    backgroundColor: index % 2 === 0
                      ? 'rgba(0, 0, 0, 0.02)'
                      : 'transparent',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    },
                    transition: 'background-color 0.15s ease'
                  }}
                  onClick={() => {
                    setSelectedPartner(partner);
                    setIsEditMode(false);
                    setPartnerDialogOpen(true);
                  }}
                >
                  <TableCell sx={{ verticalAlign: 'middle' }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: CATEGORY_COLORS[partner.category] }}>
                        {partner.name.substring(0, 2)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {partner.name}
                        </Typography>
                        <Box display="flex" gap={0.5} mt={0.5}>
                          <Chip
                            size="small"
                            label={partner.category}
                            sx={{
                              backgroundColor: `${CATEGORY_COLORS[partner.category]}15`,
                              color: CATEGORY_COLORS[partner.category],
                              fontWeight: 400,
                              borderRadius: '6px',
                              height: '22px'
                            }}
                          />
                          <Chip
                            size="small"
                            label={partner.tier}
                            variant="outlined"
                            icon={partner.tier === 'strategic' ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                            sx={{
                              fontWeight: 400,
                              borderRadius: '6px',
                              height: '22px'
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getHealthIcon(partner.relationshipHealth.status)}
                      <Box>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {partner.relationshipHealth.score}/100
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {partner.relationshipHealth.status.replace('_', ' ')}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                        ${(partner.performance.quarterlyRevenue / 1000000).toFixed(1)}M
                      </Typography>
                      {getTrendIcon(partner.performance.trend)}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                      {partner.performance.activeOpportunities}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {partner.contacts.find(c => c.isPrimary)?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
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
                <Paper sx={{ p: 2, textAlign: 'center', boxShadow: designTokens.components.card.shadow.light }}>
                  <Typography variant="h4" color="primary" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                    {partners.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
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
                            backgroundColor: `${CATEGORY_COLORS[partner.category]}${Math.round(designTokens.components.chip.backgroundOpacity.subtle * 100).toString(16).padStart(2, '0')}`,
                            color: CATEGORY_COLORS[partner.category],
                            fontWeight: designTokens.components.chip.fontWeight.medium
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

      {/* Add Partner Dialog */}
      <Dialog
        open={addPartnerDialogOpen}
        onClose={() => setAddPartnerDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Partner</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Partner Name"
                  required
                  placeholder="Enter partner company name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select label="Category" defaultValue="">
                    <MenuItem value="FinOps">FinOps</MenuItem>
                    <MenuItem value="Security">Security</MenuItem>
                    <MenuItem value="Observability">Observability</MenuItem>
                    <MenuItem value="DevOps">DevOps</MenuItem>
                    <MenuItem value="Data">Data</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tier</InputLabel>
                  <Select label="Tier" defaultValue="">
                    <MenuItem value="strategic">Strategic</MenuItem>
                    <MenuItem value="tactical">Tactical</MenuItem>
                    <MenuItem value="emerging">Emerging</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Website"
                  placeholder="https://example.com"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Contract Status</InputLabel>
                  <Select label="Contract Status" defaultValue="negotiating">
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="negotiating">Negotiating</MenuItem>
                    <MenuItem value="renewal_due">Renewal Due</MenuItem>
                    <MenuItem value="expired">Expired</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>Primary Contact</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  required
                  placeholder="John Doe"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role"
                  required
                  placeholder="VP Partnerships"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  required
                  placeholder="john@example.com"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  placeholder="+1 (555) 123-4567"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPartnerDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              // TODO: Add partner creation logic here
              setAddPartnerDialogOpen(false);
            }}
          >
            Add Partner
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};

export default PartnerPortfolioManagement;