// Sample pipeline stage tests
describe('Pipeline Stage Management', () => {
  test('stage progression should follow correct order', () => {
    const stages = ['lead', 'demo', 'poc', 'proposal', 'closed_won'];

    stages.forEach(stage => {
      expect(stage).toBeValidPipelineStage();
    });
  });

  test('invalid stages should be rejected', () => {
    const invalidStages = ['invalid', 'unknown', 'random'];

    invalidStages.forEach(stage => {
      expect(stage).not.toBeValidPipelineStage();
    });
  });

  test('probability should increase with stage advancement', () => {
    const stageProbabilities = {
      lead: 10,
      demo: 25,
      poc: 50,
      proposal: 75,
      closed_won: 100
    };

    const stages = Object.keys(stageProbabilities);
    for (let i = 1; i < stages.length; i++) {
      const currentStage = stages[i];
      const previousStage = stages[i - 1];

      expect(stageProbabilities[currentStage])
        .toBeGreaterThan(stageProbabilities[previousStage]);
    }
  });

  test('pipeline value calculation', () => {
    const opportunities = [
      { dealValue: 100000, stage: 'lead', probability: 10 },
      { dealValue: 200000, stage: 'demo', probability: 25 },
      { dealValue: 300000, stage: 'poc', probability: 50 },
      { dealValue: 150000, stage: 'proposal', probability: 75 }
    ];

    const totalPipelineValue = opportunities.reduce((total, opp) => {
      return total + (opp.dealValue * (opp.probability / 100));
    }, 0);

    // Expected: (100k*0.1) + (200k*0.25) + (300k*0.5) + (150k*0.75) = 10k + 50k + 150k + 112.5k = 322.5k
    expect(totalPipelineValue).toBe(322500);
  });

  test('quarterly revenue goal tracking', () => {
    const quarterlyTarget = 250000; // $250K target from PRD
    const currentRevenue = 180000; // $180K achieved

    const progressPercentage = (currentRevenue / quarterlyTarget) * 100;
    const remainingAmount = quarterlyTarget - currentRevenue;

    expect(progressPercentage).toBe(72); // 72% of target achieved
    expect(remainingAmount).toBe(70000); // $70K remaining
  });

  test('stage transition validation', () => {
    const validTransitions = {
      lead: ['demo', 'closed_lost'],
      demo: ['poc', 'closed_lost'],
      poc: ['proposal', 'closed_lost'],
      proposal: ['closed_won', 'closed_lost']
    };

    // Valid transitions
    expect(validTransitions.lead).toContain('demo');
    expect(validTransitions.demo).toContain('poc');
    expect(validTransitions.poc).toContain('proposal');
    expect(validTransitions.proposal).toContain('closed_won');

    // All stages can transition to closed_lost
    Object.values(validTransitions).forEach(transitions => {
      expect(transitions).toContain('closed_lost');
    });
  });
});
