import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Stack,
  Divider,
  Badge
} from '@mui/material';
import {
  Edit,
  TrendingUp,
  TrendingDown,
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
  owner: {
    name: string;
    avatar?: string;
  };
  expectedCloseDate: string;
  daysInStage: number;
  health: 'healthy' | 'at-risk' | 'critical';
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  opportunities: Opportunity[];
}

const STAGE_CONFIG = {
  qualified: { title: 'Qualified', color: '#2196F3' },
  proposal: { title: 'Proposal', color: '#FF9800' },
  negotiation: { title: 'Negotiation', color: '#9C27B0' },
  closing: { title: 'Closing', color: '#4CAF50' },
  won: { title: 'Won', color: '#4CAF50' },
  lost: { title: 'Lost', color: '#F44336' }
};

const HEALTH_COLORS = {
  healthy: '#4caf50',
  'at-risk': '#ff9800',
  critical: '#f44336'
};

const OpportunityKanban: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [draggedOpportunity, setDraggedOpportunity] = useState<Opportunity | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  useEffect(() => {
    loadOpportunityData();
  }, []);

  useEffect(() => {
    // Organize opportunities into columns by stage
    const newColumns: KanbanColumn[] = Object.entries(STAGE_CONFIG).map(([stage, config]) => ({
      id: stage,
      title: config.title,
      color: config.color,
      opportunities: opportunities.filter(opp => opp.stage === stage)
    }));
    setColumns(newColumns);
  }, [opportunities]);

  const loadOpportunityData = () => {
    // Mock data - same as the table view
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
  };

  const handleDragStart = (opportunity: Opportunity) => {
    setDraggedOpportunity(opportunity);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetStage: string) => {
    if (!draggedOpportunity) return;

    // Update opportunity stage
    setOpportunities(prev =>
      prev.map(opp =>
        opp.id === draggedOpportunity.id
          ? { ...opp, stage: targetStage as Opportunity['stage'] }
          : opp
      )
    );

    setDraggedOpportunity(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getColumnTotal = (columnOpportunities: Opportunity[]) => {
    return columnOpportunities.reduce((sum, opp) => sum + opp.weightedValue, 0);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Opportunity Pipeline - Kanban View
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Drag and drop opportunities between stages to update their status
      </Typography>

      {/* Kanban Board */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 2
        }}
      >
        {columns.map((column) => (
          <Paper
            key={column.id}
            sx={{
              minWidth: 320,
              maxWidth: 320,
              backgroundColor: '#f5f5f5',
              p: 2
            }}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            {/* Column Header */}
            <Box sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: column.color
                    }}
                  />
                  <Typography variant="h6" fontWeight="bold">
                    {column.title}
                  </Typography>
                  <Chip
                    label={column.opportunities.length}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" fontWeight="bold">
                {formatCurrency(getColumnTotal(column.opportunities))}
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
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s'
                    },
                    borderLeft: `4px solid ${HEALTH_COLORS[opportunity.health]}`
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    {/* Title */}
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {opportunity.name}
                    </Typography>

                    {/* Partner */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {opportunity.partner.name}
                    </Typography>

                    {/* Amount and Probability */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {formatCurrency(opportunity.amount)}
                      </Typography>
                      <Chip
                        label={`${opportunity.probability}%`}
                        size="small"
                        color={opportunity.probability >= 70 ? 'success' : 'default'}
                        icon={opportunity.probability >= 70 ? <TrendingUp /> : <TrendingDown />}
                      />
                    </Box>

                    {/* Weighted Value */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      Weighted: {formatCurrency(opportunity.weightedValue)}
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Owner and Date */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AccountCircle fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {opportunity.owner.name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(opportunity.expectedCloseDate)}
                      </Typography>
                    </Box>

                    {/* Health Indicator */}
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
                      <Typography variant="caption" color="text.secondary">
                        {opportunity.daysInStage} days
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {/* Empty State */}
              {column.opportunities.length === 0 && (
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    color: 'text.secondary',
                    backgroundColor: 'background.paper',
                    borderRadius: 1,
                    border: '2px dashed',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="body2">
                    Drop opportunities here
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        ))}
      </Box>

      {/* Edit Dialog */}
      <OpportunityEditDialog
        open={editDialogOpen}
        opportunity={selectedOpportunity}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedOpportunity(null);
        }}
        onSave={(updatedData) => {
          if (selectedOpportunity) {
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

export default OpportunityKanban;
