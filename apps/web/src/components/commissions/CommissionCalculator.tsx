import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Slider,
  Tab,
  Tabs,
  LinearProgress
} from '@mui/material';
import {
  Calculate,
  Edit,
  Add,
  Delete,
  ExpandMore,
  Warning,
  CheckCircle,
  History,
  Visibility,
  AttachMoney,
  TrendingUp,
  Save,
  Approval,
  Assignment
} from '@mui/icons-material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip as ChartTooltip, Legend, PointElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, ChartTooltip, Legend);

interface CommissionRule {
  id: string;
  name: string;
  type: 'referral' | 'reseller' | 'msp' | 'custom';
  rate: number;
  minRate?: number;
  maxRate?: number;
  thresholds: {
    amount: number;
    rate: number;
  }[];
  paymentModel: 'one_time' | 'recurring' | 'hybrid';
  currency: string;
  isActive: boolean;
}

interface PartnerAgreement {
  id: string;
  partnerId: string;
  partnerName: string;
  defaultRule: CommissionRule;
  customRules: CommissionRule[];
  volumeTiers: {
    minVolume: number;
    maxVolume: number;
    multiplier: number;
  }[];
  caps: {
    monthly?: number;
    quarterly?: number;
    annual?: number;
  };
  floors: {
    minCommission: number;
    minRate: number;
  };
  effectiveDate: string;
  expiryDate?: string;
  status: 'active' | 'pending_approval' | 'expired' | 'draft';
}

interface CommissionCalculation {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  partnerId: string;
  partnerName: string;
  dealValue: number;
  currency: string;
  appliedRule: CommissionRule;
  calculatedCommission: number;
  effectiveRate: number;
  overrides: {
    reason?: string;
    originalRate: number;
    newRate: number;
    approver?: string;
    timestamp: string;
  }[];
  status: 'calculated' | 'pending_approval' | 'approved' | 'paid';
  milestones: {
    name: string;
    percentage: number;
    amount: number;
    dueDate: string;
    status: 'pending' | 'due' | 'paid';
  }[];
}

interface CommissionForecast {
  period: string;
  totalCommissions: number;
  byPartner: {
    partnerId: string;
    partnerName: string;
    amount: number;
    opportunities: number;
  }[];
  byType: {
    type: string;
    amount: number;
    count: number;
  }[];
  confidence: 'high' | 'medium' | 'low';
}

const COMMISSION_TYPES = {
  referral: { label: 'Referral', defaultRate: 15, minRate: 5, maxRate: 25, color: '#4caf50' },
  reseller: { label: 'Reseller', defaultRate: 30, minRate: 20, maxRate: 50, color: '#2196f3' },
  msp: { label: 'MSP', defaultRate: 25, minRate: 15, maxRate: 40, color: '#ff9800' },
  custom: { label: 'Custom', defaultRate: 20, minRate: 5, maxRate: 50, color: '#9c27b0' }
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

const CommissionCalculator = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [agreements, setAgreements] = useState<PartnerAgreement[]>([]);
  const [calculations, setCalculations] = useState<CommissionCalculation[]>([]);
  const [forecast, setForecast] = useState<CommissionForecast | null>(null);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [agreementDialogOpen, setAgreementDialogOpen] = useState(false);
  const [calculatorDialogOpen, setCalculatorDialogOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<PartnerAgreement | null>(null);

  // Form states
  const [newCalculation, setNewCalculation] = useState({
    opportunityId: '',
    opportunityTitle: '',
    partnerId: '',
    dealValue: 0,
    currency: 'USD',
    customRate: null as number | null,
    overrideReason: ''
  });

  const [newRule, setNewRule] = useState<Partial<CommissionRule>>({
    name: '',
    type: 'referral',
    rate: COMMISSION_TYPES.referral.defaultRate,
    paymentModel: 'one_time',
    currency: 'USD',
    isActive: true,
    thresholds: []
  });

  useEffect(() => {
    loadCommissionData();
  }, []);

  const loadCommissionData = async () => {
    setLoading(true);
    try {
      // Mock data - would be replaced with API calls
      const mockAgreements: PartnerAgreement[] = [
        {
          id: '1',
          partnerId: '1',
          partnerName: 'ACME FinOps Solutions',
          defaultRule: {
            id: 'rule1',
            name: 'Standard Referral',
            type: 'referral',
            rate: 15,
            thresholds: [
              { amount: 100000, rate: 15 },
              { amount: 500000, rate: 18 },
              { amount: 1000000, rate: 20 }
            ],
            paymentModel: 'one_time',
            currency: 'USD',
            isActive: true
          },
          customRules: [],
          volumeTiers: [
            { minVolume: 0, maxVolume: 1000000, multiplier: 1.0 },
            { minVolume: 1000000, maxVolume: 5000000, multiplier: 1.1 },
            { minVolume: 5000000, maxVolume: 999999999, multiplier: 1.2 }
          ],
          caps: { quarterly: 500000, annual: 2000000 },
          floors: { minCommission: 1000, minRate: 10 },
          effectiveDate: '2025-01-01',
          status: 'active'
        },
        {
          id: '2',
          partnerId: '2',
          partnerName: 'SecureGuard Technologies',
          defaultRule: {
            id: 'rule2',
            name: 'Reseller Agreement',
            type: 'reseller',
            rate: 30,
            thresholds: [
              { amount: 50000, rate: 30 },
              { amount: 250000, rate: 32 },
              { amount: 500000, rate: 35 }
            ],
            paymentModel: 'recurring',
            currency: 'USD',
            isActive: true
          },
          customRules: [],
          volumeTiers: [
            { minVolume: 0, maxVolume: 2000000, multiplier: 1.0 },
            { minVolume: 2000000, maxVolume: 999999999, multiplier: 1.15 }
          ],
          caps: { monthly: 100000, quarterly: 300000 },
          floors: { minCommission: 2000, minRate: 25 },
          effectiveDate: '2025-01-01',
          status: 'active'
        }
      ];

      const mockCalculations: CommissionCalculation[] = [
        {
          id: '1',
          opportunityId: 'opp1',
          opportunityTitle: 'GlobalCorp Enterprise Deal',
          partnerId: '1',
          partnerName: 'ACME FinOps Solutions',
          dealValue: 750000,
          currency: 'USD',
          appliedRule: mockAgreements[0].defaultRule,
          calculatedCommission: 135000, // 18% rate for 750k deal
          effectiveRate: 18,
          overrides: [],
          status: 'calculated',
          milestones: [
            { name: 'Contract Signing', percentage: 50, amount: 67500, dueDate: '2025-10-01', status: 'due' },
            { name: 'Go-Live', percentage: 50, amount: 67500, dueDate: '2025-12-01', status: 'pending' }
          ]
        },
        {
          id: '2',
          opportunityId: 'opp2',
          opportunityTitle: 'TechStart Security Package',
          partnerId: '2',
          partnerName: 'SecureGuard Technologies',
          dealValue: 200000,
          currency: 'USD',
          appliedRule: mockAgreements[1].defaultRule,
          calculatedCommission: 60000, // 30% rate
          effectiveRate: 30,
          overrides: [
            {
              reason: 'Strategic partnership bonus',
              originalRate: 30,
              newRate: 35,
              approver: 'John Doe',
              timestamp: '2025-09-10T10:00:00Z'
            }
          ],
          status: 'approved',
          milestones: [
            { name: 'Implementation', percentage: 100, amount: 70000, dueDate: '2025-10-15', status: 'due' }
          ]
        }
      ];

      const mockForecast: CommissionForecast = {
        period: 'Q4 2025',
        totalCommissions: 850000,
        byPartner: [
          { partnerId: '1', partnerName: 'ACME FinOps Solutions', amount: 450000, opportunities: 8 },
          { partnerId: '2', partnerName: 'SecureGuard Technologies', amount: 280000, opportunities: 5 },
          { partnerId: '3', partnerName: 'DataFlow Analytics', amount: 120000, opportunities: 3 }
        ],
        byType: [
          { type: 'referral', amount: 320000, count: 6 },
          { type: 'reseller', amount: 400000, count: 8 },
          { type: 'msp', amount: 130000, count: 2 }
        ],
        confidence: 'high'
      };

      setAgreements(mockAgreements);
      setCalculations(mockCalculations);
      setForecast(mockForecast);
    } catch (error) {
      console.error('Failed to load commission data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCommission = (dealValue: number, rule: CommissionRule, volumeMultiplier = 1.0) => {
    let effectiveRate = rule.rate;

    // Apply threshold-based rates
    for (const threshold of rule.thresholds.reverse()) {
      if (dealValue >= threshold.amount) {
        effectiveRate = threshold.rate;
        break;
      }
    }

    // Apply volume multiplier
    effectiveRate *= volumeMultiplier;

    // Calculate base commission
    const commission = (dealValue * effectiveRate) / 100;

    return {
      commission,
      effectiveRate
    };
  };

  const handleCalculate = () => {
    if (!newCalculation.partnerId || !newCalculation.dealValue) return;

    const agreement = agreements.find(a => a.partnerId === newCalculation.partnerId);
    if (!agreement) return;

    const { commission, effectiveRate } = calculateCommission(
      newCalculation.dealValue,
      agreement.defaultRule
    );

    const calculation: CommissionCalculation = {
      id: `calc_${Date.now()}`,
      opportunityId: newCalculation.opportunityId || `opp_${Date.now()}`,
      opportunityTitle: newCalculation.opportunityTitle || 'Manual Calculation',
      partnerId: newCalculation.partnerId,
      partnerName: agreement.partnerName,
      dealValue: newCalculation.dealValue,
      currency: newCalculation.currency,
      appliedRule: agreement.defaultRule,
      calculatedCommission: newCalculation.customRate
        ? (newCalculation.dealValue * newCalculation.customRate) / 100
        : commission,
      effectiveRate: newCalculation.customRate || effectiveRate,
      overrides: newCalculation.customRate ? [{
        reason: newCalculation.overrideReason || 'Manual override',
        originalRate: effectiveRate,
        newRate: newCalculation.customRate,
        timestamp: new Date().toISOString()
      }] : [],
      status: 'calculated',
      milestones: []
    };

    setCalculations([...calculations, calculation]);
    setCalculatorDialogOpen(false);
    setNewCalculation({
      opportunityId: '',
      opportunityTitle: '',
      partnerId: '',
      dealValue: 0,
      currency: 'USD',
      customRate: null,
      overrideReason: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'calculated': return 'info';
      case 'pending_approval': return 'warning';
      case 'approved': return 'success';
      case 'paid': return 'default';
      default: return 'default';
    }
  };

  const forecastChartData = forecast ? {
    labels: forecast.byPartner.map(p => p.partnerName.split(' ')[0]),
    datasets: [
      {
        label: 'Forecasted Commissions',
        data: forecast.byPartner.map(p => p.amount),
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 1
      }
    ]
  } : null;

  const typeDistributionData = forecast ? {
    labels: forecast.byType.map(t => COMMISSION_TYPES[t.type as keyof typeof COMMISSION_TYPES]?.label || t.type),
    datasets: [
      {
        data: forecast.byType.map(t => t.amount),
        backgroundColor: forecast.byType.map(t => COMMISSION_TYPES[t.type as keyof typeof COMMISSION_TYPES]?.color || '#9e9e9e')
      }
    ]
  } : null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Commission Calculator & Forecasting
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Automated commission calculation with flexible rules and forecasting
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <Button
          startIcon={<Calculate />}
          variant="contained"
          onClick={() => setCalculatorDialogOpen(true)}
        >
          Calculate Commission
        </Button>
        <Button
          startIcon={<Add />}
          variant="outlined"
          onClick={() => setAgreementDialogOpen(true)}
        >
          New Agreement
        </Button>
        <Button
          startIcon={<TrendingUp />}
          variant="outlined"
        >
          Generate Forecast
        </Button>
      </Box>

      <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Calculations" />
        <Tab label="Agreements" />
        <Tab label="Forecasting" />
        <Tab label="Audit Trail" />
      </Tabs>

      {selectedTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Recent Commission Calculations</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Opportunity</TableCell>
                    <TableCell>Partner</TableCell>
                    <TableCell align="right">Deal Value</TableCell>
                    <TableCell align="right">Rate</TableCell>
                    <TableCell align="right">Commission</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calculations.map((calc) => (
                    <TableRow key={calc.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">{calc.opportunityTitle}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {calc.opportunityId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{calc.partnerName}</TableCell>
                      <TableCell align="right">
                        {calc.currency} {calc.dealValue.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" gap={0.5}>
                          {calc.effectiveRate.toFixed(1)}%
                          {calc.overrides.length > 0 && (
                            <Tooltip title="Rate override applied">
                              <Warning color="warning" fontSize="small" />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {calc.currency} {calc.calculatedCommission.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={calc.status.replace('_', ' ')}
                          color={getStatusColor(calc.status) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {selectedTab === 1 && (
        <Grid container spacing={3}>
          {agreements.map((agreement) => (
            <Grid item xs={12} key={agreement.id}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                    <Box>
                      <Typography variant="h6">{agreement.partnerName}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {COMMISSION_TYPES[agreement.defaultRule.type].label} - {agreement.defaultRule.rate}%
                      </Typography>
                    </Box>
                    <Chip
                      label={agreement.status}
                      color={agreement.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>Commission Structure</Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Base Rate"
                            secondary={`${agreement.defaultRule.rate}% (${agreement.defaultRule.paymentModel})`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Currency"
                            secondary={agreement.defaultRule.currency}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Minimum Commission"
                            secondary={`$${agreement.floors.minCommission.toLocaleString()}`}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>Volume Tiers</Typography>
                      <List dense>
                        {agreement.volumeTiers.map((tier, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={`Tier ${index + 1}`}
                              secondary={`$${tier.minVolume.toLocaleString()} - $${tier.maxVolume === 999999999 ? '∞' : tier.maxVolume.toLocaleString()} (${tier.multiplier}x)`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>Threshold Rates</Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Deal Size Threshold</TableCell>
                              <TableCell align="right">Commission Rate</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {agreement.defaultRule.thresholds.map((threshold, index) => (
                              <TableRow key={index}>
                                <TableCell>${threshold.amount.toLocaleString()}+</TableCell>
                                <TableCell align="right">{threshold.rate}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                  <Box mt={2} display="flex" gap={1}>
                    <Button size="small" startIcon={<Edit />}>Edit Agreement</Button>
                    <Button size="small" startIcon={<History />}>View History</Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedTab === 2 && forecast && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Commission Forecast - {forecast.period}</Typography>
                <Box height={400}>
                  {forecastChartData && (
                    <Bar data={forecastChartData} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (context: any) => `$${context.raw.toLocaleString()}`
                          }
                        }
                      },
                      scales: {
                        y: {
                          ticks: {
                            callback: (value: any) => `$${(value / 1000).toFixed(0)}K`
                          }
                        }
                      }
                    }} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    ${(forecast.totalCommissions / 1000).toFixed(0)}K
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Forecast
                  </Typography>
                  <Chip
                    size="small"
                    label={`${forecast.confidence} confidence`}
                    color={forecast.confidence === 'high' ? 'success' : forecast.confidence === 'medium' ? 'warning' : 'error'}
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>By Commission Type</Typography>
                  <List dense>
                    {forecast.byType.map((type) => (
                      <ListItem key={type.type} sx={{ px: 0 }}>
                        <ListItemText
                          primary={COMMISSION_TYPES[type.type as keyof typeof COMMISSION_TYPES]?.label || type.type}
                          secondary={`${type.count} deals`}
                        />
                        <ListItemSecondaryAction>
                          <Typography variant="body2" fontWeight="bold">
                            ${(type.amount / 1000).toFixed(0)}K
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}

      {selectedTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Commission Audit Trail</Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Complete audit trail for all commission calculations and modifications
            </Alert>
            <Typography variant="body2" color="textSecondary">
              Audit trail functionality would show all commission-related activities, approvals, and changes here.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Commission Calculator Dialog */}
      <Dialog open={calculatorDialogOpen} onClose={() => setCalculatorDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Commission Calculator</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Opportunity ID"
                value={newCalculation.opportunityId}
                onChange={(e) => setNewCalculation({...newCalculation, opportunityId: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Opportunity Title"
                value={newCalculation.opportunityTitle}
                onChange={(e) => setNewCalculation({...newCalculation, opportunityTitle: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Partner</InputLabel>
                <Select
                  value={newCalculation.partnerId}
                  onChange={(e) => setNewCalculation({...newCalculation, partnerId: e.target.value})}
                >
                  {agreements.map((agreement) => (
                    <MenuItem key={agreement.partnerId} value={agreement.partnerId}>
                      {agreement.partnerName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={newCalculation.currency}
                  onChange={(e) => setNewCalculation({...newCalculation, currency: e.target.value})}
                >
                  {CURRENCIES.map((currency) => (
                    <MenuItem key={currency} value={currency}>{currency}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Deal Value"
                type="number"
                value={newCalculation.dealValue || ''}
                onChange={(e) => setNewCalculation({...newCalculation, dealValue: parseFloat(e.target.value) || 0})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Custom Rate (%)"
                type="number"
                value={newCalculation.customRate || ''}
                onChange={(e) => setNewCalculation({...newCalculation, customRate: parseFloat(e.target.value) || null})}
                helperText="Leave empty to use default rates"
              />
            </Grid>
            {newCalculation.customRate && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Override Reason"
                  value={newCalculation.overrideReason}
                  onChange={(e) => setNewCalculation({...newCalculation, overrideReason: e.target.value})}
                  multiline
                  rows={2}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalculatorDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCalculate} startIcon={<Calculate />}>
            Calculate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Agreement Dialog */}
      <Dialog open={agreementDialogOpen} onClose={() => setAgreementDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Partner Agreement Configuration</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Agreement configuration interface would be implemented here with full CRUD operations.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAgreementDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save Agreement</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommissionCalculator;