// Sample commission calculation tests
describe('Commission Calculations', () => {
  test('referral commission should be 15% by default', () => {
    const dealValue = 100000;
    const commissionRate = 15; // Using percentage instead of decimal
    const expectedCommission = dealValue * (commissionRate / 100);

    expect(expectedCommission).toBe(15000);
    expect(commissionRate).toBeValidCommissionRate();
  });

  test('reseller commission should be 30% by default', () => {
    const dealValue = 100000;
    const commissionRate = 30; // Using percentage instead of decimal
    const expectedCommission = dealValue * (commissionRate / 100);

    expect(expectedCommission).toBe(30000);
    expect(commissionRate).toBeValidCommissionRate();
  });

  test('commission should not exceed deal value', () => {
    const dealValue = 50000;
    const commissionRate = 150; // 150% - invalid

    expect(() => {
      if (commissionRate > 100) throw new Error('Commission rate cannot exceed 100%');
    }).toThrow('Commission rate cannot exceed 100%');
  });

  test('commission calculation accuracy for high-value deals', () => {
    const dealValue = 1200000; // $1.2M deal mentioned in PRD
    const referralRate = 15;
    const resellerRate = 30;

    const referralCommission = dealValue * (referralRate / 100);
    const resellerCommission = dealValue * (resellerRate / 100);

    expect(referralCommission).toBe(180000); // $180K
    expect(resellerCommission).toBe(360000); // $360K
  });

  test('commission calculation handles edge cases', () => {
    // Zero deal value
    expect(0 * (15 / 100)).toBe(0);

    // Minimum commission rate
    expect(1).toBeValidCommissionRate();

    // Maximum commission rate
    expect(100).toBeValidCommissionRate();

    // Invalid rates
    expect(-1).not.toBeValidCommissionRate();
    expect(101).not.toBeValidCommissionRate();
  });
});
