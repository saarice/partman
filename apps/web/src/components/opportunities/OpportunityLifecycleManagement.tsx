import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  Tooltip,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Checkbox,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Divider
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Timeline,
  TrendingUp,
  Schedule,
  AttachMoney,
  Person,
  Business,
  FileCopy,
  History,
  Warning,
  CheckCircle,
  PlayArrow,
  Pause,
  Stop,
  ExpandMore,
  Visibility,
  Assignment,
  CalendarToday,
  Group,
  FilterList,
  Search,
  GetApp
} from '@mui/icons-material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip as ChartTooltip, Legend, PointElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, ChartTooltip, Legend);

interface OpportunityStage {
  id: string;
  name: string;
  probability: number;
  color: string;
  order: number;
  isActive: boolean;
}

interface OpportunityHistory {
  id: string;
  action: 'created' | 'stage_changed' | 'value_updated' | 'assigned' | 'note_added' | 'closed';
  timestamp: string;
  userId: string;
  userName: string;
  details: {
    fromStage?: string;
    toStage?: string;
    fromValue?: number;
    toValue?: number;
    fromAssignee?: string;
    toAssignee?: string;
    note?: string;
    reason?: string;
  };
}

interface Opportunity {
  id: string;
  title: string;
  description?: string;
  customer: {
    name: string;
    company: string;
    email: string;
    phone?: string;
  };
  partnerId?: string;
  partnerName?: string;
  value: number; // ARR (Annual Recurring Revenue)
  currency: string;
  probability: number;
  stage: string;
  expectedCloseDate: string;
  actualCloseDate?: string;
  assignedTo: string;
  assignedToName: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'won' | 'lost' | 'on_hold';
  lostReason?: string;
  createdDate: string;
  lastUpdated: string;
  history: OpportunityHistory[];
  notes: {
    id: string;
    content: string;
    author: string;
    timestamp: string;
  }[];
  weightedValue: number;
  daysInStage: number;
  isOverdue: boolean;
  commissionRate: number; // Commission percentage (15%, 20%, 30%)
  estimatedCommission: number; // Calculated commission amount
  dealType: 'new_business' | 'expansion' | 'renewal'; // Affects commission rate
}

const PIPELINE_STAGES: OpportunityStage[] = [
  { id: 'lead', name: 'Lead', probability: 10, color: '#f44336', order: 0, isActive: true },
  { id: 'demo', name: 'Demo', probability: 25, color: '#ff9800', order: 1, isActive: true },
  { id: 'poc', name: 'POC', probability: 50, color: '#2196f3', order: 2, isActive: true },
  { id: 'proposal', name: 'Proposal', probability: 75, color: '#4caf50', order: 3, isActive: true },
  { id: 'closed_won', name: 'Closed Won', probability: 100, color: '#388e3c', order: 4, isActive: true },
  { id: 'closed_lost', name: 'Closed Lost', probability: 0, color: '#757575', order: 5, isActive: true }
];

const PRIORITIES = {
  low: { label: 'Low', color: 'default' },
  medium: { label: 'Medium', color: 'primary' },
  high: { label: 'High', color: 'warning' },
  critical: { label: 'Critical', color: 'error' }
};

const DEAL_TYPES = {
  new_business: { label: 'New Business', commissionRate: 30 },
  expansion: { label: 'Expansion', commissionRate: 20 },
  renewal: { label: 'Renewal', commissionRate: 15 }
};

const calculateCommission = (value: number, dealType: string) => {
  const rate = DEAL_TYPES[dealType as keyof typeof DEAL_TYPES]?.commissionRate || 15;
  return (value * rate) / 100;
};

const STAGE_VALIDATION_RULES = {
  'lead': {
    nextStages: ['demo', 'closed_lost'],
    requiredFields: ['customer.name', 'customer.email', 'customer.company'],
    description: 'Customer contact information required',
    checklist: [
      'Initial contact established',
      'Customer needs identified',
      'Budget range confirmed',
      'Decision timeline discussed'
    ]
  },
  'demo': {
    nextStages: ['poc', 'closed_lost'],
    requiredFields: ['customer.name', 'customer.email', 'customer.company', 'customer.phone'],
    description: 'Technical contact and requirements documentation required',
    checklist: [
      'Demo completed successfully',
      'Technical contact identified',
      'Requirements documented',
      'Next steps defined'
    ]
  },
  'poc': {
    nextStages: ['proposal', 'closed_lost'],
    requiredFields: ['customer.name', 'customer.email', 'customer.company', 'description'],
    description: 'POC success criteria and results documented',
    checklist: [
      'POC scope agreed upon',
      'Success criteria defined',
      'Technical evaluation completed',
      'Stakeholders aligned'
    ]
  },
  'proposal': {
    nextStages: ['closed_won', 'closed_lost'],
    requiredFields: ['customer.name', 'customer.email', 'customer.company', 'description', 'expectedCloseDate'],
    description: 'Decision maker approval and contract terms finalized',
    checklist: [
      'Proposal submitted',
      'Pricing approved',
      'Contract terms agreed',
      'Decision maker engaged'
    ]
  },
  'closed_won': {
    nextStages: [],
    requiredFields: [],
    description: 'Deal successfully closed',
    checklist: [
      'Contract signed',
      'Payment terms confirmed',
      'Implementation plan created',
      'Handoff to delivery team completed'
    ]
  },
  'closed_lost': {
    nextStages: [],
    requiredFields: ['lostReason'],
    description: 'Opportunity lost with reason tracking',
    checklist: [
      'Loss reason documented',
      'Lessons learned captured',
      'Future engagement opportunities noted',
      'Competitive intelligence gathered'
    ]
  }
};

const validateStageProgression = (opportunity: Opportunity, newStage: string): { isValid: boolean; message: string; missingFields: string[] } => {
  const currentStageRules = STAGE_VALIDATION_RULES[opportunity.stage as keyof typeof STAGE_VALIDATION_RULES];

  // Check if the new stage is allowed
  if (!currentStageRules.nextStages.includes(newStage)) {
    return {
      isValid: false,
      message: `Cannot move directly from ${getStageName(opportunity.stage)} to ${getStageName(newStage)}`,
      missingFields: []
    };
  }

  // Check required fields for the new stage
  const newStageRules = STAGE_VALIDATION_RULES[newStage as keyof typeof STAGE_VALIDATION_RULES];
  const missingFields: string[] = [];

  newStageRules.requiredFields.forEach(field => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (!opportunity[parent as keyof Opportunity] || !(opportunity[parent as keyof Opportunity] as any)[child]) {
        missingFields.push(field);
      }
    } else {
      if (!opportunity[field as keyof Opportunity]) {
        missingFields.push(field);
      }
    }
  });

  return {
    isValid: missingFields.length === 0,
    message: missingFields.length > 0
      ? `Missing required fields: ${missingFields.map(f => f.replace('.', ' ')).join(', ')}`
      : 'Stage progression validated successfully',
    missingFields
  };
};

const OpportunityLifecycleManagement = () => {
  const [searchParams] = useSearchParams();
  const stageFromUrl = searchParams.get('stage');

  const [selectedTab, setSelectedTab] = useState(0);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([]);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [pendingStageChange, setPendingStageChange] = useState<{opportunityId: string; newStage: string} | null>(null);
  const [validationResult, setValidationResult] = useState<{isValid: boolean; message: string; missingFields: string[]} | null>(null);

  // Form states
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    description: '',
    customerName: '',
    customerCompany: '',
    customerEmail: '',
    customerPhone: '',
    partnerId: '',
    value: 0,
    currency: 'USD',
    stage: 'lead',
    expectedCloseDate: '',
    assignedTo: 'current_user',
    priority: 'medium' as const,
    tags: [] as string[],
    notes: '',
    dealType: 'new_business' as const
  });

  // Filter states
  const [filters, setFilters] = useState({
    stage: stageFromUrl || 'all',
    assignee: 'all',
    priority: 'all',
    partner: 'all',
    search: '',
    showOverdue: false
  });

  const [bulkAction, setBulkAction] = useState({
    type: 'stage_change' as 'stage_change' | 'reassign' | 'update_priority',
    newStage: 'demo',
    newAssignee: '',
    newPriority: 'medium' as const
  });

  const [menuAnchor, setMenuAnchor] = useState<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    console.log('OpportunityLifecycleManagement component mounted');
    loadOpportunities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [opportunities, filters]);

  const calculateOpportunityMetrics = (opportunity: Opportunity) => {
    const now = new Date();
    const expectedClose = new Date(opportunity.expectedCloseDate);
    const isOverdue = now > expectedClose && opportunity.stage !== 'closed_won' && opportunity.stage !== 'closed_lost';

    // Calculate days in current stage based on last stage change
    const lastStageChange = opportunity.history
      .filter(h => h.action === 'stage_changed')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    const stageStartDate = lastStageChange
      ? new Date(lastStageChange.timestamp)
      : new Date(opportunity.createdDate);

    const daysInStage = Math.floor((now.getTime() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      ...opportunity,
      isOverdue,
      daysInStage
    };
  };

  const loadOpportunities = async () => {
    console.log('Loading opportunities...');
    setLoading(true);
    try {
      // Mock data - would be replaced with API call
      const mockOpportunities: Opportunity[] = [
        {
          id: '1',
          title: 'GlobalCorp Enterprise Deal',
          description: 'Large enterprise deployment for cost optimization',
          customer: {
            name: 'Jane Smith',
            company: 'GlobalCorp Inc.',
            email: 'jane.smith@globalcorp.com',
            phone: '+1-555-0123'
          },
          partnerId: '1',
          partnerName: 'ACME FinOps Solutions',
          value: 750000,
          currency: 'USD',
          probability: 75,
          stage: 'proposal',
          expectedCloseDate: '2025-10-15',
          assignedTo: 'user1',
          assignedToName: 'John Doe',
          tags: ['Enterprise', 'Strategic'],
          priority: 'high',
          status: 'active',
          createdDate: '2025-08-01T10:00:00Z',
          lastUpdated: '2025-09-10T14:30:00Z',
          weightedValue: 562500,
          daysInStage: 15,
          isOverdue: false,
          dealType: 'new_business' as const,
          commissionRate: 30,
          estimatedCommission: 225000,
          history: [
            {
              id: 'h1',
              action: 'created',
              timestamp: '2025-08-01T10:00:00Z',
              userId: 'user1',
              userName: 'John Doe',
              details: {}
            },
            {
              id: 'h2',
              action: 'stage_changed',
              timestamp: '2025-08-15T11:00:00Z',
              userId: 'user1',
              userName: 'John Doe',
              details: { fromStage: 'lead', toStage: 'demo' }
            },
            {
              id: 'h3',
              action: 'stage_changed',
              timestamp: '2025-09-01T09:00:00Z',
              userId: 'user1',
              userName: 'John Doe',
              details: { fromStage: 'demo', toStage: 'poc' }
            },
            {
              id: 'h4',
              action: 'stage_changed',
              timestamp: '2025-09-10T14:30:00Z',
              userId: 'user1',
              userName: 'John Doe',
              details: { fromStage: 'poc', toStage: 'proposal' }
            }
          ],
          notes: [
            {
              id: 'n1',
              content: 'Initial meeting went very well. Strong interest in cost optimization.',
              author: 'John Doe',
              timestamp: '2025-08-01T15:00:00Z'
            },
            {
              id: 'n2',
              content: 'Demo scheduled for next week. Technical team very engaged.',
              author: 'John Doe',
              timestamp: '2025-08-15T16:00:00Z'
            }
          ]
        },
        {
          id: '2',
          title: 'TechStart Security Package',
          description: 'Security compliance solution for mid-market',
          customer: {
            name: 'Mike Johnson',
            company: 'TechStart Solutions',
            email: 'mike@techstart.com'
          },
          partnerId: '2',
          partnerName: 'SecureGuard Technologies',
          value: 200000,
          currency: 'USD',
          probability: 50,
          stage: 'poc',
          expectedCloseDate: '2025-09-01', // Past date to make it overdue
          assignedTo: 'user2',
          assignedToName: 'Sarah Wilson',
          tags: ['Security', 'Compliance'],
          priority: 'medium',
          status: 'active',
          createdDate: '2025-08-15T12:00:00Z',
          lastUpdated: '2025-09-05T10:00:00Z',
          weightedValue: 100000,
          daysInStage: 25,
          isOverdue: true,
          dealType: 'expansion' as const,
          commissionRate: 20,
          estimatedCommission: 40000,
          history: [
            {
              id: 'h5',
              action: 'created',
              timestamp: '2025-08-15T12:00:00Z',
              userId: 'user2',
              userName: 'Sarah Wilson',
              details: {}
            },
            {
              id: 'h6',
              action: 'stage_changed',
              timestamp: '2025-08-20T12:00:00Z',
              userId: 'user2',
              userName: 'Sarah Wilson',
              details: { fromStage: 'lead', toStage: 'demo' }
            },
            {
              id: 'h7',
              action: 'stage_changed',
              timestamp: '2025-08-25T12:00:00Z',
              userId: 'user2',
              userName: 'Sarah Wilson',
              details: { fromStage: 'demo', toStage: 'poc' }
            }
          ],
          notes: []
        },
        {
          id: '3',
          title: 'DataFlow Analytics Setup',
          description: 'Small business analytics implementation',
          customer: {
            name: 'Lisa Chen',
            company: 'Small Biz Corp',
            email: 'lisa@smallbiz.com'
          },
          partnerId: '3',
          partnerName: 'DataFlow Analytics',
          value: 50000,
          currency: 'USD',
          probability: 25,
          stage: 'demo',
          expectedCloseDate: '2025-11-15',
          assignedTo: 'user3',
          assignedToName: 'Mike Davis',
          tags: ['SMB', 'Analytics'],
          priority: 'low',
          status: 'active',
          createdDate: '2025-09-01T09:00:00Z',
          lastUpdated: '2025-09-12T11:00:00Z',
          weightedValue: 12500,
          daysInStage: 8,
          isOverdue: false,
          dealType: 'renewal' as const,
          commissionRate: 15,
          estimatedCommission: 7500,
          history: [
            {
              id: 'h8',
              action: 'created',
              timestamp: '2025-09-01T09:00:00Z',
              userId: 'user3',
              userName: 'Mike Davis',
              details: {}
            },
            {
              id: 'h9',
              action: 'stage_changed',
              timestamp: '2025-09-07T09:00:00Z',
              userId: 'user3',
              userName: 'Mike Davis',
              details: { fromStage: 'lead', toStage: 'demo' }
            }
          ],
          notes: []
        },
        // Add some closed opportunities for win/loss analysis
        {
          id: '4',
          title: 'MegaCorp Infrastructure Deal',
          description: 'Large-scale infrastructure modernization',
          customer: {
            name: 'Robert Taylor',
            company: 'MegaCorp Industries',
            email: 'robert@megacorp.com'
          },
          partnerId: '1',
          partnerName: 'ACME FinOps Solutions',
          value: 1200000,
          currency: 'USD',
          probability: 100,
          stage: 'closed_won',
          expectedCloseDate: '2025-08-30',
          actualCloseDate: '2025-08-28T15:00:00Z',
          assignedTo: 'user1',
          assignedToName: 'John Doe',
          tags: ['Enterprise', 'Infrastructure'],
          priority: 'critical',
          status: 'won',
          createdDate: '2025-07-01T09:00:00Z',
          lastUpdated: '2025-08-28T15:00:00Z',
          weightedValue: 1200000,
          daysInStage: 0,
          isOverdue: false,
          dealType: 'new_business' as const,
          commissionRate: 30,
          estimatedCommission: 360000,
          history: [
            {
              id: 'h10',
              action: 'created',
              timestamp: '2025-07-01T09:00:00Z',
              userId: 'user1',
              userName: 'John Doe',
              details: {}
            },
            {
              id: 'h11',
              action: 'stage_changed',
              timestamp: '2025-08-28T15:00:00Z',
              userId: 'user1',
              userName: 'John Doe',
              details: { fromStage: 'proposal', toStage: 'closed_won' }
            }
          ],
          notes: []
        },
        {
          id: '5',
          title: 'StartupCo Growth Package',
          description: 'Growth-stage optimization suite',
          customer: {
            name: 'Emily Watson',
            company: 'StartupCo',
            email: 'emily@startupco.com'
          },
          partnerId: '2',
          partnerName: 'SecureGuard Technologies',
          value: 180000,
          currency: 'USD',
          probability: 0,
          stage: 'closed_lost',
          expectedCloseDate: '2025-09-10',
          actualCloseDate: '2025-09-05T12:00:00Z',
          assignedTo: 'user2',
          assignedToName: 'Sarah Wilson',
          tags: ['Startup', 'Growth'],
          priority: 'medium',
          status: 'lost',
          lostReason: 'Price competition',
          createdDate: '2025-08-01T10:00:00Z',
          lastUpdated: '2025-09-05T12:00:00Z',
          weightedValue: 0,
          daysInStage: 5,
          isOverdue: false,
          dealType: 'new_business' as const,
          commissionRate: 30,
          estimatedCommission: 0,
          history: [
            {
              id: 'h12',
              action: 'created',
              timestamp: '2025-08-01T10:00:00Z',
              userId: 'user2',
              userName: 'Sarah Wilson',
              details: {}
            },
            {
              id: 'h13',
              action: 'stage_changed',
              timestamp: '2025-09-05T12:00:00Z',
              userId: 'user2',
              userName: 'Sarah Wilson',
              details: { fromStage: 'demo', toStage: 'closed_lost' }
            }
          ],
          notes: []
        },
        {
          id: '6',
          title: 'FinanceFlow Optimization',
          description: 'Financial process optimization',
          customer: {
            name: 'David Brown',
            company: 'FinanceFlow Corp',
            email: 'david@financeflow.com'
          },
          partnerId: '3',
          partnerName: 'DataFlow Analytics',
          value: 85000,
          currency: 'USD',
          probability: 0,
          stage: 'closed_lost',
          expectedCloseDate: '2025-08-25',
          actualCloseDate: '2025-08-20T16:30:00Z',
          assignedTo: 'user3',
          assignedToName: 'Mike Davis',
          tags: ['Finance', 'Optimization'],
          priority: 'low',
          status: 'lost',
          lostReason: 'Budget constraints',
          createdDate: '2025-07-15T11:00:00Z',
          lastUpdated: '2025-08-20T16:30:00Z',
          weightedValue: 0,
          daysInStage: 2,
          isOverdue: false,
          dealType: 'expansion' as const,
          commissionRate: 20,
          estimatedCommission: 0,
          history: [
            {
              id: 'h14',
              action: 'created',
              timestamp: '2025-07-15T11:00:00Z',
              userId: 'user3',
              userName: 'Mike Davis',
              details: {}
            }
          ],
          notes: []
        }
      ];

      // Calculate metrics for each opportunity
      const opportunitiesWithMetrics = mockOpportunities.map(calculateOpportunityMetrics);
      console.log('Loaded opportunities:', opportunitiesWithMetrics.length);
      setOpportunities(opportunitiesWithMetrics);
    } catch (error) {
      console.error('Failed to load opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    console.log('Applying filters. Total opportunities:', opportunities.length);
    let filtered = opportunities;

    if (filters.stage !== 'all') {
      filtered = filtered.filter(opp => opp.stage === filters.stage);
    }

    if (filters.assignee !== 'all') {
      filtered = filtered.filter(opp => opp.assignedTo === filters.assignee);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(opp => opp.priority === filters.priority);
    }

    if (filters.partner !== 'all') {
      filtered = filtered.filter(opp => opp.partnerId === filters.partner);
    }

    if (filters.search) {
      filtered = filtered.filter(opp =>
        opp.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        opp.customer.company.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.showOverdue) {
      filtered = filtered.filter(opp => opp.isOverdue);
    }

    console.log('Filtered opportunities:', filtered.length, 'Stage filter:', filters.stage);
    setFilteredOpportunities(filtered);
  };

  const handleCreateOpportunity = () => {
    const commissionRate = DEAL_TYPES[newOpportunity.dealType]?.commissionRate || 15;
    const estimatedCommission = calculateCommission(newOpportunity.value, newOpportunity.dealType);

    const opportunity: Opportunity = {
      id: `opp_${Date.now()}`,
      title: newOpportunity.title,
      description: newOpportunity.description,
      customer: {
        name: newOpportunity.customerName,
        company: newOpportunity.customerCompany,
        email: newOpportunity.customerEmail,
        phone: newOpportunity.customerPhone
      },
      partnerId: newOpportunity.partnerId || undefined,
      partnerName: newOpportunity.partnerId ? 'Selected Partner' : undefined,
      value: newOpportunity.value,
      currency: newOpportunity.currency,
      probability: PIPELINE_STAGES.find(s => s.id === newOpportunity.stage)?.probability || 10,
      stage: newOpportunity.stage,
      expectedCloseDate: newOpportunity.expectedCloseDate,
      assignedTo: newOpportunity.assignedTo,
      assignedToName: 'Current User',
      tags: newOpportunity.tags,
      priority: newOpportunity.priority,
      status: 'active',
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      weightedValue: newOpportunity.value * (PIPELINE_STAGES.find(s => s.id === newOpportunity.stage)?.probability || 10) / 100,
      daysInStage: 0,
      isOverdue: false,
      dealType: newOpportunity.dealType,
      commissionRate,
      estimatedCommission,
      history: [{
        id: `h_${Date.now()}`,
        action: 'created',
        timestamp: new Date().toISOString(),
        userId: 'current_user',
        userName: 'Current User',
        details: {}
      }],
      notes: newOpportunity.notes ? [{
        id: `n_${Date.now()}`,
        content: newOpportunity.notes,
        author: 'Current User',
        timestamp: new Date().toISOString()
      }] : []
    };

    setOpportunities([...opportunities, opportunity]);
    setCreateDialogOpen(false);
    setNewOpportunity({
      title: '',
      description: '',
      customerName: '',
      customerCompany: '',
      customerEmail: '',
      customerPhone: '',
      partnerId: '',
      value: 0,
      currency: 'USD',
      stage: 'lead',
      expectedCloseDate: '',
      assignedTo: 'current_user',
      priority: 'medium',
      tags: [],
      notes: '',
      dealType: 'new_business'
    });
  };

  const handleStageChange = (opportunityId: string, newStage: string) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) return;

    // Validate stage progression
    const validation = validateStageProgression(opportunity, newStage);

    if (!validation.isValid) {
      // Show validation dialog with error
      setPendingStageChange({ opportunityId, newStage });
      setValidationResult(validation);
      setValidationDialogOpen(true);
      return;
    }

    // If validation passes, proceed with stage change
    executeStageChange(opportunityId, newStage);

    // Show notification for high-value opportunities (>$500k)
    if (opportunity.value > 500000) {
      // TODO: Implement automated notification to VP
      console.log(`High-value opportunity "${opportunity.title}" moved to ${getStageName(newStage)}`);
    }
  };

  const executeStageChange = (opportunityId: string, newStage: string) => {
    const updatedOpportunities = opportunities.map(opp => {
      if (opp.id === opportunityId) {
        const oldStage = opp.stage;
        const newProbability = PIPELINE_STAGES.find(s => s.id === newStage)?.probability || 0;

        const updatedOpp = {
          ...opp,
          stage: newStage,
          probability: newProbability,
          weightedValue: opp.value * newProbability / 100,
          lastUpdated: new Date().toISOString(),
          status: newStage === 'closed_won' ? 'won' as const :
                  newStage === 'closed_lost' ? 'lost' as const : 'active' as const,
          actualCloseDate: newStage === 'closed_won' || newStage === 'closed_lost' ? new Date().toISOString() : undefined,
          daysInStage: 0,
          history: [
            ...opp.history,
            {
              id: `h_${Date.now()}`,
              action: 'stage_changed' as const,
              timestamp: new Date().toISOString(),
              userId: 'current_user',
              userName: 'Current User',
              details: { fromStage: oldStage, toStage: newStage }
            }
          ]
        };

        // Recalculate metrics after stage change
        return calculateOpportunityMetrics(updatedOpp);
      }
      return opp;
    });

    setOpportunities(updatedOpportunities);
  };

  const handleBulkAction = () => {
    if (selectedOpportunities.length === 0) return;

    const updatedOpportunities = opportunities.map(opp => {
      if (selectedOpportunities.includes(opp.id)) {
        let updates: Partial<Opportunity> = {
          lastUpdated: new Date().toISOString()
        };

        let historyEntry: OpportunityHistory;

        switch (bulkAction.type) {
          case 'stage_change':
            const newProbability = PIPELINE_STAGES.find(s => s.id === bulkAction.newStage)?.probability || 0;
            updates = {
              ...updates,
              stage: bulkAction.newStage,
              probability: newProbability,
              weightedValue: opp.value * newProbability / 100,
              daysInStage: 0
            };
            historyEntry = {
              id: `h_${Date.now()}_${opp.id}`,
              action: 'stage_changed',
              timestamp: new Date().toISOString(),
              userId: 'current_user',
              userName: 'Current User',
              details: { fromStage: opp.stage, toStage: bulkAction.newStage }
            };
            break;

          case 'reassign':
            updates = {
              ...updates,
              assignedTo: bulkAction.newAssignee,
              assignedToName: 'New Assignee'
            };
            historyEntry = {
              id: `h_${Date.now()}_${opp.id}`,
              action: 'assigned',
              timestamp: new Date().toISOString(),
              userId: 'current_user',
              userName: 'Current User',
              details: { fromAssignee: opp.assignedToName, toAssignee: 'New Assignee' }
            };
            break;

          case 'update_priority':
            updates = {
              ...updates,
              priority: bulkAction.newPriority
            };
            historyEntry = {
              id: `h_${Date.now()}_${opp.id}`,
              action: 'note_added',
              timestamp: new Date().toISOString(),
              userId: 'current_user',
              userName: 'Current User',
              details: { note: `Priority updated to ${bulkAction.newPriority}` }
            };
            break;

          default:
            return opp;
        }

        return {
          ...opp,
          ...updates,
          history: [...opp.history, historyEntry]
        };
      }
      return opp;
    });

    setOpportunities(updatedOpportunities);
    setSelectedOpportunities([]);
    setBulkDialogOpen(false);
  };

  const handleCloneOpportunity = (opportunity: Opportunity) => {
    const clonedOpportunity: Opportunity = {
      ...opportunity,
      id: `opp_${Date.now()}`,
      title: `${opportunity.title} (Copy)`,
      stage: 'lead',
      probability: 10,
      weightedValue: opportunity.value * 0.1,
      status: 'active',
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      actualCloseDate: undefined,
      daysInStage: 0,
      isOverdue: false,
      history: [{
        id: `h_${Date.now()}`,
        action: 'created',
        timestamp: new Date().toISOString(),
        userId: 'current_user',
        userName: 'Current User',
        details: {}
      }],
      notes: []
    };

    setOpportunities([...opportunities, clonedOpportunity]);
  };

  const getStageColor = (stage: string) => {
    return PIPELINE_STAGES.find(s => s.id === stage)?.color || '#757575';
  };

  const getStageName = (stage: string) => {
    return PIPELINE_STAGES.find(s => s.id === stage)?.name || stage;
  };

  const STAGE_DURATION_BENCHMARKS = {
    'lead': { optimal: 7, warning: 14, critical: 21 },
    'demo': { optimal: 10, warning: 20, critical: 30 },
    'poc': { optimal: 21, warning: 35, critical: 50 },
    'proposal': { optimal: 14, warning: 28, critical: 42 }
  };

  const getStageHealthStatus = (stage: string, daysInStage: number) => {
    const benchmark = STAGE_DURATION_BENCHMARKS[stage as keyof typeof STAGE_DURATION_BENCHMARKS];
    if (!benchmark) return 'normal';

    if (daysInStage <= benchmark.optimal) return 'optimal';
    if (daysInStage <= benchmark.warning) return 'warning';
    return 'critical';
  };

  const getStageRecommendation = (stage: string, daysInStage: number) => {
    const benchmark = STAGE_DURATION_BENCHMARKS[stage as keyof typeof STAGE_DURATION_BENCHMARKS];
    if (!benchmark) return null;

    const status = getStageHealthStatus(stage, daysInStage);

    switch (status) {
      case 'optimal':
        return null;
      case 'warning':
        return `Consider following up - opportunity has been in ${getStageName(stage)} for ${daysInStage} days`;
      case 'critical':
        return `Action needed - opportunity stalled in ${getStageName(stage)} for ${daysInStage} days`;
      default:
        return null;
    }
  };

  const handleSelectOpportunity = (opportunityId: string) => {
    if (selectedOpportunities.includes(opportunityId)) {
      setSelectedOpportunities(selectedOpportunities.filter(id => id !== opportunityId));
    } else {
      setSelectedOpportunities([...selectedOpportunities, opportunityId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedOpportunities.length === filteredOpportunities.length) {
      setSelectedOpportunities([]);
    } else {
      setSelectedOpportunities(filteredOpportunities.map(opp => opp.id));
    }
  };

  const pipelineValueData = {
    labels: PIPELINE_STAGES.filter(s => s.id !== 'closed_lost').map(s => s.name),
    datasets: [
      {
        label: 'Total Value',
        data: PIPELINE_STAGES.filter(s => s.id !== 'closed_lost').map(stage =>
          filteredOpportunities
            .filter(opp => opp.stage === stage.id)
            .reduce((sum, opp) => sum + opp.value, 0)
        ),
        backgroundColor: PIPELINE_STAGES.filter(s => s.id !== 'closed_lost').map(s => s.color),
        borderRadius: 4
      }
    ]
  };

  // Advanced Forecasting Algorithms
  const calculateWeightedForecast = (opportunities: Opportunity[]) => {
    return opportunities.reduce((sum, opp) => {
      // Time decay factor based on days in stage
      const timeDecayFactor = Math.max(0.5, 1 - (opp.daysInStage * 0.01));

      // Weighted pipeline formula: Value × Stage Probability × Time Decay
      const weightedValue = opp.value * (opp.probability / 100) * timeDecayFactor;

      return sum + weightedValue;
    }, 0);
  };

  const calculateConfidenceInterval = (opportunities: Opportunity[]) => {
    const baseValue = calculateWeightedForecast(opportunities);
    const variance = opportunities.reduce((sum, opp) => {
      const oppVariance = opp.value * 0.15; // 15% variance assumption
      return sum + (oppVariance * oppVariance);
    }, 0);

    const standardDeviation = Math.sqrt(variance);

    return {
      lower: Math.max(0, baseValue - (1.96 * standardDeviation)), // 95% confidence
      upper: baseValue + (1.96 * standardDeviation),
      base: baseValue
    };
  };

  const getScenarioForecasts = (opportunities: Opportunity[]) => {
    const bestCase = opportunities.reduce((sum, opp) => {
      // Best case: +20% probability, optimal time progression
      const adjustedProbability = Math.min(100, opp.probability + 20);
      return sum + (opp.value * adjustedProbability / 100);
    }, 0);

    const worstCase = opportunities.reduce((sum, opp) => {
      // Worst case: -30% probability, account for delays
      const adjustedProbability = Math.max(0, opp.probability - 30);
      return sum + (opp.value * adjustedProbability / 100 * 0.8);
    }, 0);

    const mostLikely = calculateWeightedForecast(opportunities);

    return { bestCase, worstCase, mostLikely };
  };

  // Win/Loss Analysis Functions
  const WIN_REASONS = [
    'Price advantage', 'Feature fit', 'Strong relationship', 'Perfect timing', 'Superior support'
  ];

  const LOSS_REASONS = [
    'Price competition', 'Feature gaps', 'Timing issues', 'Budget constraints', 'Competitor chosen'
  ];

  const getWinLossAnalysis = (allOpportunities: Opportunity[]) => {
    const closedOpportunities = allOpportunities.filter(opp =>
      opp.status === 'won' || opp.status === 'lost'
    );

    const won = closedOpportunities.filter(opp => opp.status === 'won');
    const lost = closedOpportunities.filter(opp => opp.status === 'lost');

    const winRate = closedOpportunities.length > 0
      ? (won.length / closedOpportunities.length) * 100
      : 0;

    const lossReasonBreakdown = LOSS_REASONS.map(reason => ({
      reason,
      count: lost.filter(opp => opp.lostReason === reason).length,
      value: lost.filter(opp => opp.lostReason === reason).reduce((sum, opp) => sum + opp.value, 0)
    }));

    return {
      totalClosed: closedOpportunities.length,
      won: won.length,
      lost: lost.length,
      winRate,
      avgWonValue: won.length > 0 ? won.reduce((sum, opp) => sum + opp.value, 0) / won.length : 0,
      avgLostValue: lost.length > 0 ? lost.reduce((sum, opp) => sum + opp.value, 0) / lost.length : 0,
      lossReasonBreakdown
    };
  };

  // Conversion Rate Analysis
  const getConversionAnalysis = (allOpportunities: Opportunity[]) => {
    const byPartner = [...new Set(allOpportunities.map(opp => opp.partnerName).filter(Boolean))].map(partner => {
      const partnerOpps = allOpportunities.filter(opp => opp.partnerName === partner);
      const won = partnerOpps.filter(opp => opp.status === 'won');
      return {
        name: partner!,
        total: partnerOpps.length,
        won: won.length,
        rate: partnerOpps.length > 0 ? (won.length / partnerOpps.length) * 100 : 0
      };
    });

    const byAssignee = [...new Set(allOpportunities.map(opp => opp.assignedToName))].map(assignee => {
      const assigneeOpps = allOpportunities.filter(opp => opp.assignedToName === assignee);
      const won = assigneeOpps.filter(opp => opp.status === 'won');
      return {
        name: assignee,
        total: assigneeOpps.length,
        won: won.length,
        rate: assigneeOpps.length > 0 ? (won.length / assigneeOpps.length) * 100 : 0
      };
    });

    const byDealSize = [
      { range: '$0-100K', min: 0, max: 100000 },
      { range: '$100K-500K', min: 100000, max: 500000 },
      { range: '$500K+', min: 500000, max: Infinity }
    ].map(range => {
      const rangeOpps = allOpportunities.filter(opp =>
        opp.value >= range.min && opp.value < range.max
      );
      const won = rangeOpps.filter(opp => opp.status === 'won');
      return {
        range: range.range,
        total: rangeOpps.length,
        won: won.length,
        rate: rangeOpps.length > 0 ? (won.length / rangeOpps.length) * 100 : 0
      };
    });

    return { byPartner, byAssignee, byDealSize };
  };

  // Age Analysis for Stalled Deals
  const getAgeAnalysis = (opportunities: Opportunity[]) => {
    const activeOpps = opportunities.filter(opp => opp.status === 'active');

    const stalledOpps = activeOpps.filter(opp => {
      const status = getStageHealthStatus(opp.stage, opp.daysInStage);
      return status === 'critical';
    });

    const ageGroups = [
      { label: '0-30 days', min: 0, max: 30 },
      { label: '31-60 days', min: 31, max: 60 },
      { label: '61-90 days', min: 61, max: 90 },
      { label: '90+ days', min: 91, max: Infinity }
    ].map(group => {
      const groupOpps = activeOpps.filter(opp => {
        const totalAge = Math.floor((new Date().getTime() - new Date(opp.createdDate).getTime()) / (1000 * 60 * 60 * 24));
        return totalAge >= group.min && totalAge < group.max;
      });

      return {
        label: group.label,
        count: groupOpps.length,
        value: groupOpps.reduce((sum, opp) => sum + opp.value, 0)
      };
    });

    return {
      totalStalled: stalledOpps.length,
      stalledValue: stalledOpps.reduce((sum, opp) => sum + opp.value, 0),
      ageGroups
    };
  };

  const forecastTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Current'],
    datasets: [
      {
        label: 'Most Likely Forecast',
        data: [2400000, 2600000, 2800000, 2500000, 2900000, 3100000, getScenarioForecasts(filteredOpportunities).mostLikely],
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.4
      },
      {
        label: 'Best Case',
        data: [2700000, 2900000, 3100000, 2800000, 3200000, 3400000, getScenarioForecasts(filteredOpportunities).bestCase],
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        borderDash: [5, 5]
      },
      {
        label: 'Worst Case',
        data: [2100000, 2300000, 2500000, 2200000, 2600000, 2800000, getScenarioForecasts(filteredOpportunities).worstCase],
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        tension: 0.4,
        borderDash: [5, 5]
      }
    ]
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Opportunity Lifecycle Management
        {stageFromUrl && (
          <Chip
            label={`Filtered by: ${PIPELINE_STAGES.find(s => s.id === stageFromUrl)?.name || stageFromUrl}`}
            color="primary"
            size="small"
            sx={{ ml: 2 }}
            onDelete={() => {
              setFilters({...filters, stage: 'all'});
              window.history.replaceState({}, '', '/opportunities');
            }}
          />
        )}
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Comprehensive opportunity tracking through complete sales cycle
      </Typography>

      {/* Action Bar */}
      <Box display="flex" gap={2} mb={3}>
        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={() => setCreateDialogOpen(true)}
        >
          New Opportunity
        </Button>
        <Button
          startIcon={<Group />}
          variant="outlined"
          onClick={() => setBulkDialogOpen(true)}
          disabled={selectedOpportunities.length === 0}
        >
          Bulk Actions ({selectedOpportunities.length})
        </Button>
        <Button
          startIcon={<GetApp />}
          variant="outlined"
        >
          Export
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
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
                {PIPELINE_STAGES.map(stage => (
                  <MenuItem key={stage.id} value={stage.id}>{stage.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                {Object.entries(PRIORITIES).map(([key, priority]) => (
                  <MenuItem key={key} value={key}>{priority.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Assignee</InputLabel>
              <Select
                value={filters.assignee}
                onChange={(e) => setFilters({...filters, assignee: e.target.value})}
              >
                <MenuItem value="all">All Assignees</MenuItem>
                <MenuItem value="user1">John Doe</MenuItem>
                <MenuItem value="user2">Sarah Wilson</MenuItem>
                <MenuItem value="user3">Mike Davis</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              startIcon={<FilterList />}
              onClick={() => setFilters({
                stage: 'all',
                assignee: 'all',
                priority: 'all',
                partner: 'all',
                search: '',
                showOverdue: false
              })}
              size="small"
              variant="outlined"
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Pipeline View" />
        <Tab label="Analytics & Forecasting" />
        <Tab label="Kanban Board" />
      </Tabs>

      {selectedTab === 0 && (
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Opportunities Pipeline</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="textSecondary">
                  Total: {filteredOpportunities.length} opportunities
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  Pipeline Value: ${filteredOpportunities.reduce((sum, opp) => sum + opp.value, 0).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="info.main" fontWeight="bold">
                  Total Commission: ${filteredOpportunities.reduce((sum, opp) => sum + (opp.estimatedCommission || 0), 0).toLocaleString()}
                </Typography>
              </Box>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedOpportunities.length === filteredOpportunities.length && filteredOpportunities.length > 0}
                        indeterminate={selectedOpportunities.length > 0 && selectedOpportunities.length < filteredOpportunities.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Opportunity</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Partner</TableCell>
                    <TableCell align="right">ARR</TableCell>
                    <TableCell align="right">Commission</TableCell>
                    <TableCell align="right">Probability</TableCell>
                    <TableCell>Expected Close</TableCell>
                    <TableCell>Assignee</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Stage / Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOpportunities.map((opportunity) => (
                    <TableRow
                      key={opportunity.id}
                      sx={{
                        backgroundColor: selectedOpportunities.includes(opportunity.id) ? 'primary.50' : 'inherit',
                        '&:hover': { backgroundColor: 'grey.50' }
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedOpportunities.includes(opportunity.id)}
                          onChange={() => handleSelectOpportunity(opportunity.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {opportunity.title}
                          </Typography>
                          <Box display="flex" gap={0.5} mt={0.5}>
                            {opportunity.tags.map((tag) => (
                              <Chip key={tag} size="small" label={tag} variant="outlined" />
                            ))}
                            {opportunity.isOverdue && (
                              <Chip size="small" label="Overdue" color="error" />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {opportunity.customer.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {opportunity.customer.company}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {opportunity.partnerName && (
                          <Chip size="small" label={opportunity.partnerName} />
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {opportunity.currency} {opportunity.value.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
                          <Chip
                            size="small"
                            label={`${opportunity.commissionRate || 15}%`}
                            color="info"
                            sx={{
                              cursor: 'pointer',
                              fontSize: '0.65rem',
                              '&:hover': {
                                opacity: 0.8,
                                transform: 'scale(1.05)'
                              }
                            }}
                            onClick={(e) => {
                              setMenuAnchor({ ...menuAnchor, [`dealtype_${opportunity.id}`]: e.currentTarget });
                            }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            ${(opportunity.estimatedCommission || 0).toLocaleString()}
                          </Typography>
                        </Box>
                        <Menu
                          anchorEl={menuAnchor[`dealtype_${opportunity.id}`]}
                          open={Boolean(menuAnchor[`dealtype_${opportunity.id}`])}
                          onClose={() => setMenuAnchor({ ...menuAnchor, [`dealtype_${opportunity.id}`]: null })}
                        >
                          {Object.entries(DEAL_TYPES).map(([key, dealType]) => (
                            <MenuItem
                              key={key}
                              selected={opportunity.dealType === key}
                              onClick={() => {
                                const newCommission = calculateCommission(opportunity.value, key);
                                const updatedOpportunities = opportunities.map(opp =>
                                  opp.id === opportunity.id
                                    ? {
                                        ...opp,
                                        dealType: key as any,
                                        commissionRate: dealType.commissionRate,
                                        estimatedCommission: newCommission,
                                        lastUpdated: new Date().toISOString()
                                      }
                                    : opp
                                );
                                setOpportunities(updatedOpportunities);
                                setMenuAnchor({ ...menuAnchor, [`dealtype_${opportunity.id}`]: null });
                              }}
                            >
                              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                                <Typography variant="body2">{dealType.label}</Typography>
                                <Chip
                                  size="small"
                                  label={`${dealType.commissionRate}%`}
                                  color="info"
                                  sx={{ ml: 1, fontSize: '0.65rem' }}
                                />
                              </Box>
                            </MenuItem>
                          ))}
                        </Menu>
                      </TableCell>
                      <TableCell align="right">
                        {opportunity.probability}%
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.8,
                              backgroundColor: 'action.hover',
                              borderRadius: 1,
                              p: 0.5,
                              m: -0.5
                            }
                          }}
                          onClick={(e) => {
                            setMenuAnchor({ ...menuAnchor, [`date_${opportunity.id}`]: e.currentTarget });
                          }}
                        >
                          <Typography variant="body2">
                            {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
                          </Typography>
                          {opportunity.isOverdue && (
                            <Chip
                              size="small"
                              label="Overdue"
                              color="error"
                              sx={{ fontSize: '0.6rem', height: 16 }}
                            />
                          )}
                        </Box>
                        <Menu
                          anchorEl={menuAnchor[`date_${opportunity.id}`]}
                          open={Boolean(menuAnchor[`date_${opportunity.id}`])}
                          onClose={() => setMenuAnchor({ ...menuAnchor, [`date_${opportunity.id}`]: null })}
                          PaperProps={{ sx: { p: 2 } }}
                        >
                          <Box display="flex" flexDirection="column" gap={1}>
                            <Typography variant="subtitle2">Update Expected Close Date</Typography>
                            <TextField
                              type="date"
                              size="small"
                              defaultValue={opportunity.expectedCloseDate.split('T')[0]}
                              onChange={(e) => {
                                const newDate = e.target.value;
                                const updatedOpportunities = opportunities.map(opp =>
                                  opp.id === opportunity.id
                                    ? calculateOpportunityMetrics({
                                        ...opp,
                                        expectedCloseDate: newDate,
                                        lastUpdated: new Date().toISOString()
                                      })
                                    : opp
                                );
                                setOpportunities(updatedOpportunities);
                                setMenuAnchor({ ...menuAnchor, [`date_${opportunity.id}`]: null });
                              }}
                              InputLabelProps={{ shrink: true }}
                            />
                          </Box>
                        </Menu>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={opportunity.assignedToName}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.8,
                              transform: 'scale(1.05)'
                            }
                          }}
                          onClick={(e) => {
                            setMenuAnchor({ ...menuAnchor, [`assignee_${opportunity.id}`]: e.currentTarget });
                          }}
                        />
                        <Menu
                          anchorEl={menuAnchor[`assignee_${opportunity.id}`]}
                          open={Boolean(menuAnchor[`assignee_${opportunity.id}`])}
                          onClose={() => setMenuAnchor({ ...menuAnchor, [`assignee_${opportunity.id}`]: null })}
                        >
                          <MenuItem
                            selected={opportunity.assignedTo === 'user1'}
                            onClick={() => {
                              const updatedOpportunities = opportunities.map(opp =>
                                opp.id === opportunity.id
                                  ? { ...opp, assignedTo: 'user1', assignedToName: 'John Doe', lastUpdated: new Date().toISOString() }
                                  : opp
                              );
                              setOpportunities(updatedOpportunities);
                              setMenuAnchor({ ...menuAnchor, [`assignee_${opportunity.id}`]: null });
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Person sx={{ fontSize: 16 }} />
                              John Doe
                            </Box>
                          </MenuItem>
                          <MenuItem
                            selected={opportunity.assignedTo === 'user2'}
                            onClick={() => {
                              const updatedOpportunities = opportunities.map(opp =>
                                opp.id === opportunity.id
                                  ? { ...opp, assignedTo: 'user2', assignedToName: 'Sarah Wilson', lastUpdated: new Date().toISOString() }
                                  : opp
                              );
                              setOpportunities(updatedOpportunities);
                              setMenuAnchor({ ...menuAnchor, [`assignee_${opportunity.id}`]: null });
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Person sx={{ fontSize: 16 }} />
                              Sarah Wilson
                            </Box>
                          </MenuItem>
                          <MenuItem
                            selected={opportunity.assignedTo === 'user3'}
                            onClick={() => {
                              const updatedOpportunities = opportunities.map(opp =>
                                opp.id === opportunity.id
                                  ? { ...opp, assignedTo: 'user3', assignedToName: 'Mike Davis', lastUpdated: new Date().toISOString() }
                                  : opp
                              );
                              setOpportunities(updatedOpportunities);
                              setMenuAnchor({ ...menuAnchor, [`assignee_${opportunity.id}`]: null });
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Person sx={{ fontSize: 16 }} />
                              Mike Davis
                            </Box>
                          </MenuItem>
                        </Menu>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={PRIORITIES[opportunity.priority].label}
                          color={PRIORITIES[opportunity.priority].color as any}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.8,
                              transform: 'scale(1.05)'
                            }
                          }}
                          onClick={(e) => {
                            setMenuAnchor({ ...menuAnchor, [`priority_${opportunity.id}`]: e.currentTarget });
                          }}
                        />
                        <Menu
                          anchorEl={menuAnchor[`priority_${opportunity.id}`]}
                          open={Boolean(menuAnchor[`priority_${opportunity.id}`])}
                          onClose={() => setMenuAnchor({ ...menuAnchor, [`priority_${opportunity.id}`]: null })}
                        >
                          {Object.entries(PRIORITIES).map(([key, priority]) => (
                            <MenuItem
                              key={key}
                              selected={opportunity.priority === key}
                              onClick={() => {
                                const updatedOpportunities = opportunities.map(opp =>
                                  opp.id === opportunity.id
                                    ? { ...opp, priority: key as any, lastUpdated: new Date().toISOString() }
                                    : opp
                                );
                                setOpportunities(updatedOpportunities);
                                setMenuAnchor({ ...menuAnchor, [`priority_${opportunity.id}`]: null });
                              }}
                            >
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip
                                  size="small"
                                  label={priority.label}
                                  color={priority.color as any}
                                  sx={{ fontSize: '0.65rem' }}
                                />
                              </Box>
                            </MenuItem>
                          ))}
                        </Menu>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {/* Stage Chip - Clickable like Priority */}
                          <Chip
                            size="small"
                            label={getStageName(opportunity.stage)}
                            sx={{
                              backgroundColor: getStageColor(opportunity.stage),
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.65rem',
                              cursor: 'pointer',
                              '&:hover': {
                                opacity: 0.8,
                                transform: 'scale(1.05)'
                              }
                            }}
                            onClick={(e) => {
                              console.log('Stage chip clicked for opportunity:', opportunity.id, opportunity.title);
                              setMenuAnchor({ ...menuAnchor, [`stage_${opportunity.id}`]: e.currentTarget });
                            }}
                          />
                          <Menu
                            anchorEl={menuAnchor[`stage_${opportunity.id}`]}
                            open={Boolean(menuAnchor[`stage_${opportunity.id}`])}
                            onClose={() => setMenuAnchor({ ...menuAnchor, [`stage_${opportunity.id}`]: null })}
                          >
                            {PIPELINE_STAGES.map(stage => (
                              <MenuItem
                                key={stage.id}
                                selected={opportunity.stage === stage.id}
                                onClick={() => {
                                  console.log('Stage change clicked:', opportunity.id, 'from', opportunity.stage, 'to', stage.id);
                                  handleStageChange(opportunity.id, stage.id);
                                  setMenuAnchor({ ...menuAnchor, [`stage_${opportunity.id}`]: null });
                                }}
                              >
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Box
                                    width={12}
                                    height={12}
                                    borderRadius="50%"
                                    sx={{ backgroundColor: stage.color }}
                                  />
                                  <Typography variant="body2">
                                    {stage.name} ({stage.probability}%)
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Menu>

                          {/* Actions Menu */}
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setMenuAnchor({ ...menuAnchor, [opportunity.id]: e.currentTarget });
                            }}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                          <Menu
                            anchorEl={menuAnchor[opportunity.id]}
                            open={Boolean(menuAnchor[opportunity.id])}
                            onClose={() => setMenuAnchor({ ...menuAnchor, [opportunity.id]: null })}
                          >
                            <MenuItem onClick={() => {
                              setSelectedOpportunity(opportunity);
                              setHistoryDialogOpen(true);
                              setMenuAnchor({ ...menuAnchor, [opportunity.id]: null });
                            }}>
                              <Visibility sx={{ mr: 1 }} />
                              View Details
                            </MenuItem>
                            <MenuItem onClick={() => {
                              setSelectedOpportunity(opportunity);
                              setEditDialogOpen(true);
                              setMenuAnchor({ ...menuAnchor, [opportunity.id]: null });
                            }}>
                              <Edit sx={{ mr: 1 }} />
                              Edit
                            </MenuItem>
                            <MenuItem onClick={() => {
                              handleCloneOpportunity(opportunity);
                              setMenuAnchor({ ...menuAnchor, [opportunity.id]: null });
                            }}>
                              <FileCopy sx={{ mr: 1 }} />
                              Clone
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={() => {
                              handleStageChange(opportunity.id, 'closed_lost');
                              setMenuAnchor({ ...menuAnchor, [opportunity.id]: null });
                            }}>
                              <Stop sx={{ mr: 1 }} />
                              Mark as Lost
                            </MenuItem>
                            <Divider />
                            {/* TODO: Add role-based access control - only admin/manager roles should see delete option */}
                            <MenuItem
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete "${opportunity.title}"? This action cannot be undone.`)) {
                                  const updatedOpportunities = opportunities.filter(opp => opp.id !== opportunity.id);
                                  setOpportunities(updatedOpportunities);
                                }
                                setMenuAnchor({ ...menuAnchor, [opportunity.id]: null });
                              }}
                              sx={{ color: 'error.main' }}
                            >
                              <Delete sx={{ mr: 1 }} />
                              Delete Opportunity
                            </MenuItem>
                          </Menu>
                        </Box>
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
        <Box>
          {/* Forecasting Dashboard */}
          <Grid container spacing={3}>
            {/* Scenario Planning Cards */}
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Revenue Forecasting & Analytics
              </Typography>
            </Grid>

            {(() => {
              const scenarios = getScenarioForecasts(filteredOpportunities);
              const confidence = calculateConfidenceInterval(filteredOpportunities);
              const winLoss = getWinLossAnalysis(opportunities);
              const conversions = getConversionAnalysis(opportunities);
              const ageAnalysis = getAgeAnalysis(filteredOpportunities);

              return (
                <>
                  {/* Forecast Scenarios */}
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', border: '2px solid', borderColor: 'success.main' }}>
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        ${(scenarios.bestCase / 1000000).toFixed(1)}M
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Best Case Scenario
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        +20% probability boost
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', border: '2px solid', borderColor: 'primary.main' }}>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        ${(scenarios.mostLikely / 1000000).toFixed(1)}M
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Most Likely
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Time-weighted forecast
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', border: '2px solid', borderColor: 'error.main' }}>
                      <Typography variant="h4" color="error.main" fontWeight="bold">
                        ${(scenarios.worstCase / 1000000).toFixed(1)}M
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Worst Case Scenario
                      </Typography>
                      <Typography variant="caption" color="error.main">
                        -30% with delays
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main" fontWeight="bold">
                        {confidence.base > 0 ? Math.round((confidence.upper - confidence.lower) / confidence.base * 100) : 0}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Confidence Range
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        95% confidence interval
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Charts */}
                  <Grid item xs={12} md={8}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Scenario Forecast Trends</Typography>
                        <Box height={400}>
                          <Line data={forecastTrendData} options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { position: 'top' }
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
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Win/Loss Analysis</Typography>
                        <Box display="flex" flexDirection="column" gap={2}>
                          <Box>
                            <Typography variant="body2" color="textSecondary">Overall Win Rate</Typography>
                            <Typography variant="h4" color={winLoss.winRate > 50 ? 'success.main' : 'warning.main'}>
                              {winLoss.winRate.toFixed(1)}%
                            </Typography>
                            <Typography variant="caption">
                              {winLoss.won} won / {winLoss.totalClosed} closed
                            </Typography>
                          </Box>

                          <Divider />

                          <Box>
                            <Typography variant="body2" color="textSecondary">Avg Won Deal</Typography>
                            <Typography variant="h6" color="success.main">
                              ${winLoss.avgWonValue.toLocaleString()}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="body2" color="textSecondary">Avg Lost Deal</Typography>
                            <Typography variant="h6" color="error.main">
                              ${winLoss.avgLostValue.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Loss Reason Breakdown */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Loss Reason Analysis</Typography>
                        <List>
                          {winLoss.lossReasonBreakdown
                            .filter(reason => reason.count > 0)
                            .sort((a, b) => b.count - a.count)
                            .map((reason, index) => (
                              <ListItem key={index}>
                                <ListItemText
                                  primary={reason.reason}
                                  secondary={`${reason.count} deals • $${reason.value.toLocaleString()}`}
                                />
                                <Chip
                                  size="small"
                                  label={`${((reason.count / winLoss.lost) * 100).toFixed(1)}%`}
                                  color="error"
                                  variant="outlined"
                                />
                              </ListItem>
                            ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Age Analysis */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Opportunity Age Analysis</Typography>
                        <Alert severity={ageAnalysis.totalStalled > 0 ? 'warning' : 'success'} sx={{ mb: 2 }}>
                          {ageAnalysis.totalStalled} opportunities stalled • ${ageAnalysis.stalledValue.toLocaleString()} at risk
                        </Alert>
                        <List>
                          {ageAnalysis.ageGroups.map((group, index) => (
                            <ListItem key={index}>
                              <ListItemText
                                primary={group.label}
                                secondary={`${group.count} opportunities • $${group.value.toLocaleString()}`}
                              />
                              <LinearProgress
                                variant="determinate"
                                value={(group.count / filteredOpportunities.length) * 100}
                                sx={{ width: 60, mr: 1 }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Conversion Rate Analysis */}
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>Conversion Rate Analysis</Typography>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>By Partner</Typography>
                            <List dense>
                              {conversions.byPartner.map((partner, index) => (
                                <ListItem key={index}>
                                  <ListItemText
                                    primary={partner.name}
                                    secondary={`${partner.won}/${partner.total} opportunities`}
                                  />
                                  <Chip
                                    size="small"
                                    label={`${partner.rate.toFixed(1)}%`}
                                    color={partner.rate > 50 ? 'success' : partner.rate > 25 ? 'warning' : 'error'}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>By Team Member</Typography>
                            <List dense>
                              {conversions.byAssignee.map((assignee, index) => (
                                <ListItem key={index}>
                                  <ListItemText
                                    primary={assignee.name}
                                    secondary={`${assignee.won}/${assignee.total} opportunities`}
                                  />
                                  <Chip
                                    size="small"
                                    label={`${assignee.rate.toFixed(1)}%`}
                                    color={assignee.rate > 50 ? 'success' : assignee.rate > 25 ? 'warning' : 'error'}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" gutterBottom>By Deal Size</Typography>
                            <List dense>
                              {conversions.byDealSize.map((size, index) => (
                                <ListItem key={index}>
                                  <ListItemText
                                    primary={size.range}
                                    secondary={`${size.won}/${size.total} opportunities`}
                                  />
                                  <Chip
                                    size="small"
                                    label={`${size.rate.toFixed(1)}%`}
                                    color={size.rate > 50 ? 'success' : size.rate > 25 ? 'warning' : 'error'}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              );
            })()}
          </Grid>
        </Box>
      )}

      {selectedTab === 2 && (
        <Box>
          {/* Stage Validation Rules Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Stage Progression Rules</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box width={12} height={12} borderRadius="50%" sx={{ backgroundColor: '#f44336' }} />
                    <Typography variant="body2"><strong>Lead → Demo:</strong> Customer contact required</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box width={12} height={12} borderRadius="50%" sx={{ backgroundColor: '#ff9800' }} />
                    <Typography variant="body2"><strong>Demo → POC:</strong> Technical contact required</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box width={12} height={12} borderRadius="50%" sx={{ backgroundColor: '#2196f3' }} />
                    <Typography variant="body2"><strong>POC → Proposal:</strong> Success criteria documented</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box width={12} height={12} borderRadius="50%" sx={{ backgroundColor: '#4caf50' }} />
                    <Typography variant="body2"><strong>Proposal → Closed:</strong> Decision maker approval</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Kanban Board */}
          <Box display="flex" gap={2} sx={{ overflowX: 'auto', pb: 2 }}>
            {PIPELINE_STAGES.filter(stage => stage.id !== 'closed_lost').map(stage => {
              const stageOpportunities = filteredOpportunities.filter(opp => opp.stage === stage.id);
              const stageValue = stageOpportunities.reduce((sum, opp) => sum + opp.value, 0);

              return (
                <Paper
                  key={stage.id}
                  sx={{
                    minWidth: 300,
                    maxWidth: 320,
                    p: 2,
                    backgroundColor: 'background.paper',
                    border: `2px solid ${stage.color}20`,
                    borderTop: `4px solid ${stage.color}`
                  }}
                >
                  {/* Stage Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        width={12}
                        height={12}
                        borderRadius="50%"
                        sx={{ backgroundColor: stage.color }}
                      />
                      <Typography variant="h6" fontWeight="bold">
                        {stage.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={stageOpportunities.length}
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {stage.probability}%
                    </Typography>
                  </Box>

                  {/* Stage Value Summary */}
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Total Value: <strong>${stageValue.toLocaleString()}</strong>
                    </Typography>
                  </Box>

                  {/* Opportunity Cards */}
                  <Box
                    sx={{
                      maxHeight: 600,
                      overflowY: 'auto',
                      '&::-webkit-scrollbar': { width: 4 },
                      '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
                      '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2 }
                    }}
                  >
                    {stageOpportunities.map(opportunity => (
                      <Card
                        key={opportunity.id}
                        sx={{
                          mb: 2,
                          cursor: 'grab',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 3
                          }
                        }}
                        onClick={() => {
                          setSelectedOpportunity(opportunity);
                          setHistoryDialogOpen(true);
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          {/* Opportunity Title */}
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom noWrap>
                            {opportunity.title}
                          </Typography>

                          {/* Customer */}
                          <Typography variant="body2" color="textSecondary" gutterBottom noWrap>
                            {opportunity.customer.company}
                          </Typography>

                          {/* Value and Commission */}
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" fontWeight="bold" color="primary">
                              ${opportunity.value.toLocaleString()}
                            </Typography>
                            <Chip
                              size="small"
                              label={`${opportunity.commissionRate}%`}
                              color="info"
                              sx={{ fontSize: '0.65rem', height: 16 }}
                            />
                          </Box>

                          {/* Expected Close and Priority */}
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
                            </Typography>
                            <Chip
                              size="small"
                              label={PRIORITIES[opportunity.priority].label}
                              color={PRIORITIES[opportunity.priority].color as any}
                              sx={{ fontSize: '0.65rem', height: 16 }}
                            />
                          </Box>

                          {/* Tags and Status */}
                          <Box display="flex" gap={0.5} flexWrap="wrap">
                            {opportunity.tags.slice(0, 2).map(tag => (
                              <Chip
                                key={tag}
                                size="small"
                                label={tag}
                                variant="outlined"
                                sx={{ fontSize: '0.6rem', height: 16 }}
                              />
                            ))}
                            {opportunity.isOverdue && (
                              <Chip
                                size="small"
                                label="Overdue"
                                color="error"
                                sx={{ fontSize: '0.6rem', height: 16 }}
                              />
                            )}
                          </Box>

                          {/* Days in Stage with Health Status */}
                          <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="textSecondary">
                              {opportunity.daysInStage} days in stage
                            </Typography>
                            {(() => {
                              const status = getStageHealthStatus(opportunity.stage, opportunity.daysInStage);
                              const recommendation = getStageRecommendation(opportunity.stage, opportunity.daysInStage);

                              if (status === 'optimal') return null;

                              return (
                                <Tooltip title={recommendation || ''}>
                                  <Chip
                                    size="small"
                                    label={status === 'warning' ? '⚠' : '🔴'}
                                    sx={{
                                      fontSize: '0.6rem',
                                      height: 16,
                                      minWidth: 20,
                                      backgroundColor: status === 'warning' ? 'warning.light' : 'error.light',
                                      color: status === 'warning' ? 'warning.dark' : 'error.dark'
                                    }}
                                  />
                                </Tooltip>
                              );
                            })()}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Empty State */}
                    {stageOpportunities.length === 0 && (
                      <Box
                        sx={{
                          p: 3,
                          textAlign: 'center',
                          border: '2px dashed',
                          borderColor: 'grey.300',
                          borderRadius: 2,
                          backgroundColor: 'grey.50'
                        }}
                      >
                        <Typography variant="body2" color="textSecondary">
                          No opportunities in this stage
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              );
            })}

            {/* Closed Lost Column */}
            {filteredOpportunities.filter(opp => opp.stage === 'closed_lost').length > 0 && (
              <Paper
                sx={{
                  minWidth: 300,
                  maxWidth: 320,
                  p: 2,
                  backgroundColor: 'background.paper',
                  border: '2px solid #75757520',
                  borderTop: '4px solid #757575'
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      width={12}
                      height={12}
                      borderRadius="50%"
                      sx={{ backgroundColor: '#757575' }}
                    />
                    <Typography variant="h6" fontWeight="bold">
                      Closed Lost
                    </Typography>
                    <Chip
                      size="small"
                      label={filteredOpportunities.filter(opp => opp.stage === 'closed_lost').length}
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </Box>
                </Box>

                <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
                  {filteredOpportunities.filter(opp => opp.stage === 'closed_lost').map(opportunity => (
                    <Card
                      key={opportunity.id}
                      sx={{
                        mb: 2,
                        opacity: 0.7,
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setSelectedOpportunity(opportunity);
                        setHistoryDialogOpen(true);
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom noWrap>
                          {opportunity.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          ${opportunity.value.toLocaleString()}
                        </Typography>
                        {opportunity.lostReason && (
                          <Typography variant="caption" color="error">
                            Reason: {opportunity.lostReason}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Paper>
            )}
          </Box>
        </Box>
      )}

      {/* Create Opportunity Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Opportunity</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Opportunity Title"
                value={newOpportunity.title}
                onChange={(e) => setNewOpportunity({...newOpportunity, title: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Initial Stage</InputLabel>
                <Select
                  value={newOpportunity.stage}
                  onChange={(e) => setNewOpportunity({...newOpportunity, stage: e.target.value})}
                >
                  {PIPELINE_STAGES.filter(s => s.id !== 'closed_won' && s.id !== 'closed_lost').map(stage => (
                    <MenuItem key={stage.id} value={stage.id}>{stage.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={newOpportunity.description}
                onChange={(e) => setNewOpportunity({...newOpportunity, description: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Name"
                value={newOpportunity.customerName}
                onChange={(e) => setNewOpportunity({...newOpportunity, customerName: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Company"
                value={newOpportunity.customerCompany}
                onChange={(e) => setNewOpportunity({...newOpportunity, customerCompany: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Email"
                type="email"
                value={newOpportunity.customerEmail}
                onChange={(e) => setNewOpportunity({...newOpportunity, customerEmail: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Customer Phone"
                value={newOpportunity.customerPhone}
                onChange={(e) => setNewOpportunity({...newOpportunity, customerPhone: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Deal Value"
                type="number"
                value={newOpportunity.value || ''}
                onChange={(e) => setNewOpportunity({...newOpportunity, value: parseFloat(e.target.value) || 0})}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  value={newOpportunity.currency}
                  onChange={(e) => setNewOpportunity({...newOpportunity, currency: e.target.value})}
                >
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="GBP">GBP</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Expected Close Date"
                type="date"
                value={newOpportunity.expectedCloseDate}
                onChange={(e) => setNewOpportunity({...newOpportunity, expectedCloseDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newOpportunity.priority}
                  onChange={(e) => setNewOpportunity({...newOpportunity, priority: e.target.value as any})}
                >
                  {Object.entries(PRIORITIES).map(([key, priority]) => (
                    <MenuItem key={key} value={key}>{priority.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Partner</InputLabel>
                <Select
                  value={newOpportunity.partnerId}
                  onChange={(e) => setNewOpportunity({...newOpportunity, partnerId: e.target.value})}
                >
                  <MenuItem value="">No Partner</MenuItem>
                  <MenuItem value="1">ACME FinOps Solutions</MenuItem>
                  <MenuItem value="2">SecureGuard Technologies</MenuItem>
                  <MenuItem value="3">DataFlow Analytics</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Initial Notes"
                multiline
                rows={3}
                value={newOpportunity.notes}
                onChange={(e) => setNewOpportunity({...newOpportunity, notes: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateOpportunity}>
            Create Opportunity
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Opportunity Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Opportunity</DialogTitle>
        <DialogContent>
          {selectedOpportunity && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Opportunity Title"
                  value={selectedOpportunity.title}
                  onChange={(e) => {
                    const updated = { ...selectedOpportunity, title: e.target.value };
                    setSelectedOpportunity(updated);
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Stage</InputLabel>
                  <Select
                    value={selectedOpportunity.stage}
                    onChange={(e) => {
                      const newStage = e.target.value;
                      const newProbability = PIPELINE_STAGES.find(s => s.id === newStage)?.probability || 0;
                      const updated = {
                        ...selectedOpportunity,
                        stage: newStage,
                        probability: newProbability,
                        weightedValue: selectedOpportunity.value * newProbability / 100
                      };
                      setSelectedOpportunity(updated);
                    }}
                  >
                    {PIPELINE_STAGES.map(stage => (
                      <MenuItem key={stage.id} value={stage.id}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box width={12} height={12} borderRadius="50%" sx={{ backgroundColor: stage.color }} />
                          {stage.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={selectedOpportunity.description || ''}
                  onChange={(e) => {
                    const updated = { ...selectedOpportunity, description: e.target.value };
                    setSelectedOpportunity(updated);
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={selectedOpportunity.customer.name}
                  onChange={(e) => {
                    const updated = {
                      ...selectedOpportunity,
                      customer: { ...selectedOpportunity.customer, name: e.target.value }
                    };
                    setSelectedOpportunity(updated);
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Company"
                  value={selectedOpportunity.customer.company}
                  onChange={(e) => {
                    const updated = {
                      ...selectedOpportunity,
                      customer: { ...selectedOpportunity.customer, company: e.target.value }
                    };
                    setSelectedOpportunity(updated);
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Email"
                  type="email"
                  value={selectedOpportunity.customer.email}
                  onChange={(e) => {
                    const updated = {
                      ...selectedOpportunity,
                      customer: { ...selectedOpportunity.customer, email: e.target.value }
                    };
                    setSelectedOpportunity(updated);
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Phone"
                  value={selectedOpportunity.customer.phone || ''}
                  onChange={(e) => {
                    const updated = {
                      ...selectedOpportunity,
                      customer: { ...selectedOpportunity.customer, phone: e.target.value }
                    };
                    setSelectedOpportunity(updated);
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Deal Value"
                  type="number"
                  value={selectedOpportunity.value}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    const updated = {
                      ...selectedOpportunity,
                      value,
                      weightedValue: value * selectedOpportunity.probability / 100
                    };
                    setSelectedOpportunity(updated);
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={selectedOpportunity.currency}
                    onChange={(e) => {
                      const updated = { ...selectedOpportunity, currency: e.target.value };
                      setSelectedOpportunity(updated);
                    }}
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Expected Close Date"
                  type="date"
                  value={selectedOpportunity.expectedCloseDate.split('T')[0]}
                  onChange={(e) => {
                    const updated = { ...selectedOpportunity, expectedCloseDate: e.target.value };
                    setSelectedOpportunity(updated);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={selectedOpportunity.priority}
                    onChange={(e) => {
                      const updated = { ...selectedOpportunity, priority: e.target.value as any };
                      setSelectedOpportunity(updated);
                    }}
                  >
                    {Object.entries(PRIORITIES).map(([key, priority]) => (
                      <MenuItem key={key} value={key}>{priority.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Assignee</InputLabel>
                  <Select
                    value={selectedOpportunity.assignedTo}
                    onChange={(e) => {
                      const assigneeMap: { [key: string]: string } = {
                        'user1': 'John Doe',
                        'user2': 'Sarah Wilson',
                        'user3': 'Mike Davis'
                      };
                      const updated = {
                        ...selectedOpportunity,
                        assignedTo: e.target.value,
                        assignedToName: assigneeMap[e.target.value] || 'Unknown'
                      };
                      setSelectedOpportunity(updated);
                    }}
                  >
                    <MenuItem value="user1">John Doe</MenuItem>
                    <MenuItem value="user2">Sarah Wilson</MenuItem>
                    <MenuItem value="user3">Mike Davis</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedOpportunity) {
                const updatedOpportunities = opportunities.map(opp =>
                  opp.id === selectedOpportunity.id
                    ? calculateOpportunityMetrics({
                        ...selectedOpportunity,
                        lastUpdated: new Date().toISOString(),
                        history: [
                          ...selectedOpportunity.history,
                          {
                            id: `h_${Date.now()}`,
                            action: 'note_added' as const,
                            timestamp: new Date().toISOString(),
                            userId: 'current_user',
                            userName: 'Current User',
                            details: { note: 'Opportunity updated' }
                          }
                        ]
                      })
                    : opp
                );
                setOpportunities(updatedOpportunities);
                setEditDialogOpen(false);
                setSelectedOpportunity(null);
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Actions ({selectedOpportunities.length} selected)</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Action Type</InputLabel>
                <Select
                  value={bulkAction.type}
                  onChange={(e) => setBulkAction({...bulkAction, type: e.target.value as any})}
                >
                  <MenuItem value="stage_change">Change Stage</MenuItem>
                  <MenuItem value="reassign">Reassign</MenuItem>
                  <MenuItem value="update_priority">Update Priority</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {bulkAction.type === 'stage_change' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>New Stage</InputLabel>
                  <Select
                    value={bulkAction.newStage}
                    onChange={(e) => setBulkAction({...bulkAction, newStage: e.target.value})}
                  >
                    {PIPELINE_STAGES.map(stage => (
                      <MenuItem key={stage.id} value={stage.id}>{stage.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {bulkAction.type === 'reassign' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>New Assignee</InputLabel>
                  <Select
                    value={bulkAction.newAssignee}
                    onChange={(e) => setBulkAction({...bulkAction, newAssignee: e.target.value})}
                  >
                    <MenuItem value="user1">John Doe</MenuItem>
                    <MenuItem value="user2">Sarah Wilson</MenuItem>
                    <MenuItem value="user3">Mike Davis</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {bulkAction.type === 'update_priority' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>New Priority</InputLabel>
                  <Select
                    value={bulkAction.newPriority}
                    onChange={(e) => setBulkAction({...bulkAction, newPriority: e.target.value as any})}
                  >
                    {Object.entries(PRIORITIES).map(([key, priority]) => (
                      <MenuItem key={key} value={key}>{priority.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkAction}>
            Apply Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Opportunity Details/History Dialog */}
      <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} maxWidth="lg" fullWidth>
        {selectedOpportunity && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="between" alignItems="center">
                <Typography variant="h6">{selectedOpportunity.title}</Typography>
                <Chip
                  label={getStageName(selectedOpportunity.stage)}
                  sx={{
                    backgroundColor: getStageColor(selectedOpportunity.stage),
                    color: 'white'
                  }}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Customer Details</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Contact"
                        secondary={`${selectedOpportunity.customer.name} (${selectedOpportunity.customer.email})`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Company"
                        secondary={selectedOpportunity.customer.company}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Opportunity Details</Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Value"
                        secondary={`${selectedOpportunity.currency} ${selectedOpportunity.value.toLocaleString()}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Expected Close"
                        secondary={new Date(selectedOpportunity.expectedCloseDate).toLocaleDateString()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Assignee"
                        secondary={selectedOpportunity.assignedToName}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Stage History</Typography>
                  <Stepper orientation="vertical">
                    {selectedOpportunity.history
                      .filter(h => h.action === 'stage_changed' || h.action === 'created')
                      .reverse()
                      .map((historyItem, index) => (
                        <Step key={historyItem.id} active={true} completed={index > 0}>
                          <StepLabel>
                            {historyItem.action === 'created'
                              ? 'Opportunity Created'
                              : `${getStageName(historyItem.details.fromStage || '')} → ${getStageName(historyItem.details.toStage || '')}`
                            }
                          </StepLabel>
                          <StepContent>
                            <Typography variant="body2" color="textSecondary">
                              {new Date(historyItem.timestamp).toLocaleString()} by {historyItem.userName}
                            </Typography>
                          </StepContent>
                        </Step>
                      ))}
                  </Stepper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
              <Button
                variant="contained"
                onClick={() => {
                  setHistoryDialogOpen(false);
                  setEditDialogOpen(true);
                }}
              >
                Edit Opportunity
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Stage Validation Dialog */}
      <Dialog open={validationDialogOpen} onClose={() => setValidationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning color="warning" />
            Stage Progression Validation
          </Box>
        </DialogTitle>
        <DialogContent>
          {validationResult && (
            <Box>
              <Alert severity={validationResult.isValid ? 'success' : 'error'} sx={{ mb: 2 }}>
                {validationResult.message}
              </Alert>

              {!validationResult.isValid && validationResult.missingFields.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Required Information Missing:
                  </Typography>
                  <List dense>
                    {validationResult.missingFields.map((field) => (
                      <ListItem key={field}>
                        <ListItemText
                          primary={field.replace('.', ' ').replace(/([A-Z])/g, ' $1').toLowerCase()}
                          primaryTypographyProps={{ textTransform: 'capitalize' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {pendingStageChange && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Attempting to move from{' '}
                    <strong>{getStageName(opportunities.find(opp => opp.id === pendingStageChange.opportunityId)?.stage || '')}</strong>
                    {' '}to <strong>{getStageName(pendingStageChange.newStage)}</strong>
                  </Typography>

                  {/* Stage-specific Checklist */}
                  {STAGE_VALIDATION_RULES[pendingStageChange.newStage as keyof typeof STAGE_VALIDATION_RULES]?.checklist && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {getStageName(pendingStageChange.newStage)} Checklist:
                      </Typography>
                      <List dense>
                        {STAGE_VALIDATION_RULES[pendingStageChange.newStage as keyof typeof STAGE_VALIDATION_RULES].checklist.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={item}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setValidationDialogOpen(false);
            setPendingStageChange(null);
            setValidationResult(null);
          }}>
            Cancel
          </Button>
          {validationResult && !validationResult.isValid && (
            <Button
              variant="outlined"
              onClick={() => {
                if (pendingStageChange) {
                  const opportunity = opportunities.find(opp => opp.id === pendingStageChange.opportunityId);
                  if (opportunity) {
                    setSelectedOpportunity(opportunity);
                    setEditDialogOpen(true);
                  }
                }
                setValidationDialogOpen(false);
                setPendingStageChange(null);
                setValidationResult(null);
              }}
            >
              Edit Opportunity
            </Button>
          )}
          {validationResult && validationResult.isValid && (
            <Button
              variant="contained"
              onClick={() => {
                if (pendingStageChange) {
                  executeStageChange(pendingStageChange.opportunityId, pendingStageChange.newStage);
                }
                setValidationDialogOpen(false);
                setPendingStageChange(null);
                setValidationResult(null);
              }}
            >
              Proceed with Stage Change
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OpportunityLifecycleManagement;