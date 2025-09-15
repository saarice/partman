import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemIcon,
  IconButton,
  Tooltip,
  Alert,
  Badge,
  Avatar,
  Divider,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Schedule,
  Settings,
  Notifications,
  History,
  Add,
  Edit,
  Phone,
  Email,
  VideocamRounded,
  Business,
  Star,
  StarBorder,
  Assignment,
  ExpandMore,
  CalendarToday,
  BarChart,
  PersonPin,
  ThumbUp,
  ThumbDown,
  Feedback
} from '@mui/icons-material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip as ChartTooltip, Legend, PointElement, RadialLinearScale, ArcElement } from 'chart.js';
import { Line, Radar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, ChartTooltip, Legend, RadialLinearScale, ArcElement);

interface HealthWeights {
  interactionFrequency: number; // 40%
  revenuePerformance: number;   // 30%
  engagementQuality: number;    // 20%
  strategicValue: number;       // 10%
}

interface EngagementRecord {
  id: string;
  type: 'meeting' | 'call' | 'email' | 'event' | 'survey';
  date: string;
  duration?: number; // minutes
  quality: 'high' | 'medium' | 'low';
  notes?: string;
  participants: string[];
  outcome?: string;
}

interface SatisfactionScore {
  id: string;
  date: string;
  overallScore: number; // 1-10
  categories: {
    communication: number;
    support: number;
    partnership: number;
    technical: number;
  };
  feedback?: string;
}

interface MaintenanceAlert {
  id: string;
  partnerId: string;
  type: 'overdue_contact' | 'declining_engagement' | 'revenue_drop' | 'low_satisfaction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggerDate: string;
  actionRequired: string;
  isAcknowledged: boolean;
}

interface RelationshipStatus {
  id: string;
  partnerId: string;
  status: 'excellent' | 'healthy' | 'needs_attention' | 'at_risk';
  healthScore: number;
  components: {
    interactionFrequency: number;
    revenuePerformance: number;
    engagementQuality: number;
    strategicValue: number;
  };
  lastInteraction: string;
  nextActionDue: string;
  priority: 'strategic' | 'high' | 'medium' | 'low';
  satisfactionTrend: 'improving' | 'stable' | 'declining';
}

interface PartnerRelationshipData {
  partnerId: string;
  partnerName: string;
  tier: 'strategic' | 'tactical' | 'emerging';
  category: string;
  status: RelationshipStatus;
  engagementHistory: EngagementRecord[];
  satisfactionHistory: SatisfactionScore[];
  alerts: MaintenanceAlert[];
  keyContact: {
    name: string;
    role: string;
    lastContact: string;
  };
}

const DEFAULT_WEIGHTS: HealthWeights = {
  interactionFrequency: 40,
  revenuePerformance: 30,
  engagementQuality: 20,
  strategicValue: 10
};

const ALERT_COLORS = {
  low: '#4caf50',
  medium: '#ff9800',
  high: '#f44336',
  critical: '#d32f2f'
};

const TREND_ICONS = {
  improving: <TrendingUp color="success" fontSize="small" />,
  stable: <CheckCircle color="info" fontSize="small" />,
  declining: <TrendingDown color="error" fontSize="small" />
};

const RelationshipHealthTracking = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [partnersData, setPartnersData] = useState<PartnerRelationshipData[]>([]);
  const [healthWeights, setHealthWeights] = useState<HealthWeights>(DEFAULT_WEIGHTS);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
  const [engagementDialogOpen, setEngagementDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerRelationshipData | null>(null);

  // Form states
  const [newEngagement, setNewEngagement] = useState({
    type: 'meeting' as const,
    date: new Date().toISOString().split('T')[0],
    duration: 60,
    quality: 'medium' as const,
    notes: '',
    outcome: ''
  });

  const [statusUpdate, setStatusUpdate] = useState({
    notes: '',
    nextAction: '',
    nextActionDate: '',
    priority: 'medium' as const
  });

  useEffect(() => {
    loadRelationshipData();
  }, [healthWeights]);

  const loadRelationshipData = async () => {
    setLoading(true);
    try {
      // Mock data - would be replaced with API call
      const mockData: PartnerRelationshipData[] = [
        {
          partnerId: '1',
          partnerName: 'ACME FinOps Solutions',
          tier: 'strategic',
          category: 'FinOps',
          status: {
            id: 'status1',
            partnerId: '1',
            status: 'excellent',
            healthScore: 92,
            components: {
              interactionFrequency: 95,
              revenuePerformance: 88,
              engagementQuality: 92,
              strategicValue: 98
            },
            lastInteraction: '2025-09-12T14:30:00Z',
            nextActionDue: '2025-10-12T00:00:00Z',
            priority: 'strategic',
            satisfactionTrend: 'improving'
          },
          engagementHistory: [
            {
              id: 'eng1',
              type: 'meeting',
              date: '2025-09-12T14:30:00Z',
              duration: 90,
              quality: 'high',
              notes: 'Quarterly business review - discussed expansion opportunities',
              participants: ['John Smith', 'Sarah Johnson'],
              outcome: 'Identified 3 new integration opportunities'
            },
            {
              id: 'eng2',
              type: 'call',
              date: '2025-09-05T10:00:00Z',
              duration: 30,
              quality: 'medium',
              notes: 'Technical support discussion',
              participants: ['Mike Tech'],
              outcome: 'Resolved integration issue'
            }
          ],
          satisfactionHistory: [
            {
              id: 'sat1',
              date: '2025-09-01T00:00:00Z',
              overallScore: 9,
              categories: {
                communication: 9,
                support: 8,
                partnership: 10,
                technical: 8
              },
              feedback: 'Excellent partnership, very responsive team'
            }
          ],
          alerts: [],
          keyContact: {
            name: 'John Smith',
            role: 'VP Partnerships',
            lastContact: '2025-09-12T14:30:00Z'
          }
        },
        {
          partnerId: '2',
          partnerName: 'SecureGuard Technologies',
          tier: 'strategic',
          category: 'Security',
          status: {
            id: 'status2',
            partnerId: '2',
            status: 'needs_attention',
            healthScore: 68,
            components: {
              interactionFrequency: 45,
              revenuePerformance: 85,
              engagementQuality: 70,
              strategicValue: 90
            },
            lastInteraction: '2025-08-15T09:00:00Z',
            nextActionDue: '2025-09-20T00:00:00Z',
            priority: 'high',
            satisfactionTrend: 'declining'
          },
          engagementHistory: [
            {
              id: 'eng3',
              type: 'email',
              date: '2025-08-15T09:00:00Z',
              quality: 'low',
              notes: 'Follow-up email - no response yet',
              participants: ['Mike Davis']
            }
          ],
          satisfactionHistory: [
            {
              id: 'sat2',
              date: '2025-08-01T00:00:00Z',
              overallScore: 6,
              categories: {
                communication: 5,
                support: 7,
                partnership: 6,
                technical: 7
              },
              feedback: 'Communication has been slow recently'
            }
          ],
          alerts: [
            {
              id: 'alert1',
              partnerId: '2',
              type: 'overdue_contact',
              severity: 'high',
              message: 'No interaction in 30+ days with strategic partner',
              triggerDate: '2025-09-15T00:00:00Z',
              actionRequired: 'Schedule immediate check-in meeting',
              isAcknowledged: false
            },
            {
              id: 'alert2',
              partnerId: '2',
              type: 'declining_engagement',
              severity: 'medium',
              message: 'Partner satisfaction scores declining',
              triggerDate: '2025-09-10T00:00:00Z',
              actionRequired: 'Conduct satisfaction survey and address concerns',
              isAcknowledged: false
            }
          ],
          keyContact: {
            name: 'Mike Davis',
            role: 'Director of Partnerships',
            lastContact: '2025-08-15T09:00:00Z'
          }
        }
      ];

      setPartnersData(mockData);
    } catch (error) {
      console.error('Failed to load relationship data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateHealthScore = (components: any, weights: HealthWeights) => {
    return Math.round(
      (components.interactionFrequency * weights.interactionFrequency / 100) +
      (components.revenuePerformance * weights.revenuePerformance / 100) +
      (components.engagementQuality * weights.engagementQuality / 100) +
      (components.strategicValue * weights.strategicValue / 100)
    );
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#8bc34a';
    if (score >= 50) return '#ff9800';
    return '#f44336';
  };

  const getHealthStatus = (score: number) => {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'healthy';
    if (score >= 50) return 'needs_attention';
    return 'at_risk';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'strategic': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const handleAddEngagement = () => {
    if (!selectedPartner) return;

    const engagement: EngagementRecord = {
      id: `eng_${Date.now()}`,
      type: newEngagement.type,
      date: new Date(newEngagement.date).toISOString(),
      duration: newEngagement.duration,
      quality: newEngagement.quality,
      notes: newEngagement.notes,
      participants: ['Current User'], // Would get from auth
      outcome: newEngagement.outcome
    };

    const updatedPartners = partnersData.map(partner => {
      if (partner.partnerId === selectedPartner.partnerId) {
        return {
          ...partner,
          engagementHistory: [engagement, ...partner.engagementHistory]
        };
      }
      return partner;
    });

    setPartnersData(updatedPartners);
    setEngagementDialogOpen(false);
    setNewEngagement({
      type: 'meeting',
      date: new Date().toISOString().split('T')[0],
      duration: 60,
      quality: 'medium',
      notes: '',
      outcome: ''
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    const updatedPartners = partnersData.map(partner => ({
      ...partner,
      alerts: partner.alerts.map(alert =>
        alert.id === alertId ? { ...alert, isAcknowledged: true } : alert
      )
    }));
    setPartnersData(updatedPartners);
  };

  const activeAlerts = partnersData.flatMap(p => p.alerts.filter(a => !a.isAcknowledged));

  const healthDistributionData = {
    labels: ['Excellent', 'Healthy', 'Needs Attention', 'At Risk'],
    datasets: [{
      data: [
        partnersData.filter(p => p.status.healthScore >= 90).length,
        partnersData.filter(p => p.status.healthScore >= 70 && p.status.healthScore < 90).length,
        partnersData.filter(p => p.status.healthScore >= 50 && p.status.healthScore < 70).length,
        partnersData.filter(p => p.status.healthScore < 50).length
      ],
      backgroundColor: ['#4caf50', '#8bc34a', '#ff9800', '#f44336']
    }]
  };

  const satisfactionTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: partnersData.map((partner, index) => ({
      label: partner.partnerName,
      data: [7.5, 8.0, 7.8, 8.2, 8.5, partner.satisfactionHistory[0]?.overallScore || 8.0],
      borderColor: `hsl(${index * 137.5}, 70%, 50%)`,
      backgroundColor: `hsla(${index * 137.5}, 70%, 50%, 0.1)`,
      tension: 0.4
    }))
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Partner Relationship Health Tracking
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Systematic relationship maintenance with automated alerts and health monitoring
      </Typography>

      {/* Alert Banner */}
      {activeAlerts.length > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small">
              View All ({activeAlerts.length})
            </Button>
          }
        >
          {activeAlerts.length} relationship maintenance {activeAlerts.length === 1 ? 'alert' : 'alerts'} require attention
        </Alert>
      )}

      <Box display="flex" gap={2} mb={3}>
        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={() => setEngagementDialogOpen(true)}
          disabled={!selectedPartner}
        >
          Log Engagement
        </Button>
        <Button
          startIcon={<Settings />}
          variant="outlined"
          onClick={() => setConfigDialogOpen(true)}
        >
          Configure Health Scoring
        </Button>
        <Button
          startIcon={<Notifications />}
          variant="outlined"
          color={activeAlerts.length > 0 ? 'warning' : 'inherit'}
        >
          <Badge badgeContent={activeAlerts.length} color="error">
            Alerts
          </Badge>
        </Button>
      </Box>

      <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Health Dashboard" />
        <Tab label="Maintenance Alerts" />
        <Tab label="Engagement Tracking" />
        <Tab label="Satisfaction Analysis" />
      </Tabs>

      {selectedTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Health Distribution</Typography>
              <Box height={200}>
                <Doughnut data={healthDistributionData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Partner Health Overview</Typography>
              <List>
                {partnersData.map((partner) => (
                  <div key={partner.partnerId}>
                    <ListItem
                      button
                      onClick={() => setSelectedPartner(partner)}
                      sx={{
                        border: selectedPartner?.partnerId === partner.partnerId ? '2px solid' : '1px solid',
                        borderColor: selectedPartner?.partnerId === partner.partnerId ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: getHealthColor(partner.status.healthScore) }}>
                          {partner.status.healthScore}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {partner.partnerName}
                            </Typography>
                            <Chip
                              size="small"
                              label={partner.tier}
                              color={getPriorityColor(partner.status.priority) as any}
                              variant="outlined"
                            />
                            {partner.alerts.filter(a => !a.isAcknowledged).length > 0 && (
                              <Badge badgeContent={partner.alerts.filter(a => !a.isAcknowledged).length} color="error">
                                <Warning color="warning" fontSize="small" />
                              </Badge>
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Last contact: {new Date(partner.status.lastInteraction).toLocaleDateString()}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                              <Typography variant="caption">Satisfaction trend:</Typography>
                              {TREND_ICONS[partner.status.satisfactionTrend]}
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box textAlign="center">
                          <LinearProgress
                            variant="determinate"
                            value={partner.status.healthScore}
                            sx={{
                              width: 80,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                backgroundColor: getHealthColor(partner.status.healthScore)
                              }
                            }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            Health Score
                          </Typography>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </div>
                ))}
              </List>
            </Paper>
          </Grid>

          {selectedPartner && (
            <Grid item xs={12}>
              <Accordion expanded>
                <AccordionSummary>
                  <Typography variant="h6">
                    {selectedPartner.partnerName} - Detailed Health Analysis
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>Health Components</Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="Interaction Frequency" secondary={`${selectedPartner.status.components.interactionFrequency}% (Weight: ${healthWeights.interactionFrequency}%)`} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Revenue Performance" secondary={`${selectedPartner.status.components.revenuePerformance}% (Weight: ${healthWeights.revenuePerformance}%)`} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Engagement Quality" secondary={`${selectedPartner.status.components.engagementQuality}% (Weight: ${healthWeights.engagementQuality}%)`} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Strategic Value" secondary={`${selectedPartner.status.components.strategicValue}% (Weight: ${healthWeights.strategicValue}%)`} />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>Recent Activity</Typography>
                      <List dense>
                        {selectedPartner.engagementHistory.slice(0, 3).map((engagement) => (
                          <ListItem key={engagement.id}>
                            <ListItemIcon>
                              {engagement.type === 'meeting' && <VideocamRounded fontSize="small" />}
                              {engagement.type === 'call' && <Phone fontSize="small" />}
                              {engagement.type === 'email' && <Email fontSize="small" />}
                            </ListItemIcon>
                            <ListItemText
                              primary={engagement.notes || `${engagement.type} - ${engagement.quality} quality`}
                              secondary={new Date(engagement.date).toLocaleDateString()}
                            />
                          </ListItem>
                        ))}
                      </List>
                      <Button
                        size="small"
                        startIcon={<Add />}
                        onClick={() => setEngagementDialogOpen(true)}
                      >
                        Add Engagement
                      </Button>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          )}
        </Grid>
      )}

      {selectedTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Active Maintenance Alerts</Typography>
            {activeAlerts.length === 0 ? (
              <Alert severity="success">No active maintenance alerts</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Partner</TableCell>
                      <TableCell>Alert Type</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell>Action Required</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeAlerts.map((alert) => {
                      const partner = partnersData.find(p => p.partnerId === alert.partnerId);
                      return (
                        <TableRow key={alert.id}>
                          <TableCell>{partner?.partnerName}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={alert.type.replace('_', ' ').toUpperCase()}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={alert.severity.toUpperCase()}
                              sx={{
                                backgroundColor: ALERT_COLORS[alert.severity],
                                color: 'white'
                              }}
                            />
                          </TableCell>
                          <TableCell>{alert.message}</TableCell>
                          <TableCell>{alert.actionRequired}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Engagement History</Typography>
            {selectedPartner ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Quality</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Outcome</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPartner.engagementHistory.map((engagement) => (
                      <TableRow key={engagement.id}>
                        <TableCell>{new Date(engagement.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip size="small" label={engagement.type} />
                        </TableCell>
                        <TableCell>{engagement.duration ? `${engagement.duration}min` : '-'}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={engagement.quality}
                            color={
                              engagement.quality === 'high' ? 'success' :
                              engagement.quality === 'medium' ? 'warning' : 'error'
                            }
                          />
                        </TableCell>
                        <TableCell>{engagement.notes}</TableCell>
                        <TableCell>{engagement.outcome}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">Select a partner to view engagement history</Alert>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Satisfaction Trend Analysis</Typography>
                <Box height={400}>
                  <Line data={satisfactionTrendData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' }
                    },
                    scales: {
                      y: {
                        min: 0,
                        max: 10,
                        title: { display: true, text: 'Satisfaction Score' }
                      }
                    }
                  }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Latest Satisfaction Scores</Typography>
              <List>
                {partnersData.map((partner) => (
                  <ListItem key={partner.partnerId}>
                    <ListItemText
                      primary={partner.partnerName}
                      secondary={`Score: ${partner.satisfactionHistory[0]?.overallScore || 'N/A'}/10`}
                    />
                    <ListItemSecondaryAction>
                      {TREND_ICONS[partner.status.satisfactionTrend]}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Health Scoring Configuration</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>Interaction Frequency Weight: {healthWeights.interactionFrequency}%</Typography>
            <Slider
              value={healthWeights.interactionFrequency}
              onChange={(_, value) => setHealthWeights({...healthWeights, interactionFrequency: value as number})}
              min={0}
              max={100}
              marks
              valueLabelDisplay="auto"
            />

            <Typography gutterBottom sx={{ mt: 3 }}>Revenue Performance Weight: {healthWeights.revenuePerformance}%</Typography>
            <Slider
              value={healthWeights.revenuePerformance}
              onChange={(_, value) => setHealthWeights({...healthWeights, revenuePerformance: value as number})}
              min={0}
              max={100}
              marks
              valueLabelDisplay="auto"
            />

            <Typography gutterBottom sx={{ mt: 3 }}>Engagement Quality Weight: {healthWeights.engagementQuality}%</Typography>
            <Slider
              value={healthWeights.engagementQuality}
              onChange={(_, value) => setHealthWeights({...healthWeights, engagementQuality: value as number})}
              min={0}
              max={100}
              marks
              valueLabelDisplay="auto"
            />

            <Typography gutterBottom sx={{ mt: 3 }}>Strategic Value Weight: {healthWeights.strategicValue}%</Typography>
            <Slider
              value={healthWeights.strategicValue}
              onChange={(_, value) => setHealthWeights({...healthWeights, strategicValue: value as number})}
              min={0}
              max={100}
              marks
              valueLabelDisplay="auto"
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              Total weight: {Object.values(healthWeights).reduce((a, b) => a + b, 0)}% (should equal 100%)
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setConfigDialogOpen(false);
              loadRelationshipData();
            }}
          >
            Apply Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Engagement Dialog */}
      <Dialog open={engagementDialogOpen} onClose={() => setEngagementDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log New Engagement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Engagement Type</InputLabel>
                <Select
                  value={newEngagement.type}
                  onChange={(e) => setNewEngagement({...newEngagement, type: e.target.value as any})}
                >
                  <MenuItem value="meeting">Meeting</MenuItem>
                  <MenuItem value="call">Phone Call</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="event">Event</MenuItem>
                  <MenuItem value="survey">Survey</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={newEngagement.date}
                onChange={(e) => setNewEngagement({...newEngagement, date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={newEngagement.duration}
                onChange={(e) => setNewEngagement({...newEngagement, duration: parseInt(e.target.value)})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Quality</InputLabel>
                <Select
                  value={newEngagement.quality}
                  onChange={(e) => setNewEngagement({...newEngagement, quality: e.target.value as any})}
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={newEngagement.notes}
                onChange={(e) => setNewEngagement({...newEngagement, notes: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Outcome"
                value={newEngagement.outcome}
                onChange={(e) => setNewEngagement({...newEngagement, outcome: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEngagementDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddEngagement}>
            Log Engagement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RelationshipHealthTracking;