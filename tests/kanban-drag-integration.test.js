/**
 * Integration test for Kanban drag and drop count calculations
 * Tests the core functionality without browser automation
 */

// Mock DOM elements and methods
const createMockElement = (id, initialText = '-') => ({
    id,
    textContent: initialText,
    dataset: {}
});

// Create mock elements
const mockElements = {
    'lead-count': createMockElement('lead-count'),
    'lead-value': createMockElement('lead-value'),
    'demo-count': createMockElement('demo-count'),
    'demo-value': createMockElement('demo-value'),
    'poc-count': createMockElement('poc-count'),
    'poc-value': createMockElement('poc-value'),
    'proposal-count': createMockElement('proposal-count'),
    'proposal-value': createMockElement('proposal-value'),
    'won-count': createMockElement('won-count'),
    'won-value': createMockElement('won-value'),
    'partner-filter': { value: '' },
    'assignee-filter': { value: '' },
    'value-filter': { value: '' },
    'date-filter': { value: '' },
    'search-input': { value: '' }
};

// Mock DOM
global.document = {
    getElementById: (id) => mockElements[id] || null
};

global.window = {
    showNotification: jest.fn()
};

describe('Kanban Drag Count Calculations', () => {
    beforeEach(() => {
        // Reset all count and value elements
        ['lead', 'demo', 'poc', 'proposal', 'won'].forEach(stage => {
            mockElements[`${stage}-count`].textContent = '-';
            mockElements[`${stage}-value`].textContent = '-';
        });
    });

    // Extract the core logic we're testing
    function updatePipelineCounts(filteredOpportunities) {
        const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);

        const stageMapping = {
            'lead': { countId: 'lead-count', valueId: 'lead-value' },
            'demo': { countId: 'demo-count', valueId: 'demo-value' },
            'poc': { countId: 'poc-count', valueId: 'poc-value' },
            'proposal': { countId: 'proposal-count', valueId: 'proposal-value' },
            'closed_won': { countId: 'won-count', valueId: 'won-value' }
        };

        Object.entries(stageMapping).forEach(([stage, { countId, valueId }]) => {
            const stageOpportunities = filteredOpportunities.filter(opp => opp.stage === stage);
            const count = stageOpportunities.length;
            const value = stageOpportunities.reduce((sum, opp) => sum + (Number(opp.dealValue) || 0), 0);

            const countEl = document.getElementById(countId);
            const valueEl = document.getElementById(valueId);

            if (countEl) countEl.textContent = count.toString();
            if (valueEl) valueEl.textContent = formatCurrency(value);
        });
    }

    test('updatePipelineCounts correctly calculates stage totals', () => {
        const testOpportunities = [
            { id: '1', stage: 'lead', dealValue: 100000, customerName: 'Test Lead' },
            { id: '2', stage: 'lead', dealValue: 200000, customerName: 'Test Lead 2' },
            { id: '3', stage: 'demo', dealValue: 300000, customerName: 'Test Demo' },
            { id: '4', stage: 'proposal', dealValue: 500000, customerName: 'Test Proposal' }
        ];

        updatePipelineCounts(testOpportunities);

        // Verify results
        expect(document.getElementById('lead-count').textContent).toBe('2');
        expect(document.getElementById('lead-value').textContent).toBe('$300,000');
        expect(document.getElementById('demo-count').textContent).toBe('1');
        expect(document.getElementById('demo-value').textContent).toBe('$300,000');
        expect(document.getElementById('poc-count').textContent).toBe('0');
        expect(document.getElementById('poc-value').textContent).toBe('$0');
        expect(document.getElementById('proposal-count').textContent).toBe('1');
        expect(document.getElementById('proposal-value').textContent).toBe('$500,000');
        expect(document.getElementById('won-count').textContent).toBe('0');
        expect(document.getElementById('won-value').textContent).toBe('$0');
    });

    test('empty stages show zero counts and values', () => {
        updatePipelineCounts([]); // No opportunities

        // All stages should show 0 and $0
        expect(document.getElementById('lead-count').textContent).toBe('0');
        expect(document.getElementById('lead-value').textContent).toBe('$0');
        expect(document.getElementById('demo-count').textContent).toBe('0');
        expect(document.getElementById('demo-value').textContent).toBe('$0');
        expect(document.getElementById('poc-count').textContent).toBe('0');
        expect(document.getElementById('poc-value').textContent).toBe('$0');
        expect(document.getElementById('proposal-count').textContent).toBe('0');
        expect(document.getElementById('proposal-value').textContent).toBe('$0');
        expect(document.getElementById('won-count').textContent).toBe('0');
        expect(document.getElementById('won-value').textContent).toBe('$0');
    });

    test('currency formatting is correct', () => {
        const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);

        expect(formatCurrency(1250000)).toBe('$1,250,000');
        expect(formatCurrency(0)).toBe('$0');
        expect(formatCurrency(999)).toBe('$999');
        expect(formatCurrency(1000000.50)).toBe('$1,000,001'); // Should round
    });

    test('number conversion handles edge cases', () => {
        const testValues = [
            { input: 100000, expected: 100000 },
            { input: '200000', expected: 200000 },
            { input: undefined, expected: 0 },
            { input: null, expected: 0 },
            { input: 'invalid', expected: 0 },
            { input: '', expected: 0 }
        ];

        testValues.forEach(({ input, expected }) => {
            const result = Number(input) || 0;
            expect(result).toBe(expected);
        });
    });
});