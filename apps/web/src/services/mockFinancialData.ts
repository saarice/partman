import type { RevenueData, Deal } from '../types/financial';

export const getMockRevenue = (): RevenueData[] => {
  return [
    { period: 'Jan', amount: 450000, category: 'Recurring', growth: 8.5 },
    { period: 'Feb', amount: 520000, category: 'Recurring', growth: 15.5 },
    { period: 'Mar', amount: 480000, category: 'Recurring', growth: 6.7 },
    { period: 'Apr', amount: 610000, category: 'Recurring', growth: 27.1 },
    { period: 'May', amount: 580000, category: 'Recurring', growth: -4.9 },
    { period: 'Jun', amount: 720000, category: 'Recurring', growth: 24.1 },
    { period: 'Jul', amount: 680000, category: 'Recurring', growth: -5.6 },
    { period: 'Aug', amount: 750000, category: 'Recurring', growth: 10.3 },
    { period: 'Sep', amount: 820000, category: 'Recurring', growth: 9.3 },
    { period: 'Oct', amount: 780000, category: 'Recurring', growth: -4.9 }
  ];
};

export const getMockDeals = (): Deal[] => {
  return [
    { id: '1', partner: 'CloudTech Solutions', amount: 500000, closeDate: new Date('2025-09-15'), category: 'Technology' },
    { id: '2', partner: 'SecureData Inc', amount: 280000, closeDate: new Date('2025-08-22'), category: 'Security' },
    { id: '3', partner: 'Analytics Plus', amount: 310000, closeDate: new Date('2025-09-30'), category: 'Data Analytics' },
    { id: '4', partner: 'FinOps Masters', amount: 390000, closeDate: new Date('2025-10-05'), category: 'FinOps' },
    { id: '5', partner: 'DevOps Pro', amount: 220000, closeDate: new Date('2025-08-10'), category: 'DevOps' }
  ];
};
