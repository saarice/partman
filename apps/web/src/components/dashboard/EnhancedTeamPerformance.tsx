import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  CircularProgress,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Person,
  TrendingUp,
  TrendingDown,
  Assignment,
  SwapHoriz,
  MoreVert,
  CheckCircle,
  Warning,
  Error,
  Schedule,
  CompareArrows
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartTooltip, Legend);

interface TeamMemberActivity {
  id: string;
  type: 'opportunity_update' | 'status_submission' | 'task_completion' | 'partner_meeting';
  title: string;
  timestamp: string;
  details?: string;
}

interface TeamMemberGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  status: 'on_track' | 'at_risk' | 'behind';
  deadline: string;
}

interface TeamMemberPerformance {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  revenue: {
    current: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
  };
  opportunities: {
    active: number;
    closedThisMonth: number;
    conversionRate: number;
  };
  workload: {
    current: number;
    capacity: number;
    status: 'optimal' | 'overloaded' | 'underutilized';
  };
  goals: TeamMemberGoal[];
  recentActivities: TeamMemberActivity[];
}

const EnhancedTeamPerformance = () => {
  const [teamData, setTeamData] = useState<TeamMemberPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [menuAnchor, setMenuAnchor] = useState<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    loadTeamPerformanceData();
  }, []);

  const loadTeamPerformanceData = async () => {
    setLoading(true);
    try {
      // Mock data - would be replaced with API call
      const mockData: TeamMemberPerformance[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          role: 'Senior Partnership Manager',
          revenue: { current: 1250000, target: 1500000, trend: 'up' },
          opportunities: { active: 12, closedThisMonth: 3, conversionRate: 68.5 },
          workload: { current: 85, capacity: 100, status: 'optimal' },
          goals: [
            { id: '1', title: 'Q4 Revenue Target', target: 1500000, current: 1250000, unit: '$', status: 'on_track', deadline: '2025-12-31' },
            { id: '2', title: 'New Partners Onboarded', target: 5, current: 3, unit: 'partners', status: 'at_risk', deadline: '2025-10-31' }
          ],
          recentActivities: [
            { id: '1', type: 'opportunity_update', title: 'Updated ACME Corp proposal', timestamp: '2025-09-15T10:30:00Z' },
            { id: '2', type: 'partner_meeting', title: 'Meeting with GlobalTech leadership', timestamp: '2025-09-14T14:00:00Z' }
          ]
        },
        {
          id: '2',
          name: 'Mike Davis',
          role: 'Partnership Manager',
          revenue: { current: 890000, target: 1200000, trend: 'up' },
          opportunities: { active: 8, closedThisMonth: 2, conversionRate: 55.2 },
          workload: { current: 95, capacity: 100, status: 'optimal' },
          goals: [
            { id: '3', title: 'Q4 Revenue Target', target: 1200000, current: 890000, unit: '$', status: 'behind', deadline: '2025-12-31' },
            { id: '4', title: 'Partnership Renewals', target: 8, current: 6, unit: 'renewals', status: 'on_track', deadline: '2025-11-30' }
          ],
          recentActivities: [
            { id: '3', type: 'status_submission', title: 'Submitted weekly status report', timestamp: '2025-09-15T09:00:00Z' },
            { id: '4', type: 'task_completion', title: 'Completed partner onboarding checklist', timestamp: '2025-09-14T16:30:00Z' }
          ]
        },
        {
          id: '3',
          name: 'Emily Chen',
          role: 'Junior Partnership Manager',
          revenue: { current: 450000, target: 600000, trend: 'stable' },
          opportunities: { active: 6, closedThisMonth: 1, conversionRate: 42.8 },
          workload: { current: 70, capacity: 100, status: 'underutilized' },
          goals: [
            { id: '5', title: 'Q4 Revenue Target', target: 600000, current: 450000, unit: '$', status: 'on_track', deadline: '2025-12-31' },
            { id: '6', title: 'Skill Development', target: 3, current: 1, unit: 'certifications', status: 'at_risk', deadline: '2025-12-15' }
          ],
          recentActivities: [
            { id: '5', type: 'opportunity_update', title: 'Created new opportunity for TechStart', timestamp: '2025-09-15T11:15:00Z' },
            { id: '6', type: 'partner_meeting', title: 'Initial call with potential partner', timestamp: '2025-09-13T10:00:00Z' }
          ]
        }
      ];

      setTeamData(mockData);
    } catch (error) {
      console.error('Failed to load team performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'success';
      case 'at_risk': return 'warning';
      case 'behind': return 'error';
      case 'optimal': return 'success';
      case 'overloaded': return 'error';
      case 'underutilized': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track': return <CheckCircle color="success" fontSize="small" />;
      case 'at_risk': return <Warning color="warning" fontSize="small" />;
      case 'behind': return <Error color="error" fontSize="small" />;
      default: return <Schedule color="action" fontSize="small" />;
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp color="success" fontSize="small" />;
      case 'down': return <TrendingDown color="error" fontSize="small" />;
      default: return null;
    }
  };

  const handleMenuClick = (memberId: string, event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor({ ...menuAnchor, [memberId]: event.currentTarget });
  };

  const handleMenuClose = (memberId: string) => {
    setMenuAnchor({ ...menuAnchor, [memberId]: null });
  };

  const handleCompareToggle = (memberId: string) => {
    if (selectedForComparison.includes(memberId)) {
      setSelectedForComparison(selectedForComparison.filter(id => id !== memberId));
    } else if (selectedForComparison.length < 3) {
      setSelectedForComparison([...selectedForComparison, memberId]);
    }
  };

  const workloadData = {
    labels: teamData.map(member => member.name.split(' ')[0]),
    datasets: [
      {
        data: teamData.map(member => member.workload.current),
        backgroundColor: teamData.map(member => {
          switch (member.workload.status) {
            case 'optimal': return '#4caf50';
            case 'overloaded': return '#f44336';
            case 'underutilized': return '#2196f3';
            default: return '#9e9e9e';
          }
        }),
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2" fontWeight="bold">
            Team Performance Overview
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              startIcon={<CompareArrows />}
              onClick={() => setCompareMode(!compareMode)}
              variant={compareMode ? 'contained' : 'outlined'}
              size="small"
            >
              Compare ({selectedForComparison.length})
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Workload Distribution */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '300px' }}>
              <Typography variant="h6" mb={2}>Workload Distribution</Typography>
              <Box height="200px" display="flex" justifyContent="center" alignItems="center">
                <Doughnut data={workloadData} options={{
                  plugins: {
                    legend: {
                      position: 'bottom' as const
                    },
                    tooltip: {
                      callbacks: {
                        label: (context: any) => {
                          return `${context.label}: ${context.raw}% capacity`;
                        }
                      }
                    }
                  },
                  maintainAspectRatio: false
                }} />
              </Box>
            </Paper>
          </Grid>

          {/* Team Member Cards */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {teamData.map((member) => (
                <Grid item xs={12} sm={6} lg={4} key={member.id}>
                  <Paper
                    sx={{
                      p: 2,
                      border: selectedForComparison.includes(member.id) ? '2px solid' : '1px solid',
                      borderColor: selectedForComparison.includes(member.id) ? 'primary.main' : 'divider',
                      cursor: compareMode ? 'pointer' : 'default'
                    }}
                    onClick={() => compareMode && handleCompareToggle(member.id)}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Badge
                          color={getStatusColor(member.workload.status) as any}
                          variant="dot"
                          invisible={!compareMode}
                        >
                          <Avatar>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                        </Badge>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {member.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {member.role}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuClick(member.id, e);
                        }}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Revenue Progress */}
                    <Box mb={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" fontWeight="medium">
                          Revenue Progress
                        </Typography>
                        {getTrendIcon(member.revenue.trend)}
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(member.revenue.current / member.revenue.target) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: (member.revenue.current / member.revenue.target) >= 0.8 ? 'success.main' :
                                           (member.revenue.current / member.revenue.target) >= 0.6 ? 'warning.main' : 'error.main'
                          }
                        }}
                      />
                      <Box display="flex" justifyContent="space-between" mt={0.5}>
                        <Typography variant="caption">
                          ${(member.revenue.current / 1000000).toFixed(1)}M
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ${(member.revenue.target / 1000000).toFixed(1)}M target
                        </Typography>
                      </Box>
                    </Box>

                    {/* Key Metrics */}
                    <Grid container spacing={1} mb={2}>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="primary" fontWeight="bold">
                            {member.opportunities.active}
                          </Typography>
                          <Typography variant="caption">Active Opps</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="success.main" fontWeight="bold">
                            {member.opportunities.closedThisMonth}
                          </Typography>
                          <Typography variant="caption">Closed</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="info.main" fontWeight="bold">
                            {member.opportunities.conversionRate}%
                          </Typography>
                          <Typography variant="caption">Conv Rate</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Goals Status */}
                    <Box>
                      <Typography variant="body2" fontWeight="medium" mb={1}>
                        Goals ({member.goals.filter(g => g.status === 'on_track').length}/{member.goals.length} on track)
                      </Typography>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {member.goals.map((goal) => (
                          <Tooltip key={goal.id} title={`${goal.title}: ${goal.current}/${goal.target} ${goal.unit}`}>
                            <Chip
                              size="small"
                              icon={getStatusIcon(goal.status)}
                              label={goal.title.substring(0, 15) + (goal.title.length > 15 ? '...' : '')}
                              color={getStatusColor(goal.status) as any}
                              variant="outlined"
                            />
                          </Tooltip>
                        ))}
                      </Box>
                    </Box>

                    {/* Menu */}
                    <Menu
                      anchorEl={menuAnchor[member.id]}
                      open={Boolean(menuAnchor[member.id])}
                      onClose={() => handleMenuClose(member.id)}
                    >
                      <MenuItem onClick={() => {
                        handleMenuClose(member.id);
                        setSelectedMember(member.id);
                      }}>
                        <Person sx={{ mr: 1 }} />
                        View Details
                      </MenuItem>
                      <MenuItem onClick={() => {
                        handleMenuClose(member.id);
                        setReassignDialogOpen(true);
                      }}>
                        <SwapHoriz sx={{ mr: 1 }} />
                        Reassign Opportunities
                      </MenuItem>
                    </Menu>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Recent Team Activity */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" mb={2}>Recent Team Activity</Typography>
              <List>
                {teamData.flatMap(member =>
                  member.recentActivities.slice(0, 2).map(activity => ({
                    ...activity,
                    memberName: member.name,
                    memberId: member.id
                  }))
                )
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 6)
                .map((activity, index) => (
                  <div key={`${activity.memberId}-${activity.id}`}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {activity.memberName.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={`${activity.memberName} • ${new Date(activity.timestamp).toLocaleDateString()}`}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          size="small"
                          label={activity.type.replace('_', ' ').toUpperCase()}
                          color="primary"
                          variant="outlined"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < 5 && <Divider />}
                  </div>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Reassignment Dialog */}
        <Dialog open={reassignDialogOpen} onClose={() => setReassignDialogOpen(false)}>
          <DialogTitle>Reassign Opportunities</DialogTitle>
          <DialogContent>
            <Typography>
              Opportunity reassignment functionality would be implemented here with drag-and-drop interface.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReassignDialogOpen(false)}>Cancel</Button>
            <Button variant="contained">Save Changes</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EnhancedTeamPerformance;