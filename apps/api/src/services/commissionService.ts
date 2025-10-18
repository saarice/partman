/**
 * Commission Calculation Service
 * Handles all partnership commission calculations with validation
 */

export class CommissionService {
  // Standard commission rates
  private readonly REFERRAL_RATE = 0.15; // 15%
  private readonly RESELLER_RATE = 0.30; // 30%
  private readonly MSP_RATE = 0.25; // 25%

  // Tiered commission brackets
  private readonly TIER_BRACKETS = [
    { max: 100000, rate: 0.10 },    // 0-100k: 10%
    { max: 500000, rate: 0.15 },    // 100k-500k: 15%
    { max: Infinity, rate: 0.20 }   // 500k+: 20%
  ];

  // Partner-specific rates (could be loaded from database)
  private readonly PARTNER_RATES: Record<string, number> = {
    'partner-premium-001': 0.18,
    'partner-premium-002': 0.18,
    'partner-strategic-001': 0.22
  };

  /**
   * Validate amount is a valid positive number
   */
  private validateAmount(amount: number): void {
    if (isNaN(amount)) {
      throw new Error('Invalid amount: must be a number');
    }
    if (!isFinite(amount)) {
      throw new Error('Invalid amount: cannot be infinity');
    }
    if (amount < 0) {
      throw new Error('Commission amount cannot be negative');
    }
  }

  /**
   * Validate commission rate is between 0 and 1
   */
  private validateRate(rate: number): void {
    if (rate < 0 || rate > 1) {
      throw new Error('Commission rate must be between 0 and 1');
    }
  }

  /**
   * Round to 2 decimal places
   */
  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * Calculate referral commission (15% standard)
   */
  calculateReferralCommission(amount: number, customRate?: number): number {
    this.validateAmount(amount);
    const rate = customRate !== undefined ? customRate : this.REFERRAL_RATE;
    this.validateRate(rate);

    const commission = amount * rate;
    return this.roundToTwoDecimals(commission);
  }

  /**
   * Calculate reseller commission (30% standard)
   */
  calculateResellerCommission(amount: number, customRate?: number): number {
    this.validateAmount(amount);
    const rate = customRate !== undefined ? customRate : this.RESELLER_RATE;
    this.validateRate(rate);

    const commission = amount * rate;
    return this.roundToTwoDecimals(commission);
  }

  /**
   * Calculate MSP commission (25% standard)
   */
  calculateMSPCommission(amount: number, customRate?: number): number {
    this.validateAmount(amount);
    const rate = customRate !== undefined ? customRate : this.MSP_RATE;
    this.validateRate(rate);

    const commission = amount * rate;
    return this.roundToTwoDecimals(commission);
  }

  /**
   * Calculate tiered commission based on amount brackets
   */
  calculateTieredCommission(amount: number): number {
    this.validateAmount(amount);

    let totalCommission = 0;
    let remainingAmount = amount;
    let previousMax = 0;

    for (const tier of this.TIER_BRACKETS) {
      const tierAmount = Math.min(remainingAmount, tier.max - previousMax);
      if (tierAmount <= 0) break;

      totalCommission += tierAmount * tier.rate;
      remainingAmount -= tierAmount;
      previousMax = tier.max;

      if (remainingAmount <= 0) break;
    }

    return this.roundToTwoDecimals(totalCommission);
  }

  /**
   * Calculate commission for specific partner (with custom rates)
   */
  calculatePartnerCommission(amount: number, partnerId: string): number {
    this.validateAmount(amount);

    const partnerRate = this.PARTNER_RATES[partnerId] || this.REFERRAL_RATE;
    const commission = amount * partnerRate;

    return this.roundToTwoDecimals(commission);
  }

  /**
   * Calculate weighted value based on probability
   */
  calculateWeightedValue(amount: number, probability: number): number {
    this.validateAmount(amount);

    if (probability < 0 || probability > 100) {
      throw new Error('Probability must be between 0 and 100');
    }

    const weightedValue = amount * (probability / 100);
    return this.roundToTwoDecimals(weightedValue);
  }

  /**
   * Aggregate multiple commissions
   */
  aggregateCommissions(commissions: number[]): number {
    const total = commissions.reduce((sum, commission) => sum + commission, 0);
    return this.roundToTwoDecimals(total);
  }

  /**
   * Split commission evenly among partners
   */
  splitCommission(totalCommission: number, partnerCount: number): number[] {
    this.validateAmount(totalCommission);

    if (partnerCount <= 0) {
      throw new Error('Partner count must be greater than 0');
    }

    const baseAmount = Math.floor((totalCommission * 100) / partnerCount) / 100;
    const remainder = this.roundToTwoDecimals(totalCommission - (baseAmount * partnerCount));

    const splits = new Array(partnerCount).fill(baseAmount);

    // Add remainder to last partner
    if (remainder > 0) {
      splits[splits.length - 1] = this.roundToTwoDecimals(splits[splits.length - 1] + remainder);
    }

    return splits;
  }

  /**
   * Split commission with custom percentages
   */
  splitCommissionCustom(totalCommission: number, splitPercentages: number[]): number[] {
    this.validateAmount(totalCommission);

    const sum = splitPercentages.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.0001) { // Allow for floating point precision
      throw new Error('Split percentages must sum to 1.0');
    }

    return splitPercentages.map(percentage =>
      this.roundToTwoDecimals(totalCommission * percentage)
    );
  }
}
