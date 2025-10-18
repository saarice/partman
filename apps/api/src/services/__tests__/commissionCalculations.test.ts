/**
 * Commission Calculation Tests
 * Comprehensive test suite for partnership commission calculations
 * Based on QA requirements: 39 tests for opportunity calculations
 */

import { CommissionService } from '../commissionService.js';

describe('Commission Calculations - Business Logic Tests', () => {
  let commissionService: CommissionService;

  beforeEach(() => {
    commissionService = new CommissionService();
  });

  describe('Referral Commissions (15% standard rate)', () => {
    test('calculates standard referral commission correctly', () => {
      const amount = 100000;
      const commission = commissionService.calculateReferralCommission(amount);
      expect(commission).toBe(15000); // 15% of 100000
    });

    test('handles zero amounts', () => {
      const commission = commissionService.calculateReferralCommission(0);
      expect(commission).toBe(0);
    });

    test('handles maximum realistic values', () => {
      const amount = 10000000; // $10M deal
      const commission = commissionService.calculateReferralCommission(amount);
      expect(commission).toBe(1500000); // $1.5M commission
    });

    test('rounds to 2 decimal places', () => {
      const amount = 100.33;
      const commission = commissionService.calculateReferralCommission(amount);
      expect(commission).toBe(15.05); // 15.0495 rounded to 15.05
    });

    test('handles custom commission rates', () => {
      const amount = 100000;
      const customRate = 0.20; // 20%
      const commission = commissionService.calculateReferralCommission(amount, customRate);
      expect(commission).toBe(20000);
    });

    test('rejects negative amounts', () => {
      expect(() => {
        commissionService.calculateReferralCommission(-1000);
      }).toThrow('Commission amount cannot be negative');
    });

    test('validates commission rate is between 0 and 1', () => {
      expect(() => {
        commissionService.calculateReferralCommission(1000, 1.5);
      }).toThrow('Commission rate must be between 0 and 1');
    });
  });

  describe('Reseller Commissions (30% standard rate)', () => {
    test('calculates standard reseller commission correctly', () => {
      const amount = 100000;
      const commission = commissionService.calculateResellerCommission(amount);
      expect(commission).toBe(30000); // 30% of 100000
    });

    test('handles zero amounts', () => {
      const commission = commissionService.calculateResellerCommission(0);
      expect(commission).toBe(0);
    });

    test('handles very large numbers correctly', () => {
      const amount = 50000000; // $50M deal
      const commission = commissionService.calculateResellerCommission(amount);
      expect(commission).toBe(15000000); // $15M commission
    });

    test('rounds decimal correctly', () => {
      const amount = 100.77;
      const commission = commissionService.calculateResellerCommission(amount);
      expect(commission).toBe(30.23); // 30.231 rounded
    });

    test('applies custom reseller rate', () => {
      const amount = 100000;
      const customRate = 0.35; // 35%
      const commission = commissionService.calculateResellerCommission(amount, customRate);
      expect(commission).toBe(35000);
    });

    test('rejects negative amounts', () => {
      expect(() => {
        commissionService.calculateResellerCommission(-5000);
      }).toThrow('Commission amount cannot be negative');
    });
  });

  describe('MSP Commissions (25% standard rate)', () => {
    test('calculates standard MSP commission correctly', () => {
      const amount = 100000;
      const commission = commissionService.calculateMSPCommission(amount);
      expect(commission).toBe(25000); // 25% of 100000
    });

    test('handles zero amounts', () => {
      const commission = commissionService.calculateMSPCommission(0);
      expect(commission).toBe(0);
    });

    test('handles decimal precision', () => {
      const amount = 123.45;
      const commission = commissionService.calculateMSPCommission(amount);
      expect(commission).toBe(30.86); // 30.8625 rounded
    });

    test('applies custom MSP rate', () => {
      const amount = 100000;
      const customRate = 0.28; // 28%
      const commission = commissionService.calculateMSPCommission(amount, customRate);
      expect(commission).toBe(28000);
    });
  });

  describe('Tiered Commission Structures', () => {
    test('applies tiered commissions - low tier', () => {
      const amount = 50000; // Under $100k
      const commission = commissionService.calculateTieredCommission(amount);
      // Tier 1: 0-100k = 10%
      expect(commission).toBe(5000);
    });

    test('applies tiered commissions - mid tier', () => {
      const amount = 250000; // $100k-$500k
      const commission = commissionService.calculateTieredCommission(amount);
      // Tier 1: 100k * 10% = 10k
      // Tier 2: 150k * 15% = 22.5k
      // Total: 32.5k
      expect(commission).toBe(32500);
    });

    test('applies tiered commissions - high tier', () => {
      const amount = 750000; // Over $500k
      const commission = commissionService.calculateTieredCommission(amount);
      // Tier 1: 100k * 10% = 10k
      // Tier 2: 400k * 15% = 60k
      // Tier 3: 250k * 20% = 50k
      // Total: 120k
      expect(commission).toBe(120000);
    });
  });

  describe('Partner-Specific Rates', () => {
    test('applies partner-specific commission rate', () => {
      const amount = 100000;
      const partnerId = 'partner-premium-001';
      const commission = commissionService.calculatePartnerCommission(amount, partnerId);
      // Premium partner gets 18% instead of standard 15%
      expect(commission).toBe(18000);
    });

    test('falls back to standard rate for unknown partners', () => {
      const amount = 100000;
      const partnerId = 'partner-unknown-999';
      const commission = commissionService.calculatePartnerCommission(amount, partnerId);
      // Falls back to 15%
      expect(commission).toBe(15000);
    });
  });

  describe('Edge Cases and Validation', () => {
    test('rejects non-numeric input', () => {
      expect(() => {
        commissionService.calculateReferralCommission(NaN);
      }).toThrow('Invalid amount: must be a number');
    });

    test('rejects infinity', () => {
      expect(() => {
        commissionService.calculateReferralCommission(Infinity);
      }).toThrow('Invalid amount: cannot be infinity');
    });

    test('handles very small decimals', () => {
      const amount = 0.01;
      const commission = commissionService.calculateReferralCommission(amount);
      expect(commission).toBe(0); // 0.0015 rounds to 0
    });

    test('validates commission rate cannot be negative', () => {
      expect(() => {
        commissionService.calculateReferralCommission(1000, -0.1);
      }).toThrow('Commission rate must be between 0 and 1');
    });

    test('validates commission rate cannot exceed 100%', () => {
      expect(() => {
        commissionService.calculateReferralCommission(1000, 1.1);
      }).toThrow('Commission rate must be between 0 and 1');
    });
  });

  describe('Opportunity Value Calculations', () => {
    test('calculates weighted value correctly', () => {
      const amount = 100000;
      const probability = 75; // 75%
      const weightedValue = commissionService.calculateWeightedValue(amount, probability);
      expect(weightedValue).toBe(75000);
    });

    test('handles 0% probability', () => {
      const amount = 100000;
      const probability = 0;
      const weightedValue = commissionService.calculateWeightedValue(amount, probability);
      expect(weightedValue).toBe(0);
    });

    test('handles 100% probability', () => {
      const amount = 100000;
      const probability = 100;
      const weightedValue = commissionService.calculateWeightedValue(amount, probability);
      expect(weightedValue).toBe(100000);
    });

    test('rejects probability over 100', () => {
      expect(() => {
        commissionService.calculateWeightedValue(100000, 150);
      }).toThrow('Probability must be between 0 and 100');
    });

    test('rejects negative probability', () => {
      expect(() => {
        commissionService.calculateWeightedValue(100000, -10);
      }).toThrow('Probability must be between 0 and 100');
    });
  });

  describe('Total Commission Aggregation', () => {
    test('aggregates multiple commissions correctly', () => {
      const commissions = [1000, 2500, 3000, 1500];
      const total = commissionService.aggregateCommissions(commissions);
      expect(total).toBe(8000);
    });

    test('handles empty array', () => {
      const total = commissionService.aggregateCommissions([]);
      expect(total).toBe(0);
    });

    test('handles single commission', () => {
      const total = commissionService.aggregateCommissions([5000]);
      expect(total).toBe(5000);
    });

    test('rounds aggregate total to 2 decimals', () => {
      const commissions = [10.555, 20.444, 30.111];
      const total = commissionService.aggregateCommissions(commissions);
      expect(total).toBe(61.11); // 61.11
    });
  });

  describe('Commission Splits (Multiple Partners)', () => {
    test('splits commission evenly between 2 partners', () => {
      const totalCommission = 10000;
      const partnerCount = 2;
      const split = commissionService.splitCommission(totalCommission, partnerCount);
      expect(split).toEqual([5000, 5000]);
    });

    test('splits commission evenly between 3 partners', () => {
      const totalCommission = 15000;
      const partnerCount = 3;
      const split = commissionService.splitCommission(totalCommission, partnerCount);
      expect(split).toEqual([5000, 5000, 5000]);
    });

    test('handles uneven splits with rounding', () => {
      const totalCommission = 10000;
      const partnerCount = 3;
      const split = commissionService.splitCommission(totalCommission, partnerCount);
      // 10000 / 3 = 3333.33 each
      expect(split).toEqual([3333.33, 3333.33, 3333.34]); // Last one gets the extra penny
    });

    test('applies custom split percentages', () => {
      const totalCommission = 10000;
      const splitPercentages = [0.5, 0.3, 0.2]; // 50%, 30%, 20%
      const split = commissionService.splitCommissionCustom(totalCommission, splitPercentages);
      expect(split).toEqual([5000, 3000, 2000]);
    });

    test('rejects split percentages that do not sum to 100%', () => {
      const totalCommission = 10000;
      const splitPercentages = [0.5, 0.3]; // Only 80%
      expect(() => {
        commissionService.splitCommissionCustom(totalCommission, splitPercentages);
      }).toThrow('Split percentages must sum to 1.0');
    });
  });
});
