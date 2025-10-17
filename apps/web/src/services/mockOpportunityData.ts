/**
 * Mock Opportunity Data Service
 *
 * This file provides mock data for development.
 * In production, replace these functions with real API calls:
 *
 * export const getOpportunities = async (): Promise<Opportunity[]> => {
 *   const response = await fetch('/api/opportunities');
 *   return response.json();
 * };
 */

import { Opportunity, Partner, OpportunityOwner } from '../types/opportunity';

// Helper to calculate days between dates
const daysBetween = (date1: Date, date2: Date): number => {
  const diff = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Mock partners
const mockPartners: Partner[] = [
  {
    id: 'partner-001',
    name: 'CloudTech Solutions',
    type: 'Technology',
    tier: 'Enterprise'
  },
  {
    id: 'partner-002',
    name: 'SecureData Inc',
    type: 'Security',
    tier: 'Premium'
  },
  {
    id: 'partner-003',
    name: 'DevOps Pro',
    type: 'Professional Services',
    tier: 'Standard'
  },
  {
    id: 'partner-004',
    name: 'Analytics Plus',
    type: 'Data Analytics',
    tier: 'Premium'
  },
  {
    id: 'partner-005',
    name: 'Digital Partners Corp',
    type: 'Technology',
    tier: 'Strategic'
  },
  {
    id: 'partner-006',
    name: 'FinOps Masters',
    type: 'FinOps',
    tier: 'Enterprise'
  }
];

// Mock owners
const mockOwners: OpportunityOwner[] = [
  { id: 'user-001', name: 'John Smith', email: 'john@partman.com' },
  { id: 'user-002', name: 'Sarah Johnson', email: 'sarah@partman.com' },
  { id: 'user-003', name: 'Mike Davis', email: 'mike@partman.com' },
  { id: 'user-004', name: 'Emily Chen', email: 'emily@partman.com' },
  { id: 'user-005', name: 'Robert Lee', email: 'robert@partman.com' }
];

/**
 * Get mock opportunities
 * Replace with: fetch('/api/opportunities')
 */
export const getMockOpportunities = (): Opportunity[] => {
  const now = new Date();

  return [
    {
      id: 'opp-001',
      name: 'Enterprise Cloud Migration',
      description: 'Full cloud infrastructure migration for enterprise client',
      partner: mockPartners[0],
      stage: 'proposal',
      amount: 500000,
      currency: 'USD',
      probability: 75,
      weightedValue: 375000,
      owner: mockOwners[0],
      expectedCloseDate: new Date('2025-11-15'),
      createdDate: new Date('2025-09-01'),
      lastModifiedDate: new Date('2025-10-10'),
      daysInStage: 14,
      health: 'healthy',
      tags: ['Enterprise', 'Cloud', 'Strategic']
    },
    {
      id: 'opp-002',
      name: 'Security Assessment Package',
      description: 'Comprehensive security audit and implementation',
      partner: mockPartners[1],
      stage: 'negotiation',
      amount: 150000,
      currency: 'USD',
      probability: 65,
      weightedValue: 97500,
      owner: mockOwners[1],
      expectedCloseDate: new Date('2025-10-30'),
      createdDate: new Date('2025-08-15'),
      lastModifiedDate: new Date('2025-10-08'),
      daysInStage: 21,
      health: 'at-risk',
      tags: ['Security', 'Compliance']
    },
    {
      id: 'opp-003',
      name: 'DevOps Transformation',
      description: 'End-to-end DevOps process implementation',
      partner: mockPartners[2],
      stage: 'qualified',
      amount: 220000,
      currency: 'USD',
      probability: 40,
      weightedValue: 88000,
      owner: mockOwners[2],
      expectedCloseDate: new Date('2025-12-01'),
      createdDate: new Date('2025-10-01'),
      lastModifiedDate: new Date('2025-10-10'),
      daysInStage: 7,
      health: 'healthy',
      tags: ['DevOps', 'Automation']
    },
    {
      id: 'opp-004',
      name: 'Analytics Platform Upgrade',
      description: 'Modern data analytics platform implementation',
      partner: mockPartners[3],
      stage: 'closing',
      amount: 380000,
      currency: 'USD',
      probability: 90,
      weightedValue: 342000,
      owner: mockOwners[3],
      expectedCloseDate: new Date('2025-10-25'),
      createdDate: new Date('2025-07-15'),
      lastModifiedDate: new Date('2025-10-12'),
      daysInStage: 35,
      health: 'healthy',
      tags: ['Analytics', 'Data']
    },
    {
      id: 'opp-005',
      name: 'Digital Migration Project',
      description: 'Large-scale digital transformation initiative',
      partner: mockPartners[4],
      stage: 'negotiation',
      amount: 750000,
      currency: 'USD',
      probability: 55,
      weightedValue: 412500,
      owner: mockOwners[4],
      expectedCloseDate: new Date('2025-11-30'),
      createdDate: new Date('2025-06-01'),
      lastModifiedDate: new Date('2025-10-05'),
      daysInStage: 42,
      health: 'critical',
      tags: ['Enterprise', 'Transformation', 'Strategic']
    },
    {
      id: 'opp-006',
      name: 'Cost Optimization Initiative',
      description: 'Cloud cost optimization and FinOps implementation',
      partner: mockPartners[5],
      stage: 'proposal',
      amount: 175000,
      currency: 'USD',
      probability: 70,
      weightedValue: 122500,
      owner: mockOwners[0],
      expectedCloseDate: new Date('2025-11-10'),
      createdDate: new Date('2025-09-15'),
      lastModifiedDate: new Date('2025-10-11'),
      daysInStage: 18,
      health: 'healthy',
      tags: ['FinOps', 'Cost Optimization']
    },
    {
      id: 'opp-007',
      name: 'Multi-Cloud Strategy',
      description: 'Strategic multi-cloud architecture design',
      partner: mockPartners[0],
      stage: 'qualified',
      amount: 425000,
      currency: 'USD',
      probability: 45,
      weightedValue: 191250,
      owner: mockOwners[1],
      expectedCloseDate: new Date('2025-12-15'),
      createdDate: new Date('2025-09-20'),
      lastModifiedDate: new Date('2025-10-09'),
      daysInStage: 12,
      health: 'healthy',
      tags: ['Cloud', 'Strategy']
    },
    {
      id: 'opp-008',
      name: 'Security Compliance Audit',
      description: 'SOC2 and ISO compliance preparation',
      partner: mockPartners[1],
      stage: 'closing',
      amount: 95000,
      currency: 'USD',
      probability: 85,
      weightedValue: 80750,
      owner: mockOwners[2],
      expectedCloseDate: new Date('2025-10-28'),
      createdDate: new Date('2025-08-01'),
      lastModifiedDate: new Date('2025-10-13'),
      daysInStage: 28,
      health: 'healthy',
      tags: ['Security', 'Compliance']
    }
  ];
};

/**
 * Get opportunities with filters applied
 * Replace with: fetch('/api/opportunities', { params: filters })
 */
export const getFilteredOpportunities = (
  stage?: string,
  health?: string,
  search?: string
): Opportunity[] => {
  let opportunities = getMockOpportunities();

  if (stage && stage !== 'all') {
    opportunities = opportunities.filter(opp => opp.stage === stage);
  }

  if (health && health !== 'all') {
    opportunities = opportunities.filter(opp => opp.health === health);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    opportunities = opportunities.filter(
      opp =>
        opp.name.toLowerCase().includes(searchLower) ||
        opp.partner.name.toLowerCase().includes(searchLower) ||
        opp.description?.toLowerCase().includes(searchLower)
    );
  }

  return opportunities;
};

/**
 * Get historical opportunity data for trends
 * Replace with: fetch('/api/opportunities/history')
 */
export const getMockOpportunityHistory = () => {
  return [
    { period: 'Jan', value: 1850000, opportunities: 42, wonDeals: 8 },
    { period: 'Feb', value: 2100000, opportunities: 48, wonDeals: 10 },
    { period: 'Mar', value: 2350000, opportunities: 52, wonDeals: 12 },
    { period: 'Apr', value: 2600000, opportunities: 58, wonDeals: 14 },
    { period: 'May', value: 2850000, opportunities: 61, wonDeals: 15 },
    { period: 'Jun', value: 3100000, opportunities: 65, wonDeals: 17 }
  ];
};

/**
 * Get previous period metrics for growth calculation
 * Replace with: fetch('/api/opportunities/metrics?period=previous')
 */
export const getPreviousPeriodMetrics = () => {
  return {
    totalOpportunities: 68,
    totalValue: 2950000,
    totalWeightedValue: 1820000,
    wonDeals: 15
  };
};
