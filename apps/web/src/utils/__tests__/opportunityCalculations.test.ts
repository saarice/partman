/**
 * Opportunity Calculations Unit Tests
 * Tests for business logic calculations
 */

import {
  calculateGrowthRate,
  formatGrowthRate,
  calculateTotalValue,
  calculateTotalWeightedValue,
  calculateAverageDealSize,
  calculateAverageProbability,
  calculateConversionRate,
  getStageDistribution,
  formatLargeNumber
} from '../opportunityCalculations';
import type { Opportunity } from '../../types/opportunity';

describe('opportunityCalculations', () => {
  const sampleOpportunities: Opportunity[] = [
    {
      id: 'opp-1',
      name: 'Deal A',
      partnerId: 'partner-1',
      partnerName: 'CloudTech',
      amount: 100000,
      weightedValue: 10000, // 10% probability
      probability: 10,
      stage: 'qualified',
      expectedCloseDate: '2025-03-01',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    },
    {
      id: 'opp-2',
      name: 'Deal B',
      partnerId: 'partner-1',
      partnerName: 'CloudTech',
      amount: 250000,
      weightedValue: 125000, // 50% probability
      probability: 50,
      stage: 'proposal',
      expectedCloseDate: '2025-02-15',
      createdAt: '2024-12-15',
      updatedAt: '2025-01-10'
    },
    {
      id: 'opp-3',
      name: 'Deal C',
      partnerId: 'partner-2',
      partnerName: 'SecureData',
      amount: 500000,
      weightedValue: 375000, // 75% probability
      probability: 75,
      stage: 'negotiation',
      expectedCloseDate: '2025-02-01',
      createdAt: '2024-11-01',
      updatedAt: '2025-01-15'
    }
  ];

  describe('calculateGrowthRate', () => {
    it('should calculate positive growth rate', () => {
      const result = calculateGrowthRate(150, 100);
      expect(result).toBe(50); // 50% growth
    });

    it('should calculate negative growth rate', () => {
      const result = calculateGrowthRate(75, 100);
      expect(result).toBe(-25); // 25% decline
    });

    it('should return 0 when previous is 0', () => {
      const result = calculateGrowthRate(100, 0);
      expect(result).toBe(0);
    });

    it('should handle same values (no growth)', () => {
      const result = calculateGrowthRate(100, 100);
      expect(result).toBe(0);
    });
  });

  describe('formatGrowthRate', () => {
    it('should format positive rate with + sign', () => {
      expect(formatGrowthRate(25.5)).toBe('+25.5%');
      expect(formatGrowthRate(100)).toBe('+100.0%');
    });

    it('should format negative rate with - sign', () => {
      expect(formatGrowthRate(-15.3)).toBe('-15.3%');
      expect(formatGrowthRate(-50)).toBe('-50.0%');
    });

    it('should format zero rate', () => {
      expect(formatGrowthRate(0)).toBe('0.0%');
    });

    it('should round to 1 decimal place', () => {
      expect(formatGrowthRate(25.678)).toBe('+25.7%');
      expect(formatGrowthRate(-33.333)).toBe('-33.3%');
    });
  });

  describe('calculateTotalValue', () => {
    it('should calculate sum of all opportunity amounts', () => {
      const result = calculateTotalValue(sampleOpportunities);
      expect(result).toBe(850000); // 100k + 250k + 500k
    });

    it('should return 0 for empty array', () => {
      const result = calculateTotalValue([]);
      expect(result).toBe(0);
    });

    it('should handle single opportunity', () => {
      const result = calculateTotalValue([sampleOpportunities[0]]);
      expect(result).toBe(100000);
    });
  });

  describe('calculateTotalWeightedValue', () => {
    it('should calculate sum of weighted values', () => {
      const result = calculateTotalWeightedValue(sampleOpportunities);
      expect(result).toBe(510000); // 10k + 125k + 375k
    });

    it('should return 0 for empty array', () => {
      const result = calculateTotalWeightedValue([]);
      expect(result).toBe(0);
    });
  });

  describe('calculateAverageDealSize', () => {
    it('should calculate average amount', () => {
      const result = calculateAverageDealSize(sampleOpportunities);
      expect(result).toBeCloseTo(283333.33, 2); // 850k / 3
    });

    it('should return 0 for empty array', () => {
      const result = calculateAverageDealSize([]);
      expect(result).toBe(0);
    });

    it('should handle single opportunity', () => {
      const result = calculateAverageDealSize([sampleOpportunities[0]]);
      expect(result).toBe(100000);
    });
  });

  describe('calculateAverageProbability', () => {
    it('should calculate average probability', () => {
      const result = calculateAverageProbability(sampleOpportunities);
      expect(result).toBeCloseTo(45, 1); // (10 + 50 + 75) / 3 = 45
    });

    it('should return 0 for empty array', () => {
      const result = calculateAverageProbability([]);
      expect(result).toBe(0);
    });
  });

  describe('calculateConversionRate', () => {
    it('should calculate conversion rate percentage', () => {
      const result = calculateConversionRate(3, 10);
      expect(result).toBe(30); // 30%
    });

    it('should handle 100% conversion', () => {
      const result = calculateConversionRate(5, 5);
      expect(result).toBe(100);
    });

    it('should handle 0% conversion', () => {
      const result = calculateConversionRate(0, 10);
      expect(result).toBe(0);
    });

    it('should return 0 when total is 0', () => {
      const result = calculateConversionRate(0, 0);
      expect(result).toBe(0);
    });
  });

  describe('getStageDistribution', () => {
    it('should count opportunities per stage', () => {
      const result = getStageDistribution(sampleOpportunities);

      const qualified = result.find(s => s.stage === 'qualified');
      const proposal = result.find(s => s.stage === 'proposal');
      const negotiation = result.find(s => s.stage === 'negotiation');

      expect(qualified?.count).toBe(1);
      expect(proposal?.count).toBe(1);
      expect(negotiation?.count).toBe(1);
    });

    it('should sum values per stage', () => {
      const result = getStageDistribution(sampleOpportunities);

      const qualified = result.find(s => s.stage === 'qualified');
      const proposal = result.find(s => s.stage === 'proposal');

      expect(qualified?.value).toBe(100000);
      expect(proposal?.value).toBe(250000);
    });

    it('should initialize all stages even with 0 count', () => {
      const result = getStageDistribution(sampleOpportunities);

      expect(result).toHaveLength(6); // All 6 stages
      const won = result.find(s => s.stage === 'won');
      const lost = result.find(s => s.stage === 'lost');

      expect(won?.count).toBe(0);
      expect(lost?.count).toBe(0);
    });

    it('should handle empty array', () => {
      const result = getStageDistribution([]);

      expect(result).toHaveLength(6);
      result.forEach(stage => {
        expect(stage.count).toBe(0);
        expect(stage.value).toBe(0);
      });
    });
  });

  describe('formatLargeNumber', () => {
    it('should format thousands with K suffix', () => {
      expect(formatLargeNumber(1500)).toBe('1.5K');
      expect(formatLargeNumber(25000)).toBe('25.0K');
    });

    it('should format millions with M suffix', () => {
      expect(formatLargeNumber(1500000)).toBe('1.5M');
      expect(formatLargeNumber(25000000)).toBe('25.0M');
    });

    it('should format billions with B suffix', () => {
      expect(formatLargeNumber(1500000000)).toBe('1.5B');
    });

    it('should keep numbers under 1000 as-is', () => {
      expect(formatLargeNumber(999)).toBe('999');
      expect(formatLargeNumber(500)).toBe('500');
    });

    it('should handle zero', () => {
      expect(formatLargeNumber(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(formatLargeNumber(-1500000)).toBe('-1.5M');
    });

    it('should add currency prefix when specified', () => {
      expect(formatLargeNumber(1500000, 'USD')).toBe('$1.5M');
      expect(formatLargeNumber(25000, 'USD')).toBe('$25.0K');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numbers without overflow', () => {
      const largeOpps: Opportunity[] = [
        {
          ...sampleOpportunities[0],
          amount: Number.MAX_SAFE_INTEGER / 2,
          weightedValue: 0
        }
      ];

      const result = calculateTotalValue(largeOpps);
      expect(result).toBeLessThan(Number.MAX_SAFE_INTEGER);
      expect(isFinite(result)).toBe(true);
    });

    it('should handle opportunities with missing/undefined fields gracefully', () => {
      const invalidOpps: any[] = [
        { id: 'opp-1', amount: 100000, weightedValue: 10000, probability: 10 },
        { id: 'opp-2' } // Missing fields
      ];

      // Should not crash
      expect(() => calculateTotalValue(invalidOpps)).not.toThrow();
    });

    it('should handle decimal amounts correctly', () => {
      const decimalOpps: Opportunity[] = [
        {
          ...sampleOpportunities[0],
          amount: 100000.50,
          weightedValue: 10000.05
        },
        {
          ...sampleOpportunities[1],
          amount: 250000.25,
          weightedValue: 125000.12
        }
      ];

      const result = calculateTotalValue(decimalOpps);
      expect(result).toBeCloseTo(350000.75, 2);
    });

    it('should handle very small probabilities', () => {
      const lowProbOpps: Opportunity[] = [
        {
          ...sampleOpportunities[0],
          probability: 0.01
        }
      ];

      const result = calculateAverageProbability(lowProbOpps);
      expect(result).toBe(0.01);
    });
  });

  describe('Integration: Full Metrics Calculation', () => {
    it('should calculate consistent metrics across functions', () => {
      const totalValue = calculateTotalValue(sampleOpportunities);
      const avgDealSize = calculateAverageDealSize(sampleOpportunities);
      const count = sampleOpportunities.length;

      // Average deal size should equal total / count
      expect(avgDealSize).toBeCloseTo(totalValue / count, 2);
    });

    it('should maintain weighted value <= total value', () => {
      const totalValue = calculateTotalValue(sampleOpportunities);
      const weightedValue = calculateTotalWeightedValue(sampleOpportunities);

      // Weighted value should always be <= total (since probability <= 100%)
      expect(weightedValue).toBeLessThanOrEqual(totalValue);
    });
  });
});
