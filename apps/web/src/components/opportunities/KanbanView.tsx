import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  MoreVert,
  Person,
  AttachMoney,
  TrendingUp
} from '@mui/icons-material';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Opportunity, OpportunityStage } from '../../types/opportunities';

const STAGES_CONFIG = {
  qualified: { label: 'Qualified', color: '#2196F3' },
  proposal: { label: 'Proposal', color: '#FF9800' },
  negotiation: { label: 'Negotiation', color: '#9C27B0' },
  closing: { label: 'Closing', color: '#4CAF50' },
  won: { label: 'Won', color: '#4CAF50' },
  lost: { label: 'Lost', color: '#F44336' }
};

const STAGE_ORDER: OpportunityStage[] = ['qualified', 'proposal', 'negotiation', 'closing', 'won', 'lost'];

interface KanbanViewProps {
  opportunities: Opportunity[];
  onOpportunityUpdate: (opportunityId: string, updates: Partial<Opportunity>) => void;
  onOpportunityAction: (opportunity: Opportunity, action: string) => void;
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  onAction: (opportunity: Opportunity, action: string) => void;
  isDragging?: boolean;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onAction,
  isDragging = false
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: opportunity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: string) => {
    onAction(opportunity, action);
    handleMenuClose();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        mb: 2,
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing'
        },
        '&:hover': {
          boxShadow: 2
        },
        border: `2px solid transparent`,
        ...(opportunity.health === 'critical' && {
          borderColor: '#F44336'
        }),
        ...(opportunity.health === 'at-risk' && {
          borderColor: '#FF9800'
        })
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1, mr: 1 }}>
            {opportunity.name}
          </Typography>
          <IconButton
            size="small"
            onClick={handleMenuClick}
            sx={{ ml: 1 }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        {opportunity.description && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {opportunity.description.length > 80
              ? `${opportunity.description.substring(0, 80)}...`
              : opportunity.description
            }
          </Typography>
        )}

        <Box display="flex" alignItems="center" gap={1} mb={1}>
          {opportunity.partner.logoUrl ? (
            <Avatar
              src={opportunity.partner.logoUrl}
              alt={opportunity.partner.name}
              sx={{ width: 20, height: 20 }}
            />
          ) : (
            <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
              {opportunity.partner.name.charAt(0)}
            </Avatar>
          )}
          <Typography variant="caption" color="text.secondary">
            {opportunity.partner.name}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={0.5} mb={1}>
          <AttachMoney fontSize="small" color="action" />
          <Typography variant="body2" fontWeight="medium">
            {formatCurrency(opportunity.amount, opportunity.currency)}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            ({opportunity.probability}%)
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={0.5} mb={1}>
          <TrendingUp fontSize="small" color="action" />
          <Typography variant="caption">
            {formatCurrency(opportunity.weightedValue, opportunity.currency)} weighted
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Person fontSize="small" color="action" />
            <Typography variant="caption">
              {opportunity.owner.name}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {formatDate(opportunity.expectedCloseDate)}
          </Typography>
        </Box>

        <Box display="flex" gap={0.5} flexWrap="wrap">
          <Chip
            label={`${opportunity.daysInStage}d in stage`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
          {opportunity.isOverdue && (
            <Chip
              label="Overdue"
              size="small"
              color="error"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
          {opportunity.health !== 'healthy' && (
            <Chip
              label={opportunity.health === 'at-risk' ? 'At Risk' : 'Critical'}
              size="small"
              color={opportunity.health === 'at-risk' ? 'warning' : 'error'}
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleAction('edit')}>Edit</MenuItem>
          <MenuItem onClick={() => handleAction('view')}>View Details</MenuItem>
          <Divider />
          <MenuItem onClick={() => handleAction('change-owner')}>Change Owner</MenuItem>
          <MenuItem onClick={() => handleAction('update-probability')}>Update Probability</MenuItem>
          <Divider />
          <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
            Delete
          </MenuItem>
        </Menu>
      </CardContent>
    </Card>
  );
};

interface KanbanColumnProps {
  stage: OpportunityStage;
  opportunities: Opportunity[];
  onOpportunityAction: (opportunity: Opportunity, action: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  opportunities,
  onOpportunityAction
}) => {
  const stageConfig = STAGES_CONFIG[stage];
  const totalValue = opportunities.reduce((sum, opp) => sum + opp.amount, 0);
  const weightedValue = opportunities.reduce((sum, opp) => sum + opp.weightedValue, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  return (
    <Paper
      sx={{
        width: 320,
        minHeight: 600,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'grey.50'
      }}
    >
      <Box
        sx={{
          p: 2,
          backgroundColor: stageConfig.color,
          color: 'white',
          borderRadius: '4px 4px 0 0'
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {stageConfig.label}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {opportunities.length} opportunities
        </Typography>
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="caption">
            Total: {formatCurrency(totalValue)}
          </Typography>
          <Typography variant="caption">
            Weighted: {formatCurrency(weightedValue)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
        <SortableContext items={opportunities.map(o => o.id)} strategy={verticalListSortingStrategy}>
          {opportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              onAction={onOpportunityAction}
            />
          ))}
        </SortableContext>
      </Box>
    </Paper>
  );
};

export const KanbanView: React.FC<KanbanViewProps> = ({
  opportunities,
  onOpportunityUpdate,
  onOpportunityAction
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedOpportunity, setDraggedOpportunity] = useState<Opportunity | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const groupedOpportunities = STAGE_ORDER.reduce((acc, stage) => {
    acc[stage] = opportunities.filter(opp => opp.stage === stage);
    return acc;
  }, {} as Record<OpportunityStage, Opportunity[]>);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    const opportunity = opportunities.find(opp => opp.id === active.id);
    setDraggedOpportunity(opportunity || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setDraggedOpportunity(null);
      return;
    }

    const activeOpportunity = opportunities.find(opp => opp.id === active.id);
    if (!activeOpportunity) {
      setActiveId(null);
      setDraggedOpportunity(null);
      return;
    }

    // Check if we're dropping on a different stage
    const overStage = STAGE_ORDER.find(stage =>
      groupedOpportunities[stage].some(opp => opp.id === over.id) ||
      over.id === stage
    );

    if (overStage && overStage !== activeOpportunity.stage) {
      onOpportunityUpdate(activeOpportunity.id, {
        stage: overStage,
        lastActivityAt: new Date(),
        updatedAt: new Date()
      });
    }

    setActiveId(null);
    setDraggedOpportunity(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 2,
          minHeight: 'calc(100vh - 200px)'
        }}
      >
        {STAGE_ORDER.map((stage) => (
          <Box key={stage} sx={{ flexShrink: 0 }}>
            <KanbanColumn
              stage={stage}
              opportunities={groupedOpportunities[stage]}
              onOpportunityAction={onOpportunityAction}
            />
          </Box>
        ))}
      </Box>

      <DragOverlay>
        {activeId && draggedOpportunity ? (
          <OpportunityCard
            opportunity={draggedOpportunity}
            onAction={() => {}}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanView;