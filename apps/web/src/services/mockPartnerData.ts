/**
 * Mock Partner Data Service
 * Replace with real API calls in production
 */

import type { Partner, PartnerContact } from '../types/partner';

const mockContacts: PartnerContact[] = [
  { name: 'John Smith', title: 'VP of Partnerships', email: 'john@cloudtech.com', phone: '+1-555-0101' },
  { name: 'Sarah Johnson', title: 'Director of Sales', email: 'sarah@securedata.com', phone: '+1-555-0102' },
  { name: 'Mike Chen', title: 'Business Development', email: 'mike@devopspro.com', phone: '+1-555-0103' },
  { name: 'Emily Rodriguez', title: 'Partnership Manager', email: 'emily@analyticsplus.com', phone: '+1-555-0104' },
  { name: 'David Kim', title: 'CEO', email: 'david@digitalpartners.com', phone: '+1-555-0105' },
  { name: 'Lisa Wang', title: 'Head of Partnerships', email: 'lisa@finopsmasters.com', phone: '+1-555-0106' },
  { name: 'Robert Taylor', title: 'Sales Director', email: 'robert@techsolutions.com', phone: '+1-555-0107' },
  { name: 'Jennifer Lee', title: 'VP Business Development', email: 'jennifer@cloudservices.com', phone: '+1-555-0108' },
  { name: 'Tom Anderson', title: 'Partnership Lead', email: 'tom@datasecurity.com', phone: '+1-555-0109' },
  { name: 'Maria Garcia', title: 'Director of Alliances', email: 'maria@devopsexperts.com', phone: '+1-555-0110' }
];

/**
 * Get mock partners
 * Replace with: fetch('/api/partners')
 */
export const getMockPartners = (): Partner[] => {
  return [
    {
      id: 'partner-001',
      name: 'CloudTech Solutions',
      category: 'Technology',
      tier: 'Tier 1',
      healthScore: 92,
      healthStatus: 'excellent',
      quarterlyRevenue: 450000,
      activeOpportunities: 8,
      contact: mockContacts[0],
      nextAction: 'Quarterly business review scheduled for next week',
      lastActivity: new Date('2025-10-15'),
      tags: ['Strategic', 'Cloud', 'Enterprise']
    },
    {
      id: 'partner-002',
      name: 'SecureData Inc',
      category: 'Security',
      tier: 'Tier 2',
      healthScore: 78,
      healthStatus: 'healthy',
      quarterlyRevenue: 280000,
      activeOpportunities: 5,
      contact: mockContacts[1],
      nextAction: 'Follow up on renewal proposal',
      lastActivity: new Date('2025-10-12'),
      tags: ['Security', 'Compliance']
    },
    {
      id: 'partner-003',
      name: 'DevOps Pro',
      category: 'Professional Services',
      tier: 'Tier 3',
      healthScore: 55,
      healthStatus: 'at-risk',
      quarterlyRevenue: 125000,
      activeOpportunities: 3,
      contact: mockContacts[2],
      nextAction: 'Schedule strategy call to address concerns',
      lastActivity: new Date('2025-09-28'),
      tags: ['DevOps', 'Automation']
    },
    {
      id: 'partner-004',
      name: 'Analytics Plus',
      category: 'Data Analytics',
      tier: 'Tier 2',
      healthScore: 85,
      healthStatus: 'healthy',
      quarterlyRevenue: 310000,
      activeOpportunities: 6,
      contact: mockContacts[3],
      nextAction: 'Discuss co-marketing opportunity',
      lastActivity: new Date('2025-10-14'),
      tags: ['Analytics', 'Data', 'BI']
    },
    {
      id: 'partner-005',
      name: 'Digital Partners Corp',
      category: 'Technology',
      tier: 'Tier 1',
      healthScore: 95,
      healthStatus: 'excellent',
      quarterlyRevenue: 520000,
      activeOpportunities: 12,
      contact: mockContacts[4],
      nextAction: 'Expand partnership to new regions',
      lastActivity: new Date('2025-10-16'),
      tags: ['Strategic', 'Digital Transformation']
    },
    {
      id: 'partner-006',
      name: 'FinOps Masters',
      category: 'FinOps',
      tier: 'Tier 1',
      healthScore: 88,
      healthStatus: 'healthy',
      quarterlyRevenue: 390000,
      activeOpportunities: 7,
      contact: mockContacts[5],
      nextAction: 'Prepare for executive steering committee',
      lastActivity: new Date('2025-10-13'),
      tags: ['FinOps', 'Cost Optimization']
    },
    {
      id: 'partner-007',
      name: 'Tech Solutions Inc',
      category: 'Technology',
      tier: 'Tier 2',
      healthScore: 72,
      healthStatus: 'healthy',
      quarterlyRevenue: 215000,
      activeOpportunities: 4,
      contact: mockContacts[6],
      nextAction: 'Review Q4 pipeline together',
      lastActivity: new Date('2025-10-10'),
      tags: ['Technology', 'Infrastructure']
    },
    {
      id: 'partner-008',
      name: 'Cloud Services Group',
      category: 'Technology',
      tier: 'Tier 2',
      healthScore: 68,
      healthStatus: 'healthy',
      quarterlyRevenue: 195000,
      activeOpportunities: 5,
      contact: mockContacts[7],
      nextAction: 'Training session for new solutions',
      lastActivity: new Date('2025-10-11'),
      tags: ['Cloud', 'Services']
    },
    {
      id: 'partner-009',
      name: 'Data Security Experts',
      category: 'Security',
      tier: 'Tier 2',
      healthScore: 45,
      healthStatus: 'critical',
      quarterlyRevenue: 85000,
      activeOpportunities: 2,
      contact: mockContacts[8],
      nextAction: 'URGENT: Address performance issues',
      lastActivity: new Date('2025-09-20'),
      tags: ['Security', 'Critical']
    },
    {
      id: 'partner-010',
      name: 'DevOps Experts LLC',
      category: 'DevOps',
      tier: 'Tier 3',
      healthScore: 82,
      healthStatus: 'healthy',
      quarterlyRevenue: 165000,
      activeOpportunities: 4,
      contact: mockContacts[9],
      nextAction: 'Plan joint webinar series',
      lastActivity: new Date('2025-10-09'),
      tags: ['DevOps', 'CI/CD']
    }
  ];
};

/**
 * Get previous quarter metrics for comparison
 */
export const getPreviousQuarterMetrics = () => {
  return {
    totalPartners: 9,
    totalRevenue: 2350000,
    averageHealth: 74
  };
};
