export interface Partner {
  id: string;
  name: string;
  type: 'Enterprise' | 'Premium' | 'Standard' | 'Startup';
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  logoUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export type OpportunityStage = 'qualified' | 'proposal' | 'negotiation' | 'closing' | 'won' | 'lost';

export interface Opportunity {
  id: string;
  name: string;
  description?: string;
  partner: Partner;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
  stage: OpportunityStage;
  probability: number; // 0-100
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  owner: User;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;

  // Computed fields
  daysInStage: number;
  weightedValue: number; // amount * (probability / 100)
  isOverdue: boolean;
  agingStatus: 'fresh' | 'warning' | 'overdue';
  health: 'healthy' | 'at-risk' | 'critical';
}

export interface OpportunityFilters {
  stages?: OpportunityStage[];
  owners?: string[];
  partners?: string[];
  amountMin?: number;
  amountMax?: number;
  closeDateFrom?: Date;
  closeDateTo?: Date;
  probabilityMin?: number;
  probabilityMax?: number;
  text?: string;
  health?: ('healthy' | 'at-risk' | 'critical')[];
}

export interface OpportunitySort {
  field: keyof Opportunity;
  direction: 'asc' | 'desc';
}

export interface OpportunityListParams {
  filters?: OpportunityFilters;
  sort?: OpportunitySort[];
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface OpportunityListResponse {
  opportunities: Opportunity[];
  totalCount: number;
  totalValue: number;
  weightedTotalValue: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SavedView {
  id: string;
  name: string;
  filters: OpportunityFilters;
  sort: OpportunitySort[];
  columns: string[];
  isDefault?: boolean;
  createdAt: Date;
}

export interface BulkAction {
  type: 'move-stage' | 'assign-owner' | 'delete' | 'export';
  opportunityIds: string[];
  params?: {
    newStage?: OpportunityStage;
    newOwnerId?: string;
    exportFormat?: 'csv' | 'xlsx';
  };
}

export interface OpportunityMutation {
  id: string;
  updates: Partial<Opportunity>;
}

export interface TableColumn {
  id: string;
  key: keyof Opportunity;
  label: string;
  width: number;
  minWidth: number;
  sortable: boolean;
  pinned?: 'left' | 'right' | false;
  visible: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface TableDensity {
  name: 'compact' | 'comfortable' | 'spacious';
  rowHeight: number;
}

export interface OpportunityActivity {
  id: string;
  opportunityId: string;
  type: 'stage_change' | 'owner_change' | 'amount_change' | 'note' | 'email' | 'call' | 'meeting';
  description: string;
  userId: string;
  user: User;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface OpportunityDetails extends Opportunity {
  activities: OpportunityActivity[];
  notes: string;
  tags: string[];
  customFields?: Record<string, any>;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  aggregates?: {
    totalValue: number;
    weightedValue: number;
    averageProbability: number;
  };
}

// UI State types
export interface UIState {
  selectedOpportunities: string[];
  isLoading: boolean;
  error: string | null;
  view: 'table' | 'kanban';
  tableConfig: {
    columns: TableColumn[];
    density: TableDensity;
    sort: OpportunitySort[];
  };
  filters: OpportunityFilters;
  searchQuery: string;
  savedViews: SavedView[];
  currentViewId?: string;
  detailsDrawer: {
    isOpen: boolean;
    opportunityId?: string;
  };
  bulkActionBar: {
    isVisible: boolean;
    selectedCount: number;
  };
}

// Event types for optimistic updates
export interface OptimisticUpdate {
  id: string;
  type: 'update' | 'create' | 'delete' | 'stage-change' | 'owner-change';
  opportunity: Opportunity;
  originalValue?: Opportunity;
  timestamp: Date;
}