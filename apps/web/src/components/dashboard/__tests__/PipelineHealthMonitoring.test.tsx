import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PipelineHealthMonitoring from '../PipelineHealthMonitoring';
import { pipelineService } from '../../../services/pipelineService';

// Mock the pipeline service
jest.mock('../../../services/pipelineService');
const mockPipelineService = pipelineService as jest.Mocked<typeof pipelineService>;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock Chart.js and react-chartjs-2
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  ArcElement: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
}));

jest.mock('react-chartjs-2', () => ({
  Bar: ({ onClick }: { onClick: any }) => (
    <div data-testid="bar-chart" onClick={() => onClick(null, [{ index: 0 }])}>
      Bar Chart
    </div>
  ),
}));

// Mock FunnelChart component
jest.mock('../FunnelChart', () => {
  return function FunnelChart({ onStageClick }: { onStageClick: (stage: string) => void }) {
    return (
      <div data-testid="funnel-chart" onClick={() => onStageClick('lead')}>
        Funnel Chart
      </div>
    );
  };
});

// Mock HistoricalTrendsModal
jest.mock('../HistoricalTrendsModal', () => {
  return function HistoricalTrendsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    return open ? (
      <div data-testid="historical-trends-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null;
  };
});

const mockPipelineData = {
  stages: [
    {
      stage: 'lead',
      count: 45,
      value: 2250000,
      probability: 10,
      conversionRate: 32.5,
      trend: 'up' as const,
    },
    {
      stage: 'demo',
      count: 28,
      value: 1680000,
      probability: 25,
      conversionRate: 68.2,
      trend: 'up' as const,
    },
    {
      stage: 'poc',
      count: 15,
      value: 1125000,
      probability: 50,
      conversionRate: 73.5,
      trend: 'stable' as const,
    },
  ],
  totalValue: 5055000,
  weightedValue: 1845000,
  totalOpportunities: 88,
};

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <PipelineHealthMonitoring />
    </BrowserRouter>
  );
};

describe('PipelineHealthMonitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPipelineService.getPipelineHealth.mockResolvedValue(mockPipelineData);
    mockPipelineService.exportPipelineData.mockImplementation(() => {});
  });

  it('should render pipeline health monitoring component', async () => {
    renderComponent();

    expect(screen.getByText('Pipeline Health Monitoring')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('88')).toBeInTheDocument(); // Total opportunities
    });
  });

  it('should display pipeline metrics correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('88')).toBeInTheDocument(); // Total opportunities
      expect(screen.getByText('$5.1M')).toBeInTheDocument(); // Total pipeline value
      expect(screen.getByText('$1.8M')).toBeInTheDocument(); // Weighted pipeline
    });
  });

  it('should show loading state initially', () => {
    renderComponent();

    expect(screen.getByText('Loading pipeline data...')).toBeInTheDocument();
  });

  it('should handle filter changes', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('88')).toBeInTheDocument();
    });

    // Change team member filter
    const teamMemberSelect = screen.getByLabelText('Team Member');
    fireEvent.mouseDown(teamMemberSelect);
    fireEvent.click(screen.getByText('John Smith'));

    // Verify service was called with filters
    await waitFor(() => {
      expect(mockPipelineService.getPipelineHealth).toHaveBeenCalledWith({
        teamMember: 'john',
        partner: 'all',
        dateRange: '30d',
      });
    });
  });

  it('should toggle between funnel and bar chart views', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('funnel-chart')).toBeInTheDocument();
    });

    // Click bar chart toggle
    const barChartButton = screen.getByText('Bar Chart');
    fireEvent.click(barChartButton);

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('funnel-chart')).not.toBeInTheDocument();
  });

  it('should handle stage clicks and navigate to opportunities', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('funnel-chart')).toBeInTheDocument();
    });

    // Click on a stage in funnel chart
    fireEvent.click(screen.getByTestId('funnel-chart'));

    expect(mockNavigate).toHaveBeenCalledWith('/opportunities?stage=lead');
  });

  it('should handle bar chart stage clicks', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('funnel-chart')).toBeInTheDocument();
    });

    // Switch to bar chart
    const barChartButton = screen.getByText('Bar Chart');
    fireEvent.click(barChartButton);

    // Click on bar chart
    fireEvent.click(screen.getByTestId('bar-chart'));

    expect(mockNavigate).toHaveBeenCalledWith('/opportunities?stage=lead');
  });

  it('should export CSV data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('88')).toBeInTheDocument();
    });

    // Click export button
    const exportButton = screen.getByText('Export CSV');
    fireEvent.click(exportButton);

    expect(mockPipelineService.exportPipelineData).toHaveBeenCalledWith(
      mockPipelineData,
      expect.stringMatching(/pipeline-health-\d{4}-\d{2}-\d{2}\.csv/),
      {
        teamMember: 'all',
        partner: 'all',
        dateRange: '30d',
      }
    );
  });

  it('should show historical trends modal', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('88')).toBeInTheDocument();
    });

    // Click more options menu
    const moreButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(moreButton);

    // Click historical trends
    const historicalTrendsButton = screen.getByText('Historical Trends');
    fireEvent.click(historicalTrendsButton);

    expect(screen.getByTestId('historical-trends-modal')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByText('Close Modal');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('historical-trends-modal')).not.toBeInTheDocument();
  });

  it('should display stage details correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Lead')).toBeInTheDocument();
      expect(screen.getByText('Demo')).toBeInTheDocument();
      expect(screen.getByText('POC')).toBeInTheDocument();
    });

    // Check stage metrics
    expect(screen.getByText('45 opportunities')).toBeInTheDocument();
    expect(screen.getByText('$2.3M total')).toBeInTheDocument();
    expect(screen.getByText('Conversion: 32.5%')).toBeInTheDocument();
  });

  it('should handle stage detail clicks', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Lead')).toBeInTheDocument();
    });

    // Find and click a stage detail card
    const stageCards = screen.getAllByText(/opportunities/);
    const leadCard = stageCards[0].closest('[role="button"], div[style*="cursor: pointer"], div[onclick]') ||
                    stageCards[0].parentElement;

    if (leadCard) {
      fireEvent.click(leadCard);
      expect(mockNavigate).toHaveBeenCalledWith('/opportunities?stage=lead');
    }
  });

  it('should handle service errors gracefully', async () => {
    mockPipelineService.getPipelineHealth.mockRejectedValue(new Error('API Error'));

    renderComponent();

    // Should not crash and should show some content
    await waitFor(() => {
      expect(screen.getByText('Pipeline Health Monitoring')).toBeInTheDocument();
    });
  });

  it('should update data when filters change', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockPipelineService.getPipelineHealth).toHaveBeenCalledTimes(1);
    });

    // Change partner filter
    const partnerSelect = screen.getByLabelText('Partner');
    fireEvent.mouseDown(partnerSelect);
    fireEvent.click(screen.getByText('ACME Corp'));

    await waitFor(() => {
      expect(mockPipelineService.getPipelineHealth).toHaveBeenCalledTimes(2);
    });
  });

  it('should format currency values correctly', async () => {
    renderComponent();

    await waitFor(() => {
      // Check that values are formatted in millions
      expect(screen.getByText('$5.1M')).toBeInTheDocument();
      expect(screen.getByText('$1.8M')).toBeInTheDocument();
    });
  });
});