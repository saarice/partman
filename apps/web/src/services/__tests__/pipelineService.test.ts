import { pipelineService } from '../pipelineService';
import type { PipelineData, PipelineFilters, PipelineTrend } from '../pipelineService';

// Mock axios
jest.mock('axios');

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window URL and document methods
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
const mockClick = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
});

Object.defineProperty(document, 'createElement', {
  value: jest.fn().mockReturnValue({
    setAttribute: jest.fn(),
    click: mockClick,
  }),
});

Object.defineProperty(document.body, 'appendChild', { value: mockAppendChild });
Object.defineProperty(document.body, 'removeChild', { value: mockRemoveChild });

describe('PipelineService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      state: { token: 'test-token' }
    }));
  });

  describe('getPipelineHealth', () => {
    it('should return mock data when API fails', async () => {
      const filters: PipelineFilters = {
        teamMember: 'john',
        partner: 'acme',
        dateRange: '30d'
      };

      const result = await pipelineService.getPipelineHealth(filters);

      expect(result).toBeDefined();
      expect(result.stages).toHaveLength(5);
      expect(result.totalOpportunities).toBe(108);
      expect(result.totalValue).toBe(6735000);
      expect(result.weightedValue).toBe(2845000);

      // Verify stage structure
      const leadStage = result.stages.find(s => s.stage === 'lead');
      expect(leadStage).toBeDefined();
      expect(leadStage?.probability).toBe(10);
      expect(leadStage?.count).toBe(45);
    });

    it('should handle empty filters', async () => {
      const result = await pipelineService.getPipelineHealth();

      expect(result).toBeDefined();
      expect(result.stages).toHaveLength(5);
    });

    it('should return data with correct stage probabilities', async () => {
      const result = await pipelineService.getPipelineHealth();

      const expectedProbabilities = {
        lead: 10,
        demo: 25,
        poc: 50,
        proposal: 75,
        closed_won: 100
      };

      result.stages.forEach(stage => {
        expect(stage.probability).toBe(expectedProbabilities[stage.stage as keyof typeof expectedProbabilities]);
      });
    });
  });

  describe('getOpportunitiesByStage', () => {
    it('should return empty array when API fails', async () => {
      const result = await pipelineService.getOpportunitiesByStage('lead');

      expect(result).toEqual([]);
    });

    it('should handle filters correctly', async () => {
      const filters: PipelineFilters = {
        teamMember: 'sarah',
        partner: 'global'
      };

      const result = await pipelineService.getOpportunitiesByStage('demo', filters);

      expect(result).toEqual([]);
    });
  });

  describe('getPipelineTrends', () => {
    it('should return quarterly mock data by default', async () => {
      const result = await pipelineService.getPipelineTrends();

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      // Check that we have data for each stage
      const stages = ['lead', 'demo', 'poc', 'proposal', 'closed_won'];
      stages.forEach(stage => {
        const stageData = result.filter(t => t.stage === stage);
        expect(stageData.length).toBeGreaterThan(0);
      });

      // Check quarterly periods format
      const periods = [...new Set(result.map(t => t.period))];
      periods.forEach(period => {
        expect(period).toMatch(/2024-Q[1-4]/);
      });
    });

    it('should return monthly data when requested', async () => {
      const result = await pipelineService.getPipelineTrends('monthly');

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);

      // Check monthly periods format
      const periods = [...new Set(result.map(t => t.period))];
      periods.forEach(period => {
        expect(period).toMatch(/2024-\d{2}/);
      });
    });

    it('should have consistent data structure', async () => {
      const result = await pipelineService.getPipelineTrends();

      result.forEach(trend => {
        expect(trend).toHaveProperty('period');
        expect(trend).toHaveProperty('stage');
        expect(trend).toHaveProperty('count');
        expect(trend).toHaveProperty('value');
        expect(typeof trend.count).toBe('number');
        expect(typeof trend.value).toBe('number');
      });
    });
  });

  describe('exportPipelineData', () => {
    it('should create CSV with metadata headers', () => {
      const mockData: PipelineData = {
        stages: [
          { stage: 'lead', count: 10, value: 500000, probability: 10, conversionRate: 30, trend: 'up' },
          { stage: 'demo', count: 8, value: 400000, probability: 25, conversionRate: 75, trend: 'stable' }
        ],
        totalValue: 900000,
        weightedValue: 150000,
        totalOpportunities: 18
      };

      const filters: PipelineFilters = {
        teamMember: 'john',
        partner: 'acme',
        dateRange: '30d'
      };

      pipelineService.exportPipelineData(mockData, 'test.csv', filters);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('should handle data without filters', () => {
      const mockData: PipelineData = {
        stages: [
          { stage: 'lead', count: 10, value: 500000, probability: 10 }
        ],
        totalValue: 500000,
        weightedValue: 50000,
        totalOpportunities: 10
      };

      pipelineService.exportPipelineData(mockData);

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  describe('exportPipelineTrends', () => {
    it('should create CSV for trends data', () => {
      const mockTrends: PipelineTrend[] = [
        { period: '2024-Q1', stage: 'lead', count: 20, value: 1000000 },
        { period: '2024-Q1', stage: 'demo', count: 15, value: 750000 }
      ];

      pipelineService.exportPipelineTrends(mockTrends, 'trends.csv', 'quarterly');

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle monthly trends', () => {
      const mockTrends: PipelineTrend[] = [
        { period: '2024-09', stage: 'lead', count: 5, value: 250000 }
      ];

      pipelineService.exportPipelineTrends(mockTrends, 'monthly-trends.csv', 'monthly');

      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  describe('private getDisplayName', () => {
    // Test the private method indirectly through export functions
    it('should use display names in CSV export', () => {
      const mockData: PipelineData = {
        stages: [
          { stage: 'poc', count: 5, value: 250000, probability: 50 }
        ],
        totalValue: 250000,
        weightedValue: 125000,
        totalOpportunities: 5
      };

      // Mock Blob constructor to capture CSV content
      const mockBlob = jest.fn();
      global.Blob = mockBlob;

      pipelineService.exportPipelineData(mockData);

      expect(mockBlob).toHaveBeenCalled();
      const csvContent = mockBlob.mock.calls[0][0][0];
      expect(csvContent).toContain('POC'); // Display name for 'poc'
    });
  });
});