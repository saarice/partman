/**
 * Frontend Unit Test Template: Opportunity Calculations
 *
 * Priority: P0 - CRITICAL
 * Location: apps/web/src/utils/__tests__/opportunityCalculations.test.ts
 * Target Coverage: 90%+
 *
 * This template provides comprehensive test coverage for business calculation logic
 * to prevent data display regressions (incorrect metrics, growth rates, etc.)
 */

import {
  calculateOpportunityMetrics,
  formatLargeNumber,
  formatGrowthRate,
  getRevenueDistribution,
  calculatePerformanceTrends,
  getAtRiskOpportunities,
  calculateConversionRate,
  calculateWeightedValue,
  getDealVelocity
} from '../opportunityCalculations';
import type { Opportunity, OpportunityMetrics, OpportunityHistoryData } from '../../types/opportunity';

describe('opportunityCalculations', () => {
  // Sample test data
  const sampleOpportunities: Opportunity[] = [
    {
      id: 'opp-1',
      name: 'Deal A',
      partnerId: 'partner-1',
      partnerName: 'CloudTech Solutions',
      value: 100000,
      stage: 'qualified',
      probability: 10,
      expectedCloseDate: '2025-03-01',
      createdDate: '2025-01-01',
      owner: { id: 'user-1', name: 'John Doe', email: 'john@example.com' }
    },
    {
      id: 'opp-2',
      name: 'Deal B',
      partnerId: 'partner-1',
      partnerName: 'CloudTech Solutions',
      value: 250000,
      stage: 'proposal',
      probability: 50,
      expectedCloseDate: '2025-02-15',
      createdDate: '2024-12-15',
      owner: { id: 'user-1', name: 'John Doe', email: 'john@example.com' }
    },
    {
      id: 'opp-3',
      name: 'Deal C',
      partnerId: 'partner-2',
      partnerName: 'SecureData Inc',
      value: 500000,
      stage: 'negotiation',
      probability: 75,
      expectedCloseDate: '2025-02-01',
      createdDate: '2024-11-01',
      owner: { id: 'user-2', name: 'Sarah Smith', email: 'sarah@example.com' }
    },
    {
      id: 'opp-4',
      name: 'Deal D - Won',
      partnerId: 'partner-2',
      partnerName: 'SecureData Inc',
      value: 300000,
      stage: 'won',
      probability: 100,
      expectedCloseDate: '2025-01-10',
      createdDate: '2024-10-01',
      closedDate: '2025-01-10',
      owner: { id: 'user-1', name: 'John Doe', email: 'john@example.com' }
    },
    {
      id: 'opp-5',
      name: 'Deal E - Lost',
      partnerId: 'partner-3',
      partnerName: 'DevOps Pro',
      value: 150000,
      stage: 'lost',
      probability: 0,
      expectedCloseDate: '2025-01-20',
      createdDate: '2024-09-15',
      closedDate: '2025-01-20',
      lostReason: 'Price too high',
      owner: { id: 'user-2', name: 'Sarah Smith', email: 'sarah@example.com' }
    }
  ];

  describe('calculateOpportunityMetrics', () => {
    it('should calculate total value of all opportunities', () => {
      const result = calculateOpportunityMetrics(sampleOpportunities);

      const expectedTotal = 100000 + 250000 + 500000 + 300000 + 150000;
      expect(result.totalValue).toBe(expectedTotal); // 1,300,000
    });

    it('should calculate active opportunities (excluding won/lost)', () => {
      const result = calculateOpportunityMetrics(sampleOpportunities);

      expect(result.activeCount).toBe(3); // qualified, proposal, negotiation
    });

    it('should calculate weighted value using probability', () => {
      const result = calculateOpportunityMetrics(sampleOpportunities);

      // (100000 * 0.10) + (250000 * 0.50) + (500000 * 0.75) + (300000 * 1.0) + (150000 * 0)
      const expectedWeighted = 10000 + 125000 + 375000 + 300000 + 0;
      expect(result.weightedValue).toBe(expectedWeighted); // 810,000
    });

    it('should calculate average deal size', () => {
      const result = calculateOpportunityMetrics(sampleOpportunities);

      const expectedAvg = 1300000 / 5;
      expect(result.averageDealSize).toBe(expectedAvg); // 260,000
    });

    it('should calculate growth rate vs previous period', () => {
      const previousMetrics = {
        totalValue: 1000000,
        activeCount: 5,
        weightedValue: 500000,
        averageDealSize: 200000
      };

      const result = calculateOpportunityMetrics(sampleOpportunities, previousMetrics);

      // Growth rate: ((1300000 - 1000000) / 1000000) * 100 = 30%
      expect(result.growthRate).toBeCloseTo(30, 1);
    });

    it('should handle empty opportunities array', () => {
      const result = calculateOpportunityMetrics([]);

      expect(result.totalValue).toBe(0);
      expect(result.activeCount).toBe(0);
      expect(result.weightedValue).toBe(0);
      expect(result.averageDealSize).toBe(0);
      expect(result.growthRate).toBe(0);
    });

    it('should handle null/undefined previous metrics', () => {
      const result = calculateOpportunityMetrics(sampleOpportunities, null);

      expect(result.growthRate).toBe(0); // No previous data to compare
    });

    it('should calculate conversion rate (won / total closed)', () => {
      const result = calculateOpportunityMetrics(sampleOpportunities);

      // 1 won out of 2 closed = 50%
      expect(result.conversionRate).toBe(50);
    });

    it('should handle divide by zero when no previous value', () => {
      const previousMetrics = {
        totalValue: 0,
        activeCount: 0,
        weightedValue: 0,
        averageDealSize: 0
      };

      const result = calculateOpportunityMetrics(sampleOpportunities, previousMetrics);

      expect(result.growthRate).toBe(0); // Should not return Infinity or NaN
    });

    it('should handle negative growth rate correctly', () => {
      const previousMetrics = {
        totalValue: 2000000, // Higher than current
        activeCount: 8,
        weightedValue: 1000000,
        averageDealSize: 250000
      };

      const result = calculateOpportunityMetrics(sampleOpportunities, previousMetrics);

      // Growth rate: ((1300000 - 2000000) / 2000000) * 100 = -35%
      expect(result.growthRate).toBeCloseTo(-35, 1);
    });
  });

  describe('formatLargeNumber', () => {
    it('should format numbers with K suffix', () => {
      expect(formatLargeNumber(1500)).toBe('1.5K');
      expect(formatLargeNumber(25000)).toBe('25K');
      expect(formatLargeNumber(999)).toBe('999');
    });

    it('should format numbers with M suffix', () => {
      expect(formatLargeNumber(1500000)).toBe('1.5M');
      expect(formatLargeNumber(25000000)).toBe('25M');
    });

    it('should format numbers with B suffix', () => {
      expect(formatLargeNumber(1500000000)).toBe('1.5B');
      expect(formatLargeNumber(25000000000)).toBe('25B');
    });

    it('should add currency prefix for USD', () => {
      expect(formatLargeNumber(1500000, 'USD')).toBe('$1.5M');
      expect(formatLargeNumber(25000, 'USD')).toBe('$25K');
    });

    it('should handle zero', () => {
      expect(formatLargeNumber(0)).toBe('0');
      expect(formatLargeNumber(0, 'USD')).toBe('$0');
    });

    it('should handle negative numbers', () => {
      expect(formatLargeNumber(-1500000, 'USD')).toBe('-$1.5M');
    });

    it('should round to specified decimal places', () => {
      expect(formatLargeNumber(1567000, 'USD', 2)).toBe('$1.57M');
      expect(formatLargeNumber(1567000, 'USD', 0)).toBe('$2M');
    });
  });

  describe('formatGrowthRate', () => {
    it('should format positive growth rate with + sign', () => {
      expect(formatGrowthRate(25.5)).toBe('+25.5%');
      expect(formatGrowthRate(100)).toBe('+100.0%');
    });

    it('should format negative growth rate with - sign', () => {
      expect(formatGrowthRate(-15.3)).toBe('-15.3%');
      expect(formatGrowthRate(-50)).toBe('-50.0%');
    });

    it('should handle zero growth', () => {
      expect(formatGrowthRate(0)).toBe('0.0%');
    });

    it('should round to 1 decimal place by default', () => {
      expect(formatGrowthRate(25.678)).toBe('+25.7%');
      expect(formatGrowthRate(-33.333)).toBe('-33.3%');
    });
  });

  describe('getRevenueDistribution', () => {
    it('should group opportunities by partner', () => {
      const result = getRevenueDistribution(sampleOpportunities);

      expect(result).toHaveLength(3); // 3 unique partners

      const cloudTech = result.find(r => r.partnerId === 'partner-1');
      expect(cloudTech?.partnerName).toBe('CloudTech Solutions');
      expect(cloudTech?.totalValue).toBe(350000); // 100k + 250k
      expect(cloudTech?.opportunityCount).toBe(2);
    });

    it('should calculate percentage of total revenue', () => {
      const result = getRevenueDistribution(sampleOpportunities);

      const totalRevenue = 1300000;
      const cloudTech = result.find(r => r.partnerId === 'partner-1');

      expect(cloudTech?.percentage).toBeCloseTo((350000 / totalRevenue) * 100, 1);
    });

    it('should sort by total value descending', () => {
      const result = getRevenueDistribution(sampleOpportunities);

      // First should be SecureData (800k), then CloudTech (350k), then DevOps (150k)
      expect(result[0].partnerName).toBe('SecureData Inc');
      expect(result[0].totalValue).toBe(800000);
    });

    it('should handle empty opportunities', () => {
      const result = getRevenueDistribution([]);

      expect(result).toEqual([]);
    });

    it('should group by stage if groupBy parameter is stage', () => {
      const result = getRevenueDistribution(sampleOpportunities, 'stage');

      expect(result.some(r => r.stage === 'qualified')).toBe(true);
      expect(result.some(r => r.stage === 'won')).toBe(true);
    });
  });

  describe('getAtRiskOpportunities', () => {
    it('should identify opportunities past expected close date', () => {
      const today = new Date('2025-02-20');
      const oppsWithPastDates: Opportunity[] = [
        {
          ...sampleOpportunities[0],
          expectedCloseDate: '2025-02-01', // Past
          stage: 'negotiation'
        },
        {
          ...sampleOpportunities[1],
          expectedCloseDate: '2025-03-01', // Future
          stage: 'proposal'
        }
      ];

      const result = getAtRiskOpportunities(oppsWithPastDates, today);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('opp-1');
      expect(result[0].riskReason).toContain('past expected close date');
    });

    it('should identify opportunities with long sales cycle', () => {
      const today = new Date('2025-03-01');
      const oppsWithLongCycle: Opportunity[] = [
        {
          ...sampleOpportunities[0],
          createdDate: '2024-06-01', // 9 months ago
          stage: 'qualified'
        }
      ];

      const result = getAtRiskOpportunities(oppsWithLongCycle, today);

      expect(result).toHaveLength(1);
      expect(result[0].riskReason).toContain('long sales cycle');
    });

    it('should identify opportunities stuck in same stage', () => {
      const oppsStuck: Opportunity[] = [
        {
          ...sampleOpportunities[0],
          stage: 'qualified',
          stageEnteredDate: '2024-09-01', // 5+ months in same stage
          lastActivityDate: '2024-09-15' // No recent activity
        }
      ];

      const result = getAtRiskOpportunities(oppsStuck, new Date('2025-02-01'));

      expect(result).toHaveLength(1);
      expect(result[0].riskReason).toContain('stuck in stage');
    });

    it('should exclude won and lost opportunities', () => {
      const result = getAtRiskOpportunities(sampleOpportunities);

      expect(result.every(opp => opp.stage !== 'won' && opp.stage !== 'lost')).toBe(true);
    });

    it('should return empty array if no at-risk opportunities', () => {
      const healthyOpps: Opportunity[] = [
        {
          ...sampleOpportunities[0],
          expectedCloseDate: '2025-06-01', // Far future
          createdDate: '2025-01-15', // Recent
          stage: 'proposal'
        }
      ];

      const result = getAtRiskOpportunities(healthyOpps, new Date('2025-02-01'));

      expect(result).toHaveLength(0);
    });
  });

  describe('calculateConversionRate', () => {
    it('should calculate won opportunities as percentage of closed', () => {
      const rate = calculateConversionRate(sampleOpportunities);

      // 1 won out of 2 closed = 50%
      expect(rate).toBe(50);
    });

    it('should return 0 if no closed opportunities', () => {
      const activeOnly = sampleOpportunities.filter(
        opp => opp.stage !== 'won' && opp.stage !== 'lost'
      );

      const rate = calculateConversionRate(activeOnly);

      expect(rate).toBe(0);
    });

    it('should handle 100% conversion rate', () => {
      const allWon: Opportunity[] = [
        { ...sampleOpportunities[0], stage: 'won' },
        { ...sampleOpportunities[1], stage: 'won' }
      ];

      const rate = calculateConversionRate(allWon);

      expect(rate).toBe(100);
    });

    it('should handle 0% conversion rate (all lost)', () => {
      const allLost: Opportunity[] = [
        { ...sampleOpportunities[0], stage: 'lost' },
        { ...sampleOpportunities[1], stage: 'lost' }
      ];

      const rate = calculateConversionRate(allLost);

      expect(rate).toBe(0);
    });
  });

  describe('calculateWeightedValue', () => {
    it('should calculate weighted pipeline value using probability', () => {
      const weighted = calculateWeightedValue(sampleOpportunities);

      // Sum of (value * probability/100)
      const expected =
        100000 * 0.1 +  // qualified: 10%
        250000 * 0.5 +  // proposal: 50%
        500000 * 0.75 + // negotiation: 75%
        300000 * 1.0 +  // won: 100%
        150000 * 0.0;   // lost: 0%

      expect(weighted).toBe(expected); // 810,000
    });

    it('should handle opportunities without probability field', () => {
      const oppsNoProbability: Opportunity[] = [
        { ...sampleOpportunities[0], probability: undefined as any }
      ];

      // Should assume 0 probability if missing
      const weighted = calculateWeightedValue(oppsNoProbability);
      expect(weighted).toBe(0);
    });

    it('should exclude opportunities with 0 probability', () => {
      const oppsWithZero: Opportunity[] = [
        { ...sampleOpportunities[0], probability: 0, value: 100000 },
        { ...sampleOpportunities[1], probability: 50, value: 200000 }
      ];

      const weighted = calculateWeightedValue(oppsWithZero);
      expect(weighted).toBe(100000); // Only 200k * 50%
    });
  });

  describe('calculatePerformanceTrends', () => {
    const historyData: OpportunityHistoryData[] = [
      { period: '2024-Q1', totalValue: 800000, wonCount: 2, lostCount: 1, activeCount: 10 },
      { period: '2024-Q2', totalValue: 1000000, wonCount: 3, lostCount: 1, activeCount: 12 },
      { period: '2024-Q3', totalValue: 1200000, wonCount: 4, lostCount: 2, activeCount: 15 },
      { period: '2024-Q4', totalValue: 1300000, wonCount: 5, lostCount: 1, activeCount: 14 }
    ];

    it('should calculate quarter-over-quarter growth rates', () => {
      const trends = calculatePerformanceTrends(historyData);

      expect(trends).toHaveLength(4);

      // Q2 growth: ((1000000 - 800000) / 800000) * 100 = 25%
      expect(trends[1].growthRate).toBeCloseTo(25, 1);

      // Q3 growth: ((1200000 - 1000000) / 1000000) * 100 = 20%
      expect(trends[2].growthRate).toBeCloseTo(20, 1);
    });

    it('should identify trends (up/down/stable)', () => {
      const trends = calculatePerformanceTrends(historyData);

      expect(trends[0].trend).toBe('stable'); // First period has no previous
      expect(trends[1].trend).toBe('up'); // Growth from Q1 to Q2
      expect(trends[2].trend).toBe('up'); // Growth from Q2 to Q3
    });

    it('should detect negative trends', () => {
      const decliningData: OpportunityHistoryData[] = [
        { period: '2024-Q1', totalValue: 1500000, wonCount: 5, lostCount: 1, activeCount: 20 },
        { period: '2024-Q2', totalValue: 1200000, wonCount: 3, lostCount: 2, activeCount: 18 }
      ];

      const trends = calculatePerformanceTrends(decliningData);

      expect(trends[1].trend).toBe('down');
      expect(trends[1].growthRate).toBeLessThan(0);
    });

    it('should handle empty history data', () => {
      const trends = calculatePerformanceTrends([]);

      expect(trends).toEqual([]);
    });
  });

  describe('getDealVelocity', () => {
    it('should calculate average days to close for won deals', () => {
      const velocity = getDealVelocity(sampleOpportunities);

      // Deal D: created 2024-10-01, closed 2025-01-10 = 101 days
      expect(velocity.avgDaysToClose).toBeCloseTo(101, 0);
    });

    it('should calculate velocity by stage', () => {
      const velocity = getDealVelocity(sampleOpportunities);

      expect(velocity.byStage).toBeDefined();
      expect(velocity.byStage.qualified).toBeDefined();
      expect(velocity.byStage.proposal).toBeDefined();
    });

    it('should return 0 if no won deals', () => {
      const activeOnly = sampleOpportunities.filter(opp => opp.stage !== 'won');

      const velocity = getDealVelocity(activeOnly);

      expect(velocity.avgDaysToClose).toBe(0);
    });

    it('should handle deals closed on same day as creation', () => {
      const quickWin: Opportunity[] = [
        {
          ...sampleOpportunities[0],
          stage: 'won',
          createdDate: '2025-01-15',
          closedDate: '2025-01-15'
        }
      ];

      const velocity = getDealVelocity(quickWin);

      expect(velocity.avgDaysToClose).toBe(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle opportunities with missing required fields', () => {
      const invalidOpps: any[] = [
        { id: 'opp-1' }, // Missing value, stage, etc.
        { id: 'opp-2', value: null, stage: null }
      ];

      // Functions should not crash
      expect(() => calculateOpportunityMetrics(invalidOpps)).not.toThrow();
      expect(() => getRevenueDistribution(invalidOpps)).not.toThrow();
    });

    it('should handle very large numbers without overflow', () => {
      const largeOpps: Opportunity[] = [
        { ...sampleOpportunities[0], value: Number.MAX_SAFE_INTEGER / 2 },
        { ...sampleOpportunities[1], value: Number.MAX_SAFE_INTEGER / 2 }
      ];

      const result = calculateOpportunityMetrics(largeOpps);

      expect(result.totalValue).toBeLessThan(Number.MAX_SAFE_INTEGER);
      expect(isFinite(result.totalValue)).toBe(true);
    });

    it('should handle invalid date strings gracefully', () => {
      const invalidDates: Opportunity[] = [
        { ...sampleOpportunities[0], expectedCloseDate: 'invalid-date' },
        { ...sampleOpportunities[1], createdDate: 'not-a-date' }
      ];

      // Should not crash
      expect(() => getAtRiskOpportunities(invalidDates)).not.toThrow();
      expect(() => getDealVelocity(invalidDates)).not.toThrow();
    });
  });
});

/**
 * TO RUN THESE TESTS:
 *
 * 1. Install dependencies:
 *    cd apps/web
 *    npm install --save-dev jest @types/jest ts-jest @testing-library/react @testing-library/jest-dom
 *
 * 2. Configure Jest (jest.config.js in apps/web):
 *    module.exports = {
 *      preset: 'ts-jest',
 *      testEnvironment: 'jsdom',
 *      testMatch: ['**/__tests__/**/*.test.ts?(x)'],
 *      moduleNameMapper: {
 *        '^@/(.*)$': '<rootDir>/src/$1'
 *      },
 *      collectCoverageFrom: [
 *        'src/utils/**/*.ts',
 *        '!src/**/*.d.ts'
 *      ],
 *      coverageThreshold: {
 *        './src/utils/opportunityCalculations.ts': {
 *          branches: 90,
 *          functions: 90,
 *          lines: 90,
 *          statements: 90
 *        }
 *      }
 *    };
 *
 * 3. Run tests:
 *    npm test
 *    npm test -- --coverage
 *    npm test -- --watch
 *
 * 4. Add to package.json scripts:
 *    "test": "jest",
 *    "test:watch": "jest --watch",
 *    "test:coverage": "jest --coverage"
 */
