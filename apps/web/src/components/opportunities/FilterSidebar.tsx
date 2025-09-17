import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
  TextField,
  Slider,
  FormControlLabel,
  Switch,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore,
  FilterList,
  Clear,
  Bookmark,
  BookmarkBorder,
  Delete,
  Edit
} from '@mui/icons-material';
import {
  OpportunityFilters,
  OpportunityStage,
  Partner,
  User,
  SavedView
} from '../../types/opportunities';

const STAGES_CONFIG = {
  qualified: { label: 'Qualified', color: '#2196F3' },
  proposal: { label: 'Proposal', color: '#FF9800' },
  negotiation: { label: 'Negotiation', color: '#9C27B0' },
  closing: { label: 'Closing', color: '#4CAF50' },
  won: { label: 'Won', color: '#4CAF50' },
  lost: { label: 'Lost', color: '#F44336' }
};

const HEALTH_OPTIONS = [
  { value: 'healthy', label: 'Healthy', color: '#4CAF50' },
  { value: 'at-risk', label: 'At Risk', color: '#FF9800' },
  { value: 'critical', label: 'Critical', color: '#F44336' }
];

interface FilterSidebarProps {
  filters: OpportunityFilters;
  onFiltersChange: (filters: OpportunityFilters) => void;
  partners: Partner[];
  users: User[];
  savedViews: SavedView[];
  currentViewId?: string;
  onLoadView: (view: SavedView) => void;
  onDeleteView: (viewId: string) => void;
  onSaveCurrentView: () => void;
  className?: string;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFiltersChange,
  partners,
  users,
  savedViews,
  currentViewId,
  onLoadView,
  onDeleteView,
  onSaveCurrentView,
  className
}) => {
  const [expandedPanels, setExpandedPanels] = useState<string[]>([
    'stages',
    'amount',
    'saved-views'
  ]);

  const handlePanelChange = (panel: string) => (
    _: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedPanels(prev =>
      isExpanded
        ? [...prev, panel]
        : prev.filter(p => p !== panel)
    );
  };

  const updateFilter = <K extends keyof OpportunityFilters>(
    key: K,
    value: OpportunityFilters[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof OpportunityFilters];
    return Array.isArray(value) ? value.length > 0 : value !== undefined;
  });

  const getFilterCount = () => {
    return Object.keys(filters).reduce((count, key) => {
      const value = filters[key as keyof OpportunityFilters];
      if (Array.isArray(value)) {
        return count + (value.length > 0 ? 1 : 0);
      }
      return count + (value !== undefined ? 1 : 0);
    }, 0);
  };

  return (
    <Paper
      className={className}
      sx={{
        width: 320,
        height: 'calc(100vh - 200px)',
        overflowY: 'auto',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <FilterList />
            <Typography variant="h6" fontWeight="bold">
              Filters
            </Typography>
            {hasActiveFilters && (
              <Chip
                label={getFilterCount()}
                size="small"
                color="primary"
                sx={{ minWidth: 24, height: 20 }}
              />
            )}
          </Box>
          {hasActiveFilters && (
            <Tooltip title="Clear all filters">
              <IconButton size="small" onClick={clearFilters}>
                <Clear />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {hasActiveFilters && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Bookmark />}
            onClick={onSaveCurrentView}
            fullWidth
          >
            Save Current View
          </Button>
        )}
      </Box>

      <Box sx={{ p: 0 }}>
        {/* Saved Views */}
        <Accordion
          expanded={expandedPanels.includes('saved-views')}
          onChange={handlePanelChange('saved-views')}
          disableGutters
          elevation={0}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Typography fontWeight="medium">Saved Views</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List dense>
              {savedViews.length === 0 ? (
                <ListItem>
                  <Typography variant="body2" color="text.secondary">
                    No saved views yet
                  </Typography>
                </ListItem>
              ) : (
                savedViews.map((view) => (
                  <ListItem key={view.id} disablePadding>
                    <ListItemButton
                      selected={currentViewId === view.id}
                      onClick={() => onLoadView(view)}
                    >
                      <ListItemIcon>
                        {view.isDefault ? <Bookmark /> : <BookmarkBorder />}
                      </ListItemIcon>
                      <ListItemText
                        primary={view.name}
                        secondary={new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric'
                        }).format(view.createdAt)}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteView(view.id);
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Stage Filter */}
        <Accordion
          expanded={expandedPanels.includes('stages')}
          onChange={handlePanelChange('stages')}
          disableGutters
          elevation={0}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Typography fontWeight="medium">Stages</Typography>
            {filters.stages && filters.stages.length > 0 && (
              <Chip
                label={filters.stages.length}
                size="small"
                color="primary"
                sx={{ ml: 1, minWidth: 24, height: 20 }}
              />
            )}
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Stages</InputLabel>
              <Select
                multiple
                value={filters.stages || []}
                onChange={(e) => updateFilter('stages', e.target.value as OpportunityStage[])}
                input={<OutlinedInput label="Select Stages" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={STAGES_CONFIG[value].label}
                        size="small"
                        sx={{
                          backgroundColor: STAGES_CONFIG[value].color,
                          color: 'white'
                        }}
                      />
                    ))}
                  </Box>
                )}
              >
                {Object.entries(STAGES_CONFIG).map(([stage, config]) => (
                  <MenuItem key={stage} value={stage}>
                    <Checkbox checked={(filters.stages || []).indexOf(stage as OpportunityStage) > -1} />
                    <ListItemText primary={config.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        {/* Amount Filter */}
        <Accordion
          expanded={expandedPanels.includes('amount')}
          onChange={handlePanelChange('amount')}
          disableGutters
          elevation={0}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Typography fontWeight="medium">Amount Range</Typography>
            {(filters.amountMin !== undefined || filters.amountMax !== undefined) && (
              <Chip
                label="Active"
                size="small"
                color="primary"
                sx={{ ml: 1, minWidth: 24, height: 20 }}
              />
            )}
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <TextField
                label="Minimum Amount"
                type="number"
                value={filters.amountMin || ''}
                onChange={(e) => updateFilter('amountMin', Number(e.target.value) || undefined)}
                size="small"
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>
                }}
              />
              <TextField
                label="Maximum Amount"
                type="number"
                value={filters.amountMax || ''}
                onChange={(e) => updateFilter('amountMax', Number(e.target.value) || undefined)}
                size="small"
                InputProps={{
                  startAdornment: <Typography variant="body2" sx={{ mr: 1 }}>$</Typography>
                }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Probability Filter */}
        <Accordion
          expanded={expandedPanels.includes('probability')}
          onChange={handlePanelChange('probability')}
          disableGutters
          elevation={0}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Typography fontWeight="medium">Probability</Typography>
            {(filters.probabilityMin !== undefined || filters.probabilityMax !== undefined) && (
              <Chip
                label="Active"
                size="small"
                color="primary"
                sx={{ ml: 1, minWidth: 24, height: 20 }}
              />
            )}
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <Box sx={{ px: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {filters.probabilityMin || 0}% - {filters.probabilityMax || 100}%
              </Typography>
              <Slider
                value={[filters.probabilityMin || 0, filters.probabilityMax || 100]}
                onChange={(_, newValue) => {
                  const [min, max] = newValue as number[];
                  updateFilter('probabilityMin', min === 0 ? undefined : min);
                  updateFilter('probabilityMax', max === 100 ? undefined : max);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={100}
                step={5}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' }
                ]}
              />
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Partners Filter */}
        <Accordion
          expanded={expandedPanels.includes('partners')}
          onChange={handlePanelChange('partners')}
          disableGutters
          elevation={0}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Typography fontWeight="medium">Partners</Typography>
            {filters.partners && filters.partners.length > 0 && (
              <Chip
                label={filters.partners.length}
                size="small"
                color="primary"
                sx={{ ml: 1, minWidth: 24, height: 20 }}
              />
            )}
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Partners</InputLabel>
              <Select
                multiple
                value={filters.partners || []}
                onChange={(e) => updateFilter('partners', e.target.value as string[])}
                input={<OutlinedInput label="Select Partners" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const partner = partners.find(p => p.id === value);
                      return (
                        <Chip
                          key={value}
                          label={partner?.name || value}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {partners.map((partner) => (
                  <MenuItem key={partner.id} value={partner.id}>
                    <Checkbox checked={(filters.partners || []).indexOf(partner.id) > -1} />
                    <ListItemText
                      primary={partner.name}
                      secondary={`${partner.type} · ${partner.tier}`}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        {/* Owners Filter */}
        <Accordion
          expanded={expandedPanels.includes('owners')}
          onChange={handlePanelChange('owners')}
          disableGutters
          elevation={0}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Typography fontWeight="medium">Owners</Typography>
            {filters.owners && filters.owners.length > 0 && (
              <Chip
                label={filters.owners.length}
                size="small"
                color="primary"
                sx={{ ml: 1, minWidth: 24, height: 20 }}
              />
            )}
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Owners</InputLabel>
              <Select
                multiple
                value={filters.owners || []}
                onChange={(e) => updateFilter('owners', e.target.value as string[])}
                input={<OutlinedInput label="Select Owners" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const user = users.find(u => u.id === value);
                      return (
                        <Chip
                          key={value}
                          label={user?.name || value}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Checkbox checked={(filters.owners || []).indexOf(user.id) > -1} />
                    <ListItemText
                      primary={user.name}
                      secondary={user.role}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        {/* Health Filter */}
        <Accordion
          expanded={expandedPanels.includes('health')}
          onChange={handlePanelChange('health')}
          disableGutters
          elevation={0}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Typography fontWeight="medium">Health Status</Typography>
            {filters.health && filters.health.length > 0 && (
              <Chip
                label={filters.health.length}
                size="small"
                color="primary"
                sx={{ ml: 1, minWidth: 24, height: 20 }}
              />
            )}
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Health Status</InputLabel>
              <Select
                multiple
                value={filters.health || []}
                onChange={(e) => updateFilter('health', e.target.value as ('healthy' | 'at-risk' | 'critical')[])}
                input={<OutlinedInput label="Select Health Status" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const config = HEALTH_OPTIONS.find(h => h.value === value);
                      return (
                        <Chip
                          key={value}
                          label={config?.label || value}
                          size="small"
                          sx={{
                            borderColor: config?.color,
                            color: config?.color
                          }}
                          variant="outlined"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {HEALTH_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Checkbox checked={(filters.health || []).indexOf(option.value as any) > -1} />
                    <ListItemText primary={option.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        {/* Date Range Filter */}
        <Accordion
          expanded={expandedPanels.includes('dates')}
          onChange={handlePanelChange('dates')}
          disableGutters
          elevation={0}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Typography fontWeight="medium">Close Date Range</Typography>
            {(filters.closeDateFrom || filters.closeDateTo) && (
              <Chip
                label="Active"
                size="small"
                color="primary"
                sx={{ ml: 1, minWidth: 24, height: 20 }}
              />
            )}
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2 }}>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <TextField
                label="From Date"
                type="date"
                value={filters.closeDateFrom ? filters.closeDateFrom.toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilter('closeDateFrom', e.target.value ? new Date(e.target.value) : undefined)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="To Date"
                type="date"
                value={filters.closeDateTo ? filters.closeDateTo.toISOString().split('T')[0] : ''}
                onChange={(e) => updateFilter('closeDateTo', e.target.value ? new Date(e.target.value) : undefined)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Paper>
  );
};

export default FilterSidebar;