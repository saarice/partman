import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  Divider,
  Toolbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Search,
  FilterList,
  ViewList,
  ViewModule,
  Add,
  MoreVert,
  Download,
  Refresh,
  Settings,
  Save,
  Close
} from '@mui/icons-material';
import { FilterSidebar } from '../components/opportunities/FilterSidebar';
import { KanbanView } from '../components/opportunities/KanbanView';
import '../styles/opportunities-enterprise.css';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { opportunitiesApi } from '../services/opportunitiesApi';
import { notify } from '../utils/notifications';
import {
  Opportunity,
  OpportunityFilters,
  OpportunitySort,
  OpportunityStage,
  Partner,
  User,
  SavedView
} from '../types/opportunities';

const STAGES_CONFIG = {
  qualified: { label: 'Qualified', color: '#2196F3' },
  proposal: { label: 'Proposal', color: '#FF9800' },
  negotiation: { label: 'Negotiation', color: '#9C27B0' },
  closing: { label: 'Closing', color: '#4CAF50' },
  won: { label: 'Won', color: '#4CAF50' },
  lost: { label: 'Lost', color: '#F44336' }
};

const HEALTH_CONFIG = {
  healthy: { label: 'Healthy', color: '#4CAF50' },
  'at-risk': { label: 'At Risk', color: '#FF9800' },
  critical: { label: 'Critical', color: '#F44336' }
};

interface OpportunitiesPageProps {}

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  const [filters, setFilters] = useState<OpportunityFilters>({});
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(true);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [currentViewId, setCurrentViewId] = useState<string | undefined>();
  const [saveViewDialogOpen, setSaveViewDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [oppsResponse, partnersData, usersData] = await Promise.all([
        opportunitiesApi.getOpportunities({
          filters,
          search: searchQuery,
          sort: sorting.map(s => ({ field: s.id as keyof Opportunity, direction: s.desc ? 'desc' : 'asc' }))
        }),
        opportunitiesApi.getPartners(),
        opportunitiesApi.getUsers()
      ]);

      setOpportunities(oppsResponse.opportunities);
      setPartners(partnersData);
      setUsers(usersData);
      setError(null);
      notify.success('Opportunities loaded successfully');
    } catch (err) {
      setError('Failed to load opportunities data');
      notify.error('Failed to load opportunities');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, sorting]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const columns = useMemo<ColumnDef<Opportunity>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: 'name',
      header: 'Opportunity',
      cell: ({ row }) => (
        <Box className="opportunity-cell">
          <Box className="opportunity-cell__name">
            {row.original.name}
          </Box>
          {row.original.description && (
            <Box className="opportunity-cell__description">
              {row.original.description}
            </Box>
          )}
        </Box>
      ),
      size: 200,
    },
    {
      accessorKey: 'partner.name',
      header: 'Partner',
      cell: ({ row }) => (
        <Box className="partner-cell">
          <Box className="partner-cell__content">
            {row.original.partner.logoUrl && (
              <Box
                component="img"
                src={row.original.partner.logoUrl}
                alt={row.original.partner.name}
                className="partner-cell__logo"
              />
            )}
            <Box>
              <Box className="partner-cell__name">{row.original.partner.name}</Box>
              <Box className="partner-cell__tier">
                {row.original.partner.type} · {row.original.partner.tier}
              </Box>
            </Box>
          </Box>
        </Box>
      ),
      size: 180,
    },
    {
      accessorKey: 'stage',
      header: 'Stage',
      cell: ({ row }) => {
        const stage = row.original.stage;
        const config = STAGES_CONFIG[stage];
        return (
          <span className={`status-pill status-pill--${stage}`}>
            {config.label}
          </span>
        );
      },
      size: 120,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <Box className="amount-cell">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: row.original.currency
          }).format(row.original.amount)}
        </Box>
      ),
      size: 120,
    },
    {
      accessorKey: 'probability',
      header: 'Probability',
      cell: ({ row }) => {
        const probability = row.original.probability;
        const getProbabilityLevel = (prob: number) => {
          if (prob >= 75) return 'high';
          if (prob >= 50) return 'medium';
          return 'low';
        };

        return (
          <Box className="probability-cell">
            <Box className="probability-bar">
              <Box className="probability-bar__progress">
                <Box
                  className={`probability-bar__fill probability-bar__fill--${getProbabilityLevel(probability)}`}
                  sx={{ width: `${probability}%` }}
                />
              </Box>
              <span className="probability-bar__score">{probability}%</span>
            </Box>
          </Box>
        );
      },
      size: 140,
    },
    {
      accessorKey: 'weightedValue',
      header: 'Weighted Value',
      cell: ({ row }) => (
        <Typography variant="body2" fontWeight="medium">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: row.original.currency
          }).format(row.original.weightedValue)}
        </Typography>
      ),
      size: 140,
    },
    {
      accessorKey: 'owner.name',
      header: 'Owner',
      cell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          {row.original.owner.avatar && (
            <Box
              component="img"
              src={row.original.owner.avatar}
              alt={row.original.owner.name}
              sx={{ width: 24, height: 24, borderRadius: '50%' }}
            />
          )}
          <Typography variant="body2">{row.original.owner.name}</Typography>
        </Box>
      ),
      size: 140,
    },
    {
      accessorKey: 'expectedCloseDate',
      header: 'Expected Close',
      cell: ({ row }) => (
        <Typography variant="body2">
          {new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }).format(new Date(row.original.expectedCloseDate))}
        </Typography>
      ),
      size: 120,
    },
    {
      accessorKey: 'daysInStage',
      header: 'Days in Stage',
      cell: ({ row }) => (
        <Typography variant="body2">
          {row.original.daysInStage}
        </Typography>
      ),
      size: 100,
    },
    {
      accessorKey: 'health',
      header: 'Health',
      cell: ({ row }) => {
        const health = row.original.health;
        const config = HEALTH_CONFIG[health];
        return (
          <span className={`status-pill status-pill--${health}`}>
            {config.label}
          </span>
        );
      },
      size: 100,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <OpportunityActions opportunity={row.original} onUpdate={loadData} />,
      enableSorting: false,
      enableHiding: false,
      size: 80,
    },
  ], [loadData]);

  const table = useReactTable({
    data: opportunities,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 50 }
    }
  });

  const { rows } = table.getRowModel();
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const handleFilterChange = (newFilters: OpportunityFilters) => {
    setFilters(newFilters);
    setCurrentViewId(undefined);
  };

  const handleSaveView = () => {
    if (!newViewName.trim()) return;

    const newView: SavedView = {
      id: Math.random().toString(36).substr(2, 9),
      name: newViewName,
      filters,
      sort: sorting.map(s => ({ field: s.id as keyof Opportunity, direction: s.desc ? 'desc' : 'asc' })),
      columns: Object.keys(columnVisibility).filter(key => columnVisibility[key] !== false),
      createdAt: new Date()
    };

    setSavedViews(prev => [...prev, newView]);
    setCurrentViewId(newView.id);
    setSaveViewDialogOpen(false);
    setNewViewName('');

    notify.success('View saved successfully');
  };

  const handleLoadView = (view: SavedView) => {
    setFilters(view.filters);
    setSorting(view.sort.map(s => ({ id: s.field as string, desc: s.direction === 'desc' })));
    setCurrentViewId(view.id);
  };

  const handleDeleteView = (viewId: string) => {
    setSavedViews(prev => prev.filter(v => v.id !== viewId));
    if (currentViewId === viewId) {
      setCurrentViewId(undefined);
    }
    notify.success('View deleted successfully');
  };

  const handleOpportunityUpdate = async (opportunityId: string, updates: Partial<Opportunity>) => {
    try {
      const response = await opportunitiesApi.updateOpportunity(opportunityId, updates);
      if (response.success) {
        setOpportunities(prev =>
          prev.map(opp => opp.id === opportunityId ? response.data : opp)
        );
        notify.success('Opportunity updated successfully');
      } else {
        notify.error(response.message || 'Failed to update opportunity');
      }
    } catch (error) {
      notify.error('Failed to update opportunity');
    }
  };

  const handleOpportunityAction = (opportunity: Opportunity, action: string) => {
    switch (action) {
      case 'edit':
        notify.info('Edit opportunity feature coming soon');
        break;
      case 'view':
        notify.info('View details feature coming soon');
        break;
      case 'change-owner':
        notify.info('Change owner feature coming soon');
        break;
      case 'update-probability':
        notify.info('Update probability feature coming soon');
        break;
      case 'delete':
        notify.info('Delete opportunity feature coming soon');
        break;
      default:
        break;
    }
  };

  const selectedRowCount = Object.keys(rowSelection).length;

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {filterSidebarOpen && (
        <FilterSidebar
          filters={filters}
          onFiltersChange={handleFilterChange}
          partners={partners}
          users={users}
          savedViews={savedViews}
          currentViewId={currentViewId}
          onLoadView={handleLoadView}
          onDeleteView={handleDeleteView}
          onSaveCurrentView={() => setSaveViewDialogOpen(true)}
          className="filter-sidebar"
        />
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Container maxWidth={false} sx={{ py: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" fontWeight="bold">
              Active Opportunities
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadData}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  notify.info('Create opportunity feature coming soon');
                }}
              >
                Create Opportunity
              </Button>
            </Box>
          </Box>

      <Paper sx={{ mb: 2 }}>
        <Toolbar sx={{ px: 2 }}>
          <TextField
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />

          <Box sx={{ flexGrow: 1 }} />

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="table">
              <ViewList />
            </ToggleButton>
            <ToggleButton value="kanban">
              <ViewModule />
            </ToggleButton>
          </ToggleButtonGroup>

          <IconButton
            onClick={() => setFilterSidebarOpen(!filterSidebarOpen)}
            color={filterSidebarOpen ? "primary" : "default"}
          >
            <FilterList />
          </IconButton>

          <IconButton onClick={() => setSaveViewDialogOpen(true)}>
            <Save />
          </IconButton>

          <IconButton>
            <Settings />
          </IconButton>
        </Toolbar>

        {selectedRowCount > 0 && (
          <Box sx={{ px: 2, py: 1, backgroundColor: 'action.selected' }}>
            <Typography variant="body2">
              {selectedRowCount} opportunities selected
            </Typography>
          </Box>
        )}
      </Paper>

      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography>Loading opportunities...</Typography>
        </Paper>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : viewMode === 'table' ? (
        <Paper className="opportunities-table-container">
          <Box
            ref={parentRef}
            className="virtualized-table-container"
            sx={{
              height: 600,
              overflow: 'auto',
            }}
          >
            <Box sx={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
              <Box
                className="virtualized-table-header"
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  backgroundColor: '#f8fafc',
                  borderBottom: '2px solid #e5e7eb',
                }}
              >
                {table.getHeaderGroups().map(headerGroup => (
                  <Box
                    key={headerGroup.id}
                    sx={{ display: 'flex', minWidth: 'fit-content' }}
                  >
                    {headerGroup.headers.map(header => (
                      <Box
                        key={header.id}
                        className="virtualized-table-cell"
                        sx={{
                          width: header.getSize(),
                          minWidth: header.getSize(),
                          padding: '12px 16px',
                          fontWeight: 600,
                          color: '#374151',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          cursor: header.column.getCanSort() ? 'pointer' : 'default',
                          '&:hover': header.column.getCanSort() ? {
                            backgroundColor: '#f1f5f9'
                          } : {}
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() && (
                          <span>
                            {header.column.getIsSorted() === 'desc' ? ' ↓' : ' ↑'}
                          </span>
                        )}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>

              {virtualItems.map(virtualItem => {
                const row = rows[virtualItem.index];
                return (
                  <Box
                    key={row.id}
                    className="virtualized-table-row"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: virtualItem.size,
                      transform: `translateY(${virtualItem.start}px)`,
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background-color 150ms ease',
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                      },
                    }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <Box
                        key={cell.id}
                        className="virtualized-table-cell"
                        sx={{
                          width: cell.column.getSize(),
                          minWidth: cell.column.getSize(),
                          padding: '12px 16px',
                          borderRight: '1px solid #f1f5f9',
                          '&:last-child': {
                            borderRight: 'none'
                          }
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Box>
                    ))}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Paper>
      ) : (
          <KanbanView
            opportunities={opportunities}
            onOpportunityUpdate={handleOpportunityUpdate}
            onOpportunityAction={handleOpportunityAction}
          />
        )}

        </Container>
      </Box>

      <SaveViewDialog
        open={saveViewDialogOpen}
        onClose={() => setSaveViewDialogOpen(false)}
        viewName={newViewName}
        onViewNameChange={setNewViewName}
        onSave={handleSaveView}
      />
    </Box>
  );
};

interface OpportunityActionsProps {
  opportunity: Opportunity;
  onUpdate: () => void;
}

const OpportunityActions: React.FC<OpportunityActionsProps> = ({ opportunity, onUpdate }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        className="action-menu-trigger"
        sx={{
          transition: 'all 150ms ease',
          '&:hover': {
            backgroundColor: '#f3f4f6',
            transform: 'scale(1.1)',
          }
        }}
      >
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            minWidth: 180,
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={handleClose}
          sx={{
            fontSize: '14px',
            padding: '8px 16px',
            '&:hover': { backgroundColor: '#f8fafc' }
          }}
        >
          Edit Opportunity
        </MenuItem>
        <MenuItem
          onClick={handleClose}
          sx={{
            fontSize: '14px',
            padding: '8px 16px',
            '&:hover': { backgroundColor: '#f8fafc' }
          }}
        >
          View Details
        </MenuItem>
        <Divider sx={{ margin: '4px 0' }} />
        <MenuItem
          onClick={handleClose}
          sx={{
            fontSize: '14px',
            padding: '8px 16px',
            '&:hover': { backgroundColor: '#f8fafc' }
          }}
        >
          Move Stage
        </MenuItem>
        <MenuItem
          onClick={handleClose}
          sx={{
            fontSize: '14px',
            padding: '8px 16px',
            '&:hover': { backgroundColor: '#f8fafc' }
          }}
        >
          Change Owner
        </MenuItem>
        <MenuItem
          onClick={handleClose}
          sx={{
            fontSize: '14px',
            padding: '8px 16px',
            '&:hover': { backgroundColor: '#f8fafc' }
          }}
        >
          Update Probability
        </MenuItem>
        <Divider sx={{ margin: '4px 0' }} />
        <MenuItem
          onClick={handleClose}
          sx={{
            fontSize: '14px',
            padding: '8px 16px',
            color: '#dc2626',
            '&:hover': {
              backgroundColor: '#fef2f2',
              color: '#dc2626'
            }
          }}
        >
          Delete Opportunity
        </MenuItem>
      </Menu>
    </>
  );
};


interface SaveViewDialogProps {
  open: boolean;
  onClose: () => void;
  viewName: string;
  onViewNameChange: (name: string) => void;
  onSave: () => void;
}

const SaveViewDialog: React.FC<SaveViewDialogProps> = ({
  open,
  onClose,
  viewName,
  onViewNameChange,
  onSave
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Save Current View</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="View Name"
          fullWidth
          variant="outlined"
          value={viewName}
          onChange={(e) => onViewNameChange(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" disabled={!viewName.trim()}>
          Save View
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OpportunitiesPage;