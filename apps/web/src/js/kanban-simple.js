/**
 * Simple, Clean Kanban Implementation
 * Built from scratch for reliable drag-and-drop count updates
 */

class SimpleKanban {
    constructor() {
        this.opportunities = [];
        this.filteredOpportunities = [];
        this.sortableInstances = [];

        // Stage mapping
        this.stageMap = {
            'lead-column': 'lead',
            'demo-column': 'demo',
            'poc-column': 'poc',
            'proposal-column': 'proposal',
            'won-column': 'closed_won'
        };

        // Pipeline configuration
        this.stages = {
            lead: { probability: 10, label: 'Lead' },
            demo: { probability: 25, label: 'Demo' },
            poc: { probability: 50, label: 'POC' },
            proposal: { probability: 75, label: 'Proposal' },
            closed_won: { probability: 100, label: 'Closed Won' }
        };

        this.init();
    }

    init() {
        console.log('🚀 SimpleKanban: Initializing...');
        this.loadSampleData();
        this.renderCards();
        this.initializeDragDrop();
        this.updateCounts();
        console.log('✅ SimpleKanban: Ready!');
    }

    loadSampleData() {
        this.opportunities = [
            // Lead stage
            { id: '1', customerName: 'Tech Startup A', stage: 'lead', dealValue: 50000 },
            { id: '2', customerName: 'Enterprise Corp B', stage: 'lead', dealValue: 300000 },
            { id: '3', customerName: 'Small Business C', stage: 'lead', dealValue: 75000 },

            // Demo stage
            { id: '4', customerName: 'Manufacturing D', stage: 'demo', dealValue: 180000 },
            { id: '5', customerName: 'Healthcare E', stage: 'demo', dealValue: 220000 },

            // POC stage
            { id: '6', customerName: 'Financial F', stage: 'poc', dealValue: 450000 },
            { id: '7', customerName: 'Retail G', stage: 'poc', dealValue: 320000 },
            { id: '8', customerName: 'Education H', stage: 'poc', dealValue: 280000 },

            // Proposal stage
            { id: '9', customerName: 'Government I', stage: 'proposal', dealValue: 600000 },
            { id: '10', customerName: 'Insurance J', stage: 'proposal', dealValue: 380000 },

            // Closed Won
            { id: '11', customerName: 'Energy K', stage: 'closed_won', dealValue: 800000 },
            { id: '12', customerName: 'Transport L', stage: 'closed_won', dealValue: 520000 },
            { id: '13', customerName: 'Media M', stage: 'closed_won', dealValue: 290000 },
            { id: '14', customerName: 'Consulting N', stage: 'closed_won', dealValue: 180000 },
            { id: '15', customerName: 'Aerospace O', stage: 'closed_won', dealValue: 950000 }
        ];

        this.filteredOpportunities = [...this.opportunities];
        console.log(`📊 Loaded ${this.opportunities.length} sample opportunities`);
    }

    renderCards() {
        console.log('🎨 Rendering opportunity cards...');

        Object.keys(this.stageMap).forEach(columnId => {
            const column = document.getElementById(columnId);
            const stage = this.stageMap[columnId];

            if (column) {
                const stageOpps = this.filteredOpportunities.filter(opp => opp.stage === stage);
                column.innerHTML = stageOpps.map(opp => this.createCard(opp)).join('');
                console.log(`  ✅ ${columnId}: ${stageOpps.length} cards`);
            } else {
                console.warn(`  ❌ Column ${columnId} not found`);
            }
        });
    }

    createCard(opportunity) {
        return `
            <div class="opportunity-card" data-opportunity-id="${opportunity.id}">
                <div class="opportunity-card__header">
                    <div class="opportunity-card__title">${opportunity.customerName}</div>
                </div>
                <div class="opportunity-card__content">
                    <div class="opportunity-card__value">${this.formatCurrency(opportunity.dealValue)}</div>
                    <div class="opportunity-card__probability">${this.stages[opportunity.stage].probability}%</div>
                </div>
            </div>
        `;
    }

    initializeDragDrop() {
        console.log('🔧 Initializing drag and drop...');

        if (typeof window.Sortable === 'undefined') {
            console.error('❌ Sortable.js not available!');
            return;
        }

        // Clear any existing instances
        this.destroySortable();

        Object.keys(this.stageMap).forEach(columnId => {
            const element = document.getElementById(columnId);

            if (element) {
                const sortable = new window.Sortable(element, {
                    group: 'kanban',
                    animation: 150,
                    onEnd: (evt) => this.handleDrop(evt)
                });

                this.sortableInstances.push(sortable);
                console.log(`  ✅ Drag enabled for ${columnId}`);
            } else {
                console.warn(`  ❌ Element ${columnId} not found`);
            }
        });
    }

    handleDrop(evt) {
        const opportunityId = evt.item.dataset.opportunityId;
        const fromColumnId = evt.from.id;
        const toColumnId = evt.to.id;

        console.log(`🎯 DROP: ${opportunityId} from ${fromColumnId} to ${toColumnId}`);

        // Skip if same column
        if (fromColumnId === toColumnId) {
            console.log('  📍 Same column, no update needed');
            return;
        }

        // Get stage names
        const fromStage = this.stageMap[fromColumnId];
        const toStage = this.stageMap[toColumnId];

        if (!toStage) {
            console.error(`  ❌ Unknown target stage for ${toColumnId}`);
            return;
        }

        // Update the opportunity
        this.updateOpportunity(opportunityId, toStage);

        // Update counts immediately
        this.updateCounts();

        console.log(`  ✅ Updated ${opportunityId}: ${fromStage} → ${toStage}`);
    }

    updateOpportunity(opportunityId, newStage) {
        const opportunity = this.opportunities.find(opp => opp.id === opportunityId);

        if (opportunity) {
            opportunity.stage = newStage;
            opportunity.probability = this.stages[newStage].probability;

            // Keep filtered list in sync (for now, no filters applied)
            this.filteredOpportunities = [...this.opportunities];

            console.log(`  📝 ${opportunity.customerName} moved to ${newStage}`);
        } else {
            console.error(`  ❌ Opportunity ${opportunityId} not found`);
        }
    }

    updateCounts() {
        console.log('📊 Updating counts...');

        const stageCountMap = {
            'lead': { countId: 'lead-count', valueId: 'lead-value' },
            'demo': { countId: 'demo-count', valueId: 'demo-value' },
            'poc': { countId: 'poc-count', valueId: 'poc-value' },
            'proposal': { countId: 'proposal-count', valueId: 'proposal-value' },
            'closed_won': { countId: 'won-count', valueId: 'won-value' }
        };

        Object.entries(stageCountMap).forEach(([stage, { countId, valueId }]) => {
            const stageOpps = this.filteredOpportunities.filter(opp => opp.stage === stage);
            const count = stageOpps.length;
            const value = stageOpps.reduce((sum, opp) => sum + opp.dealValue, 0);

            // Update count
            const countEl = document.getElementById(countId);
            if (countEl) {
                countEl.textContent = count.toString();
                console.log(`  📊 ${stage}: ${count} opportunities`);
            }

            // Update value
            const valueEl = document.getElementById(valueId);
            if (valueEl) {
                valueEl.textContent = this.formatCurrency(value);
                console.log(`  💰 ${stage}: ${this.formatCurrency(value)}`);
            }
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    }

    destroySortable() {
        this.sortableInstances.forEach(instance => {
            if (instance && instance.destroy) {
                instance.destroy();
            }
        });
        this.sortableInstances = [];
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM Ready - Starting SimpleKanban');
    window.simpleKanban = new SimpleKanban();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM not ready, wait for DOMContentLoaded
} else {
    // DOM already ready
    console.log('🌟 DOM Already Ready - Starting SimpleKanban');
    window.simpleKanban = new SimpleKanban();
}