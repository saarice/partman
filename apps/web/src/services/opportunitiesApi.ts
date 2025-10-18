// Temporary inline ALL types to workaround Vite caching issue
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
  probability: number;
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  owner: User;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  daysInStage: number;
  weightedValue: number;
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

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

interface BulkAction {
  type: 'move-stage' | 'assign-owner' | 'delete' | 'export';
  opportunityIds: string[];
  params?: {
    newStage?: OpportunityStage;
    newOwnerId?: string;
    exportFormat?: 'csv' | 'xlsx';
  };
}

const mockPartners: Partner[] = [
  { id: '1', name: 'TechCorp', type: 'Enterprise', tier: 'Tier 1', logoUrl: '/logos/techcorp.png' },
  { id: '2', name: 'StartupXYZ', type: 'Startup', tier: 'Tier 3' },
  { id: '3', name: 'MegaCorp Inc', type: 'Enterprise', tier: 'Tier 1', logoUrl: '/logos/megacorp.png' },
  { id: '4', name: 'PremiumSoft', type: 'Premium', tier: 'Tier 2' },
  { id: '5', name: 'CloudTech', type: 'Standard', tier: 'Tier 2' }
];

const mockUsers: User[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', role: 'Sales Manager', avatar: '/avatars/john.png' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Senior Sales Rep', avatar: '/avatars/sarah.png' },
  { id: '3', name: 'Mike Chen', email: 'mike@example.com', role: 'Account Executive' },
  { id: '4', name: 'Lisa Rodriguez', email: 'lisa@example.com', role: 'VP Sales', avatar: '/avatars/lisa.png' },
  { id: '5', name: 'David Kim', email: 'david@example.com', role: 'Sales Rep' }
];

function calculateComputedFields(opportunity: Omit<Opportunity, 'daysInStage' | 'weightedValue' | 'isOverdue' | 'agingStatus' | 'health'>): Opportunity {
  const now = new Date();
  const stageStartDate = opportunity.lastActivityAt;
  const daysInStage = Math.floor((now.getTime() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const weightedValue = opportunity.amount * (opportunity.probability / 100);
  const isOverdue = opportunity.expectedCloseDate < now && !['won', 'lost'].includes(opportunity.stage);

  let agingStatus: 'fresh' | 'warning' | 'overdue' = 'fresh';
  if (daysInStage > 30) agingStatus = 'overdue';
  else if (daysInStage > 14) agingStatus = 'warning';

  let health: 'healthy' | 'at-risk' | 'critical' = 'healthy';
  if (isOverdue || daysInStage > 45) health = 'critical';
  else if (daysInStage > 21 || opportunity.probability < 30) health = 'at-risk';

  return {
    ...opportunity,
    daysInStage,
    weightedValue,
    isOverdue,
    agingStatus,
    health
  };
}

const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    name: 'Enterprise CRM Implementation',
    description: 'Full CRM rollout for Fortune 500 company',
    partner: mockPartners[0],
    amount: 250000,
    currency: 'USD',
    stage: 'negotiation',
    probability: 75,
    expectedCloseDate: new Date('2024-12-15'),
    owner: mockUsers[0],
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-11-01'),
    lastActivityAt: new Date('2024-10-15'),
    daysInStage: 0,
    weightedValue: 0,
    isOverdue: false,
    agingStatus: 'fresh',
    health: 'healthy'
  },
  {
    id: '2',
    name: 'Cloud Migration Project',
    description: 'AWS migration and optimization services',
    partner: mockPartners[2],
    amount: 150000,
    currency: 'USD',
    stage: 'proposal',
    probability: 60,
    expectedCloseDate: new Date('2025-01-30'),
    owner: mockUsers[1],
    createdAt: new Date('2024-09-15'),
    updatedAt: new Date('2024-10-20'),
    lastActivityAt: new Date('2024-10-01'),
    daysInStage: 0,
    weightedValue: 0,
    isOverdue: false,
    agingStatus: 'fresh',
    health: 'healthy'
  },
  {
    id: '3',
    name: 'Security Audit Package',
    partner: mockPartners[3],
    amount: 75000,
    currency: 'USD',
    stage: 'qualified',
    probability: 40,
    expectedCloseDate: new Date('2024-11-20'),
    owner: mockUsers[2],
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-11-05'),
    lastActivityAt: new Date('2024-09-20'),
    daysInStage: 0,
    weightedValue: 0,
    isOverdue: false,
    agingStatus: 'fresh',
    health: 'healthy'
  },
  {
    id: '4',
    name: 'Analytics Platform Setup',
    description: 'Business intelligence and reporting platform',
    partner: mockPartners[1],
    amount: 125000,
    currency: 'USD',
    stage: 'closing',
    probability: 90,
    expectedCloseDate: new Date('2024-11-25'),
    owner: mockUsers[3],
    createdAt: new Date('2024-07-15'),
    updatedAt: new Date('2024-11-10'),
    lastActivityAt: new Date('2024-11-08'),
    daysInStage: 0,
    weightedValue: 0,
    isOverdue: false,
    agingStatus: 'fresh',
    health: 'healthy'
  },
  {
    id: '5',
    name: 'Mobile App Development',
    partner: mockPartners[4],
    amount: 180000,
    currency: 'USD',
    stage: 'won',
    probability: 100,
    expectedCloseDate: new Date('2024-10-30'),
    actualCloseDate: new Date('2024-10-28'),
    owner: mockUsers[4],
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-10-28'),
    lastActivityAt: new Date('2024-10-28'),
    daysInStage: 0,
    weightedValue: 0,
    isOverdue: false,
    agingStatus: 'fresh',
    health: 'healthy'
  }
].map(calculateComputedFields);

const mockActivities: OpportunityActivity[] = [
  {
    id: '1',
    opportunityId: '1',
    type: 'stage_change',
    description: 'Moved from Proposal to Negotiation',
    userId: '1',
    user: mockUsers[0],
    createdAt: new Date('2024-10-15'),
    metadata: { previousStage: 'proposal', newStage: 'negotiation' }
  },
  {
    id: '2',
    opportunityId: '1',
    type: 'note',
    description: 'Customer requested additional security features',
    userId: '1',
    user: mockUsers[0],
    createdAt: new Date('2024-10-10')
  },
  {
    id: '3',
    opportunityId: '2',
    type: 'amount_change',
    description: 'Updated deal value from $120k to $150k',
    userId: '2',
    user: mockUsers[1],
    createdAt: new Date('2024-10-05'),
    metadata: { previousAmount: 120000, newAmount: 150000 }
  }
];

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function applyFilters(opportunities: Opportunity[], filters: OpportunityListParams['filters'] = {}): Opportunity[] {
  return opportunities.filter(opp => {
    if (filters.stages && filters.stages.length > 0) {
      if (!filters.stages.includes(opp.stage)) return false;
    }

    if (filters.owners && filters.owners.length > 0) {
      if (!filters.owners.includes(opp.owner.id)) return false;
    }

    if (filters.partners && filters.partners.length > 0) {
      if (!filters.partners.includes(opp.partner.id)) return false;
    }

    if (filters.amountMin !== undefined) {
      if (opp.amount < filters.amountMin) return false;
    }

    if (filters.amountMax !== undefined) {
      if (opp.amount > filters.amountMax) return false;
    }

    if (filters.probabilityMin !== undefined) {
      if (opp.probability < filters.probabilityMin) return false;
    }

    if (filters.probabilityMax !== undefined) {
      if (opp.probability > filters.probabilityMax) return false;
    }

    if (filters.closeDateFrom) {
      if (opp.expectedCloseDate < filters.closeDateFrom) return false;
    }

    if (filters.closeDateTo) {
      if (opp.expectedCloseDate > filters.closeDateTo) return false;
    }

    if (filters.health && filters.health.length > 0) {
      if (!filters.health.includes(opp.health)) return false;
    }

    if (filters.text) {
      const searchText = filters.text.toLowerCase();
      return opp.name.toLowerCase().includes(searchText) ||
             opp.partner.name.toLowerCase().includes(searchText) ||
             opp.owner.name.toLowerCase().includes(searchText) ||
             (opp.description && opp.description.toLowerCase().includes(searchText));
    }

    return true;
  });
}

function applySorting(opportunities: Opportunity[], sort: OpportunityListParams['sort'] = []): Opportunity[] {
  if (sort.length === 0) {
    return opportunities.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  return [...opportunities].sort((a, b) => {
    for (const sortRule of sort) {
      const aValue = a[sortRule.field];
      const bValue = b[sortRule.field];

      if (aValue === bValue) continue;

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sortRule.direction === 'desc' ? -comparison : comparison;
    }
    return 0;
  });
}

export const opportunitiesApi = {
  async getOpportunities(params: OpportunityListParams = {}): Promise<OpportunityListResponse> {
    await delay(300);

    let filteredOpps = applyFilters(mockOpportunities, params.filters);

    if (params.search) {
      const searchText = params.search.toLowerCase();
      filteredOpps = filteredOpps.filter(opp =>
        opp.name.toLowerCase().includes(searchText) ||
        opp.partner.name.toLowerCase().includes(searchText) ||
        opp.owner.name.toLowerCase().includes(searchText)
      );
    }

    filteredOpps = applySorting(filteredOpps, params.sort);

    const totalCount = filteredOpps.length;
    const totalValue = filteredOpps.reduce((sum, opp) => sum + opp.amount, 0);
    const weightedTotalValue = filteredOpps.reduce((sum, opp) => sum + opp.weightedValue, 0);

    const page = params.page || 1;
    const pageSize = params.pageSize || 50;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedOpps = filteredOpps.slice(startIndex, endIndex);

    return {
      opportunities: paginatedOpps,
      totalCount,
      totalValue,
      weightedTotalValue,
      hasNextPage: endIndex < totalCount,
      hasPreviousPage: page > 1
    };
  },

  async getOpportunityDetails(id: string): Promise<OpportunityDetails | null> {
    await delay(200);

    const opportunity = mockOpportunities.find(opp => opp.id === id);
    if (!opportunity) return null;

    const activities = mockActivities.filter(activity => activity.opportunityId === id);

    return {
      ...opportunity,
      activities,
      notes: 'Customer is very interested in our security features and scalability options.',
      tags: ['high-priority', 'enterprise', 'security-focused'],
      customFields: {
        leadSource: 'Trade Show',
        industry: 'Technology',
        companySize: '1000-5000'
      }
    };
  },

  async updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<ApiResponse<Opportunity>> {
    await delay(500);

    const oppIndex = mockOpportunities.findIndex(opp => opp.id === id);
    if (oppIndex === -1) {
      return {
        data: null as any,
        success: false,
        message: 'Opportunity not found',
        errors: ['Opportunity with specified ID does not exist']
      };
    }

    const updatedOpp = calculateComputedFields({
      ...mockOpportunities[oppIndex],
      ...updates,
      updatedAt: new Date()
    });

    mockOpportunities[oppIndex] = updatedOpp;

    return {
      data: updatedOpp,
      success: true,
      message: 'Opportunity updated successfully'
    };
  },

  async createOpportunity(opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'daysInStage' | 'weightedValue' | 'isOverdue' | 'agingStatus' | 'health'>): Promise<ApiResponse<Opportunity>> {
    await delay(600);

    const now = new Date();
    const newOpp = calculateComputedFields({
      ...opportunity,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now
    });

    mockOpportunities.push(newOpp);

    return {
      data: newOpp,
      success: true,
      message: 'Opportunity created successfully'
    };
  },

  async deleteOpportunity(id: string): Promise<ApiResponse<void>> {
    await delay(300);

    const oppIndex = mockOpportunities.findIndex(opp => opp.id === id);
    if (oppIndex === -1) {
      return {
        success: false,
        message: 'Opportunity not found',
        errors: ['Opportunity with specified ID does not exist'],
        data: undefined
      };
    }

    mockOpportunities.splice(oppIndex, 1);

    return {
      success: true,
      message: 'Opportunity deleted successfully',
      data: undefined
    };
  },

  async bulkAction(action: BulkAction): Promise<ApiResponse<void>> {
    await delay(800);

    const { type, opportunityIds, params } = action;

    switch (type) {
      case 'move-stage':
        if (!params?.newStage) {
          return {
            success: false,
            message: 'New stage is required',
            errors: ['newStage parameter is required for move-stage action'],
            data: undefined
          };
        }

        opportunityIds.forEach(id => {
          const oppIndex = mockOpportunities.findIndex(opp => opp.id === id);
          if (oppIndex !== -1) {
            mockOpportunities[oppIndex] = calculateComputedFields({
              ...mockOpportunities[oppIndex],
              stage: params.newStage as OpportunityStage,
              updatedAt: new Date(),
              lastActivityAt: new Date()
            });
          }
        });
        break;

      case 'assign-owner':
        if (!params?.newOwnerId) {
          return {
            success: false,
            message: 'New owner ID is required',
            errors: ['newOwnerId parameter is required for assign-owner action'],
            data: undefined
          };
        }

        {
        const newOwner = mockUsers.find(user => user.id === params.newOwnerId);
        if (!newOwner) {
          return {
            success: false,
            message: 'Owner not found',
            errors: ['User with specified ID does not exist'],
            data: undefined
          };
        }

        opportunityIds.forEach(id => {
          const oppIndex = mockOpportunities.findIndex(opp => opp.id === id);
          if (oppIndex !== -1) {
            mockOpportunities[oppIndex] = {
              ...mockOpportunities[oppIndex],
              owner: newOwner,
              updatedAt: new Date()
            };
          }
        });
        }
        break;

      case 'delete':
        opportunityIds.forEach(id => {
          const oppIndex = mockOpportunities.findIndex(opp => opp.id === id);
          if (oppIndex !== -1) {
            mockOpportunities.splice(oppIndex, 1);
          }
        });
        break;

      case 'export':
        return {
          success: true,
          message: `Export initiated for ${opportunityIds.length} opportunities in ${params?.exportFormat || 'csv'} format`,
          data: undefined
        };

      default:
        return {
          success: false,
          message: 'Invalid bulk action type',
          errors: ['Unsupported bulk action type'],
          data: undefined
        };
    }

    return {
      success: true,
      message: `Bulk ${type} completed successfully for ${opportunityIds.length} opportunities`,
      data: undefined
    };
  },

  async getPartners(): Promise<Partner[]> {
    await delay(200);
    return mockPartners;
  },

  async getUsers(): Promise<User[]> {
    await delay(200);
    return mockUsers;
  }
};