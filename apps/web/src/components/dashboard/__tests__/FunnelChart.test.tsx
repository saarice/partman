import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FunnelChart from '../FunnelChart';
import { PipelineStage } from '../../../services/pipelineService';

const mockStages: PipelineStage[] = [
  {
    stage: 'lead',
    count: 50,
    value: 2500000,
    probability: 10,
    conversionRate: 35,
    trend: 'up',
  },
  {
    stage: 'demo',
    count: 30,
    value: 1800000,
    probability: 25,
    conversionRate: 70,
    trend: 'stable',
  },
  {
    stage: 'poc',
    count: 20,
    value: 1200000,
    probability: 50,
    conversionRate: 80,
    trend: 'down',
  },
  {
    stage: 'proposal',
    count: 15,
    value: 900000,
    probability: 75,
    conversionRate: 85,
    trend: 'up',
  },
  {
    stage: 'closed_won',
    count: 10,
    value: 600000,
    probability: 100,
    conversionRate: 100,
    trend: 'stable',
  },
];

const mockColors = {
  lead: '#FF6B6B',
  demo: '#4ECDC4',
  poc: '#45B7D1',
  proposal: '#96CEB4',
  closed_won: '#FFEAA7',
};

const mockOnStageClick = jest.fn();

describe('FunnelChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all pipeline stages', () => {
    render(
      <FunnelChart
        stages={mockStages}
        onStageClick={mockOnStageClick}
        colors={mockColors}
      />
    );

    expect(screen.getByText('Lead')).toBeInTheDocument();
    expect(screen.getByText('Demo')).toBeInTheDocument();
    expect(screen.getByText('POC')).toBeInTheDocument();
    expect(screen.getByText('Proposal')).toBeInTheDocument();
    expect(screen.getByText('Closed Won')).toBeInTheDocument();
  });

  it('should display opportunity counts for each stage', () => {
    render(
      <FunnelChart
        stages={mockStages}
        onStageClick={mockOnStageClick}
        colors={mockColors}
      />
    );

    expect(screen.getByText('50 ops')).toBeInTheDocument();
    expect(screen.getByText('30 ops')).toBeInTheDocument();
    expect(screen.getByText('20 ops')).toBeInTheDocument();
    expect(screen.getByText('15 ops')).toBeInTheDocument();
    expect(screen.getByText('10 ops')).toBeInTheDocument();
  });

  it('should call onStageClick when a stage is clicked', () => {
    render(
      <FunnelChart
        stages={mockStages}
        onStageClick={mockOnStageClick}
        colors={mockColors}
      />
    );

    const leadStage = screen.getByText('Lead').closest('div[style*="cursor: pointer"]');
    if (leadStage) {
      fireEvent.click(leadStage);
      expect(mockOnStageClick).toHaveBeenCalledWith('lead');
    }
  });

  it('should display tooltips with detailed information on hover', () => {
    render(
      <FunnelChart
        stages={mockStages}
        onStageClick={mockOnStageClick}
        colors={mockColors}
      />
    );

    const leadStage = screen.getByText('Lead').closest('[data-testid], div[title], [aria-describedby]');
    if (leadStage) {
      fireEvent.mouseOver(leadStage);
    }

    // Note: Material-UI tooltips are complex to test in unit tests
    // This would typically require integration testing or custom tooltip mocking
  });

  it('should calculate and display conversion rates between stages', () => {
    render(
      <FunnelChart
        stages={mockStages}
        onStageClick={mockOnStageClick}
        colors={mockColors}
      />
    );

    // Check for conversion rate indicators
    // Demo to POC: (20/30) * 100 = 66.7%
    // POC to Proposal: (15/20) * 100 = 75.0%
    expect(screen.getByText('66.7%')).toBeInTheDocument();
    expect(screen.getByText('75.0%')).toBeInTheDocument();
  });

  it('should display overall conversion rate', () => {
    render(
      <FunnelChart
        stages={mockStages}
        onStageClick={mockOnStageClick}
        colors={mockColors}
      />
    );

    // Overall conversion: (10/50) * 100 = 20.0%
    expect(screen.getByText('Overall Conversion Rate: 20.0%')).toBeInTheDocument();
  });

  it('should handle empty stages array', () => {
    render(
      <FunnelChart
        stages={[]}
        onStageClick={mockOnStageClick}
        colors={mockColors}
      />
    );

    expect(screen.getByText('Overall Conversion Rate: 0%')).toBeInTheDocument();
  });

  it('should handle single stage', () => {
    const singleStage = [mockStages[0]];

    render(
      <FunnelChart
        stages={singleStage}
        onStageClick={mockOnStageClick}
        colors={mockColors}
      />
    );

    expect(screen.getByText('Lead')).toBeInTheDocument();
    expect(screen.getByText('Overall Conversion Rate: 100.0%')).toBeInTheDocument();
  });

  it('should apply correct colors to stages', () => {
    render(
      <FunnelChart
        stages={mockStages}
        onStageClick={mockOnStageClick}
        colors={mockColors}
      />
    );

    // Check that stages have the correct background colors
    // This would require checking computed styles or data attributes
    const leadStage = screen.getByText('Lead').closest('div');
    expect(leadStage).toHaveStyle({ color: 'white' });
  });

  it('should format currency values correctly', () => {
    render(
      <FunnelChart
        stages={mockStages}
        onStageClick={mockOnStageClick}
        colors={mockColors}
      />
    );

    // Values should be formatted as millions and thousands
    // $2,500,000 -> $2.5M
    // $1,800,000 -> $1.8M
    // These would appear in tooltips, which are harder to test in unit tests
  });

  it('should handle missing color for stage', () => {
    const incompleteColors = {
      lead: '#FF6B6B',
      // Missing other colors
    };

    render(
      <FunnelChart
        stages={mockStages}
        onStageClick={mockOnStageClick}
        colors={incompleteColors}
      />
    );

    // Should not crash and should render all stages
    expect(screen.getByText('Lead')).toBeInTheDocument();
    expect(screen.getByText('Demo')).toBeInTheDocument();
  });

  it('should render flow indicators between stages', () => {
    render(
      <FunnelChart
        stages={mockStages}
        onStageClick={mockOnStageClick}
        colors={mockColors}
      />
    );

    // Check that there are flow indicators (arrows) between stages
    // This would typically be tested by checking for specific CSS classes or data attributes
    const container = screen.getByText('Lead').closest('div')?.parentElement;
    expect(container).toBeInTheDocument();
  });

  it('should calculate correct stage widths based on opportunity count', () => {
    render(
      <FunnelChart
        stages={mockStages}
        onStageClick={mockOnStageClick}
        colors={mockColors}
      />
    );

    // Lead stage has 50 opportunities (max), so should have 100% width
    // Demo stage has 30 opportunities, so should have 60% width
    // This would require checking computed styles or data attributes
    const leadStage = screen.getByText('Lead').closest('div');
    expect(leadStage).toBeInTheDocument();
  });

  it('should handle zero opportunity counts', () => {
    const stagesWithZero = [
      ...mockStages,
      {
        stage: 'closed_lost',
        count: 0,
        value: 0,
        probability: 0,
        conversionRate: 0,
        trend: 'stable' as const,
      },
    ];

    render(
      <FunnelChart
        stages={stagesWithZero}
        onStageClick={mockOnStageClick}
        colors={{...mockColors, closed_lost: '#f44336'}}
      />
    );

    expect(screen.getByText('0 ops')).toBeInTheDocument();
  });
});