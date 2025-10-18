/**
 * Comprehensive Opportunity Management System
 * Based on PRD Epic 3: Opportunity Pipeline Management
 */

class OpportunityManager {
    constructor() {
        this.opportunities = [];
        this.filteredOpportunities = [];
        this.currentView = 'kanban';
        this.sortBy = 'expectedCloseDate';
        this.sortDirection = 'asc';
        this.editingOpportunity = null;
        this.sortableInstances = [];
        this.kanbanNeedsInit = true;

        // Pipeline configuration based on PRD
        this.pipelineStages = {
            lead: { order: 1, probability: 10, color: '#6b7280', label: 'Lead' },
            demo: { order: 2, probability: 25, color: '#3b82f6', label: 'Demo' },
            poc: { order: 3, probability: 50, color: '#f59e0b', label: 'POC' },
            proposal: { order: 4, probability: 75, color: '#8b5cf6', label: 'Proposal' },
            closed_won: { order: 5, probability: 100, color: '#10b981', label: 'Closed Won' },
            closed_lost: { order: 6, probability: 0, color: '#ef4444', label: 'Closed Lost' }
        };

        this.init();
    }

    init() {
        console.log('🌟 OPPORTUNITY MANAGER INIT STARTING...');
        console.log('📱 Current view:', this.currentView);
        console.log('🎯 kanbanNeedsInit:', this.kanbanNeedsInit);

        this.bindEvents();
        this.setupEventDelegation();
        this.loadSampleData();
        this.renderCurrentView();
        this.updateKPIs();
        // Charts will be initialized when analytics view is first accessed

        console.log('✅ OPPORTUNITY MANAGER INIT COMPLETE');
    }

    setupEventDelegation() {
        // Event delegation + drag guard for card clicks
        let dragging = false;

        document.addEventListener('dragstart', () => {
            dragging = true;
        }, { capture: true });

        document.addEventListener('dragend', () => {
            dragging = false;
        }, { capture: true });

        document.addEventListener('click', (e) => {
            if (dragging) return;

            const card = e.target.closest('.opportunity-card');
            if (card && !e.target.closest('.opportunity-card__actions')) {
                this.openDetailModal(card.dataset.opportunityId);
            }
        });

        console.log('✅ Event delegation with drag guard setup');
    }

    bindEvents() {
        // View toggles
        document.querySelectorAll('.view-toggle__btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });

        // Add opportunity
        document.getElementById('add-opportunity-btn').addEventListener('click', () => this.openOpportunityModal());

        // Modal events
        document.getElementById('cancel-opportunity').addEventListener('click', () => this.closeOpportunityModal());
        document.querySelector('#opportunity-modal .modal__close').addEventListener('click', () => this.closeOpportunityModal());
        document.querySelector('#forecast-modal .modal__close').addEventListener('click', () => this.closeForecastModal());
        document.querySelector('#detail-modal .modal__close').addEventListener('click', () => this.closeDetailModal());
        document.querySelector('#pipeline-report-modal .modal__close').addEventListener('click', () => this.closePipelineReport());
        document.getElementById('export-report-btn').addEventListener('click', () => this.exportPipelineReport());

        // Form submission
        document.getElementById('opportunity-form').addEventListener('submit', (e) => this.saveOpportunity(e));

        // Filters
        document.getElementById('partner-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('assignee-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('value-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('date-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('search-input').addEventListener('input', () => this.applyFilters());
        document.getElementById('reset-filters-btn').addEventListener('click', () => this.resetFilters());

        // Export and forecast buttons
        document.getElementById('export-pipeline-btn').addEventListener('click', () => this.exportPipeline());
        document.getElementById('forecast-btn').addEventListener('click', () => this.openForecastModal());
        document.getElementById('view-pipeline-report').addEventListener('click', (e) => {
            e.preventDefault();
            this.openPipelineReport();
        });

        // Stage selection auto-probability update
        document.getElementById('stage-select').addEventListener('change', (e) => {
            const stage = e.target.value;
            if (this.pipelineStages[stage]) {
                document.getElementById('probability').value = this.pipelineStages[stage].probability;
                this.updateCommissionPreview();
            }
        });

        // Deal value change updates commission
        document.getElementById('deal-value').addEventListener('input', () => this.updateCommissionPreview());

        // Table sorting
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', (e) => this.sortTable(e.target.dataset.sort));
        });

        // Backdrop clicks to close modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                // Close modal if clicking outside the modal container
                if (e.target === modal) {
                    document.body.classList.remove('modal-open');
                    modal.style.display = 'none';
                }
            });
        });

        // ESC key to close modals (UX Standard - Accessibility)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal[style*="flex"]');
                if (openModal) {
                    document.body.classList.remove('modal-open');
                    openModal.style.display = 'none';
                }
            }
        });
    }

    initializeKanban() {
        console.log('🚀 KANBAN INIT DEBUG START');
        console.log('Current instances count:', this.sortableInstances.length);
        console.log('window.Sortable available:', typeof window.Sortable);

        // NEVER re-init if already done
        if (this.sortableInstances.length > 0) {
            console.log('❌ BLOCKED: Already initialized');
            return;
        }

        if (typeof window.Sortable === 'undefined') {
            console.error('❌ Sortable.js not loaded!');
            setTimeout(() => this.initializeKanban(), 500);
            return;
        }

        // Column to stage mapping
        const columnStageMapping = {
            'lead-column': 'lead',
            'demo-column': 'demo',
            'poc-column': 'poc',
            'proposal-column': 'proposal',
            'won-column': 'closed_won'
        };

        const columnIds = Object.keys(columnStageMapping);
        console.log('🔍 Checking columns...');

        columnIds.forEach(id => {
            const el = document.getElementById(id);
            console.log(`${id}:`, el ? 'EXISTS' : 'MISSING');
        });

        // Setup with comprehensive onEnd handler
        const instances = [];

        columnIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                console.log(`🔧 Creating Sortable for ${id}...`);

                try {
                    const instance = new window.Sortable(el, {
                        group: 'kanban-pipeline',
                        animation: 150,
                        onStart: (evt) => {
                            console.log(`🎯 DRAG START: ${evt.item.dataset.opportunityId}`);
                            console.log(`  Item:`, evt.item);
                            console.log(`  Dataset:`, evt.item.dataset);
                        },
                        onEnd: (evt) => {
                            console.log(`🎯 MAIN SYSTEM DRAG END:`);

                            const opportunityId = evt.item.dataset.opportunityId;
                            const fromColumnId = evt.from.id;
                            const toColumnId = evt.to.id;

                            console.log(`  ID: ${opportunityId}, From: ${fromColumnId}, To: ${toColumnId}`);

                            // Skip if same column
                            if (fromColumnId === toColumnId) {
                                console.log('  📍 Same column, no update needed');
                                return;
                            }

                            // Get stage names using the same mapping as SimpleKanban
                            const stageMap = {
                                'lead-column': 'lead',
                                'demo-column': 'demo',
                                'poc-column': 'poc',
                                'proposal-column': 'proposal',
                                'won-column': 'closed_won'
                            };

                            const fromStage = stageMap[fromColumnId];
                            const toStage = stageMap[toColumnId];

                            if (!toStage) {
                                console.error(`  ❌ Unknown target stage for ${toColumnId}`);
                                return;
                            }

                            console.log(`  🔄 BEFORE UPDATE - Looking for opportunity ${opportunityId}`);
                            const beforeOpp = this.opportunities.find(opp => opp.id === opportunityId);
                            if (beforeOpp) {
                                console.log(`    Found: ${beforeOpp.customerName} - stage: ${beforeOpp.stage}`);
                            } else {
                                console.log(`    NOT FOUND in ${this.opportunities.length} opportunities`);
                                console.log('    Available IDs:', this.opportunities.slice(0, 5).map(o => o.id));
                                return;
                            }

                            // Update the opportunity using SimpleKanban approach
                            beforeOpp.stage = toStage;
                            beforeOpp.probability = this.pipelineStages[toStage]?.probability || 50;

                            // Keep filtered list in sync - preserve active filters
                            this.refreshFilteredOpportunities();

                            console.log(`  🔄 AFTER UPDATE - ${beforeOpp.customerName} - stage: ${beforeOpp.stage}`);

                            // Check if the dragged opportunity is still visible after filtering
                            const stillVisible = this.filteredOpportunities.find(opp => opp.id === opportunityId);
                            if (!stillVisible) {
                                console.log(`  ⚠️ Note: ${beforeOpp.customerName} no longer matches active filters`);
                                if (window.showNotification) {
                                    window.showNotification(`${beforeOpp.customerName} moved to ${this.pipelineStages[toStage]?.label} (filtered from view)`, 'info');
                                }
                            }

                            // Update kanban cards to reflect filtered changes
                            this.updateKanbanCards();

                            // Update counts immediately
                            this.updatePipelineCounts();

                            console.log(`  ✅ Updated ${opportunityId}: ${fromStage} → ${toStage}`);
                        }
                    });

                    instances.push(instance);
                    console.log(`✅ SUCCESS: ${id} Sortable created`);
                } catch (error) {
                    console.error(`❌ FAILED: ${id}`, error);
                }
            } else {
                console.error(`❌ MISSING: ${id} element not found`);
            }
        });

        this.sortableInstances = instances;
        console.log(`🎯 INIT COMPLETE: ${instances.length}/${columnIds.length} instances`);

        // Test if instances are working
        instances.forEach((instance, i) => {
            console.log(`Instance ${i}:`, instance ? 'OK' : 'FAILED');
        });
    }

    mapColumnToStage(columnId) {
        const mapping = {
            'lead-column': 'lead',
            'demo-column': 'demo',
            'poc-column': 'poc',
            'proposal-column': 'proposal',
            'won-column': 'closed_won'
        };
        return mapping[columnId];
    }

    updateOpportunityModel(opportunityId, newStage) {
        // Update JS data ONLY - no DOM manipulation
        console.log(`🔄 UPDATE MODEL: Looking for opportunity ${opportunityId}`);
        console.log(`🔄 Total opportunities: ${this.opportunities.length}`);

        const opportunity = this.opportunities.find(opp => opp.id === opportunityId);
        if (opportunity) {
            const oldStage = opportunity.stage;
            console.log(`📝 BEFORE UPDATE: ${opportunity.customerName} - stage: ${oldStage}`);

            opportunity.stage = newStage;
            opportunity.probability = this.pipelineStages[newStage]?.probability || 50;
            opportunity.updatedAt = new Date();

            console.log(`📝 AFTER UPDATE: ${opportunity.customerName} - stage: ${opportunity.stage}`);

            // Keep filteredOpportunities in sync by reapplying filter logic
            // This preserves any active filters without triggering a re-render
            this.refreshFilteredOpportunities();

            console.log(`✅ Updated ${opportunity.customerName}: ${oldStage} → ${newStage} (${opportunity.probability}%)`);
            if (window.showNotification) {
                window.showNotification(`Moved "${opportunity.customerName}" to ${this.pipelineStages[newStage]?.label}`, 'success');
            }
        } else {
            console.error(`❌ Opportunity ${opportunityId} not found in data model!`);
            console.log('Available opportunities:', this.opportunities.map(o => ({ id: o.id, name: o.customerName })));
        }
    }

    refreshFilteredOpportunities() {
        // Extract and reapply current filter logic without triggering view updates
        const partnerFilter = document.getElementById('partner-filter').value;
        const assigneeFilter = document.getElementById('assignee-filter').value;
        const valueFilter = document.getElementById('value-filter').value;
        const dateFilter = document.getElementById('date-filter').value;
        const searchTerm = document.getElementById('search-input').value.toLowerCase();

        this.filteredOpportunities = this.opportunities.filter(opp => {
            // Partner filter
            if (partnerFilter && opp.partnerId !== partnerFilter) return false;

            // Assignee filter
            if (assigneeFilter && opp.assignedUserId !== assigneeFilter) return false;

            // Value filter
            if (valueFilter) {
                const value = opp.dealValue;
                switch (valueFilter) {
                    case 'small': if (value >= 50000) return false; break;
                    case 'medium': if (value < 50000 || value > 200000) return false; break;
                    case 'large': if (value < 200000 || value > 500000) return false; break;
                    case 'enterprise': if (value <= 500000) return false; break;
                }
            }

            // Date filter
            if (dateFilter) {
                const closeDate = new Date(opp.expectedCloseDate);
                const now = new Date();
                const diffTime = closeDate - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                switch (dateFilter) {
                    case 'overdue': if (diffDays >= 0) return false; break;
                    case 'thisweek': if (diffDays < 0 || diffDays > 7) return false; break;
                    case 'thismonth': if (diffDays < 0 || diffDays > 30) return false; break;
                    case 'nextmonth': if (diffDays < 30 || diffDays > 60) return false; break;
                    case 'thisquarter': if (diffDays < 0 || diffDays > 90) return false; break;
                }
            }

            // Search filter
            if (searchTerm) {
                const searchableText = `${opp.customerName} ${opp.customerContact?.company || ''} ${this.getPartnerName(opp.partnerId)}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) return false;
            }

            return true;
        });

    }

    updatePipelineCounts() {
        console.log('📊 MAIN SYSTEM: Updating counts...');

        const stageCountMap = {
            'lead': { countId: 'lead-count', valueId: 'lead-value' },
            'demo': { countId: 'demo-count', valueId: 'demo-value' },
            'poc': { countId: 'poc-count', valueId: 'poc-value' },
            'proposal': { countId: 'proposal-count', valueId: 'proposal-value' },
            'closed_won': { countId: 'won-count', valueId: 'won-value' }
        };

        console.log(`  🔍 Total filteredOpportunities: ${this.filteredOpportunities.length}`);

        Object.entries(stageCountMap).forEach(([stage, { countId, valueId }]) => {
            const stageOpps = this.filteredOpportunities.filter(opp => opp.stage === stage);
            const count = stageOpps.length;
            const value = stageOpps.reduce((sum, opp) => sum + opp.dealValue, 0);

            console.log(`  🔢 ${stage}: found ${count} opportunities, total value: $${value}`);

            // Update count
            const countEl = document.getElementById(countId);
            if (countEl) {
                const oldCount = countEl.textContent;
                countEl.textContent = count.toString();
                console.log(`  📊 ${stage} count: ${oldCount} → ${count}`);
            } else {
                console.error(`  ❌ Count element ${countId} not found`);
            }

            // Update value
            const valueEl = document.getElementById(valueId);
            if (valueEl) {
                const oldValue = valueEl.textContent;
                const newValue = this.formatCurrency(value);
                valueEl.textContent = newValue;
                console.log(`  💰 ${stage} value: ${oldValue} → ${newValue}`);
            } else {
                console.error(`  ❌ Value element ${valueId} not found`);
            }
        });
    }

    async persistStageChange(opportunityId, newStage, fromStage) {
        try {
            console.log(`💾 Persisting stage change for ${opportunityId}: ${fromStage} → ${newStage}`);

            // Simulate API call
            const response = await fetch(`/api/opportunities/${opportunityId}/stage`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    stage: newStage,
                    probability: this.pipelineStages[newStage]?.probability || 50,
                    updatedAt: new Date().toISOString(),
                    previousStage: fromStage
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log(`✅ Stage change persisted successfully:`, result);

            return result;
        } catch (error) {
            console.error(`❌ Failed to persist stage change:`, error);
            throw error;
        }
    }

    rollbackStageChange(opportunityId, originalStage) {
        console.log(`↩️ Rolling back ${opportunityId} to ${originalStage}`);

        // Revert the in-memory model
        const opportunity = this.opportunities.find(opp => opp.id === opportunityId);
        if (opportunity) {
            opportunity.stage = originalStage;
            opportunity.probability = this.pipelineStages[originalStage]?.probability || 50;
            opportunity.updatedAt = new Date();

            // Keep filteredOpportunities in sync by reapplying filters
            this.refreshFilteredOpportunities();

            // Recompute counts after rollback
            this.updatePipelineCounts();

            window.showNotification(`Failed to update - reverted "${opportunity.customerName}" to ${this.pipelineStages[originalStage]?.label}`, 'error');
        }
    }

    getAuthToken() {
        // Get the token from localStorage (set during login)
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found');
            window.location.href = '/login';
            return null;
        }
        return token;
    }

    // Test method to simulate drag operation
    testDragUpdate() {
        console.log('🧪 TESTING MAIN SYSTEM: Simulating drag update...');

        if (!this.opportunities || this.opportunities.length === 0) {
            console.error('❌ No opportunities found for test');
            return;
        }

        // Check if filters are active
        const partnerFilter = document.getElementById('partner-filter').value;
        const assigneeFilter = document.getElementById('assignee-filter').value;
        const valueFilter = document.getElementById('value-filter').value;
        const dateFilter = document.getElementById('date-filter').value;
        const searchTerm = document.getElementById('search-input').value.toLowerCase();

        const hasActiveFilters = partnerFilter || assigneeFilter || valueFilter || dateFilter || searchTerm;

        if (hasActiveFilters) {
            console.log('🔍 Active filters detected, testing with filtered data');
            console.log(`  Partner: ${partnerFilter}, Assignee: ${assigneeFilter}, Value: ${valueFilter}, Date: ${dateFilter}, Search: "${searchTerm}"`);
        }

        // Find the first lead opportunity from filtered results
        const leadOpp = this.filteredOpportunities.find(opp => opp.stage === 'lead');
        if (!leadOpp) {
            console.error('❌ No lead opportunities found in filtered results for test');
            console.log('Available stages:', [...new Set(this.filteredOpportunities.map(o => o.stage))]);
            return;
        }

        console.log(`📊 BEFORE: ${leadOpp.customerName} is in stage ${leadOpp.stage}`);
        console.log(`📊 Before filtered count: ${this.filteredOpportunities.length}`);

        // Simulate moving it to demo (update the original data)
        leadOpp.stage = 'demo';
        leadOpp.probability = this.pipelineStages['demo']?.probability || 25;

        // Refresh filtered data to respect active filters
        this.refreshFilteredOpportunities();

        console.log(`📊 AFTER: ${leadOpp.customerName} is in stage ${leadOpp.stage}`);
        console.log(`📊 After filtered count: ${this.filteredOpportunities.length}`);

        // Check if still visible after filters
        const stillVisible = this.filteredOpportunities.find(opp => opp.id === leadOpp.id);
        if (!stillVisible && hasActiveFilters) {
            console.log(`⚠️ ${leadOpp.customerName} no longer matches active filters after move`);
        }

        // Update counts
        this.updatePipelineCounts();

        console.log('🧪 Test complete - check if counts updated correctly with filters');
    }

    updateKanbanCards() {
        console.log('🎨 UPDATING KANBAN CARDS (preserving Sortable)...');

        const columnMapping = {
            'lead': 'lead-column',
            'demo': 'demo-column',
            'poc': 'poc-column',
            'proposal': 'proposal-column',
            'closed_won': 'won-column'
        };

        Object.entries(columnMapping).forEach(([stage, columnId]) => {
            const column = document.getElementById(columnId);
            const stageOpportunities = this.filteredOpportunities.filter(opp => opp.stage === stage);

            console.log(`  📦 Updating ${stage} (${stageOpportunities.length} cards) in ${columnId}`);

            if (column) {
                // Update innerHTML while preserving Sortable instances
                column.innerHTML = stageOpportunities.map(opp => this.createOpportunityCard(opp)).join('');
                console.log(`  ✅ ${columnId} cards updated`);
            } else {
                console.error(`  ❌ Column ${columnId} not found!`);
            }
        });

        console.log('✅ updateKanbanCards complete');
    }

    updateCountsAndKpis() {
        // Update counts/KPIs only - NEVER re-render cards
        this.updatePipelineCounts();
        this.updateKPIs();
    }



    destroyKanban() {
        console.log('🧹 Destroying Kanban instances...');
        this.sortableInstances.forEach(instance => {
            if (instance && instance.destroy) {
                instance.destroy();
            }
        });
        this.sortableInstances = [];
        this.kanbanNeedsInit = true;
    }



    updateKanbanCounts() {
        // Delegate to the new comprehensive method
        this.updatePipelineCounts();
    }

    validateStageProgression(fromStage, toStage) {
        const fromOrder = this.pipelineStages[fromStage]?.order || 0;
        const toOrder = this.pipelineStages[toStage]?.order || 0;

        // Allow forward progression or closed states
        if (toOrder > fromOrder || toStage === 'closed_won' || toStage === 'closed_lost') {
            return true;
        }

        // Backward movement requires validation (simplified for demo)
        return false;
    }

    async updateOpportunityStage(opportunityId, newStage) {
        const response = await fetch(`/api/opportunities/${opportunityId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                stage: newStage,
                probability: this.pipelineStages[newStage].probability,
                updatedAt: new Date()
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async logStageHistory(opportunityId, fromStage, toStage) {
        try {
            const response = await fetch('/api/opportunities/stage-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    opportunityId,
                    fromStage,
                    toStage,
                    timestamp: new Date(),
                    userId: 'current-user' // This should come from auth context
                })
            });

            if (!response.ok) {
                console.warn('Failed to log stage history:', response.status);
            }
        } catch (error) {
            console.warn('Failed to log stage history:', error);
        }
    }

    switchView(view) {
        this.currentView = view;

        // Update button states
        document.querySelectorAll('.view-toggle__btn').forEach(btn => {
            btn.classList.toggle('view-toggle__btn--active', btn.dataset.view === view);
        });

        // Show/hide views
        document.querySelectorAll('.pipeline-view').forEach(viewEl => {
            viewEl.style.display = viewEl.id === `${view}-view` ? 'block' : 'none';
        });

        // Render the current view
        this.renderCurrentView();
    }

    renderCurrentView() {
        console.log('🎭 RENDER CURRENT VIEW:', this.currentView);
        switch (this.currentView) {
            case 'kanban':
                console.log('📋 Rendering KANBAN view');
                this.renderKanbanView();
                break;
            case 'table':
                console.log('📊 Rendering TABLE view');
                this.renderTableView();
                break;
            case 'analytics':
                console.log('📈 Rendering ANALYTICS view');
                this.renderAnalyticsView();
                break;
        }
    }

    renderKanbanView() {
        console.log('🎨 RENDER KANBAN VIEW DEBUG');
        console.log('Current sortableInstances.length:', this.sortableInstances.length);
        console.log('Current view:', this.currentView);

        // Only render cards on first load - NEVER after init
        if (this.sortableInstances.length === 0) {
            console.log('🆕 FIRST TIME RENDER - creating cards and initializing');

            const columnMapping = {
                'lead': 'lead-column',
                'demo': 'demo-column',
                'poc': 'poc-column',
                'proposal': 'proposal-column',
                'closed_won': 'won-column'
            };

            Object.entries(columnMapping).forEach(([stage, columnId]) => {
                const column = document.getElementById(columnId);
                const stageOpportunities = this.filteredOpportunities.filter(opp => opp.stage === stage);

                console.log(`📦 Rendering ${stage} (${stageOpportunities.length} cards) to ${columnId}`);

                if (column) {
                    // ONLY innerHTML on first render
                    column.innerHTML = stageOpportunities.map(opp => this.createOpportunityCard(opp)).join('');
                    console.log(`✅ ${columnId} innerHTML set`);
                } else {
                    console.error(`❌ Column ${columnId} not found!`);
                }
            });

            // Initialize Sortable ONCE
            console.log('🔧 About to call initializeKanban...');
            this.initializeKanban();
        } else {
            console.log('⏩ KANBAN ALREADY ACTIVE - SKIPPING ALL DOM OPERATIONS');
        }

        // Always update counts (safe)
        console.log('📊 Updating counts...');
        this.updatePipelineCounts();
        console.log('✅ renderKanbanView complete');
    }


    createOpportunityCard(opportunity) {
        const partner = this.getPartnerName(opportunity.partnerId);
        const assignee = this.getAssigneeName(opportunity.assignedUserId);
        const daysToClose = this.getDaysToClose(opportunity.expectedCloseDate);
        const isOverdue = daysToClose < 0;

        return `
            <div class="opportunity-card" data-opportunity-id="${opportunity.id}">
                <div class="opportunity-card__header">
                    <div class="opportunity-card__title">${opportunity.customerName}</div>
                    <div class="opportunity-card__actions">
                        <button class="action-btn action-btn--sm" onclick="event.stopPropagation(); window.opportunityManager.editOpportunity('${opportunity.id}')">
                            <svg class="icon icon--sm" aria-hidden="true"><use href="#icon-edit-3"></use></svg>
                        </button>
                    </div>
                </div>
                <div class="opportunity-card__content">
                    <div class="opportunity-card__value">${this.formatCurrency(opportunity.dealValue)}</div>
                    <div class="opportunity-card__partner">${partner}</div>
                    <div class="opportunity-card__meta">
                        <span class="opportunity-card__probability">${opportunity.probability}%</span>
                        <span class="opportunity-card__date ${isOverdue ? 'opportunity-card__date--overdue' : ''}">
                            ${isOverdue ? 'Overdue' : `${Math.abs(daysToClose)}d`}
                        </span>
                    </div>
                    ${assignee ? `<div class="opportunity-card__assignee">${assignee}</div>` : ''}
                </div>
                <div class="opportunity-card__footer">
                    <div class="probability-bar">
                        <div class="probability-fill" style="width: ${opportunity.probability}%; background-color: ${this.pipelineStages[opportunity.stage].color};"></div>
                    </div>
                </div>
            </div>
        `;
    }

    renderTableView() {
        const tbody = document.getElementById('opportunities-table-body');
        if (!tbody) return;

        tbody.innerHTML = this.filteredOpportunities.map(opp => this.createTableRow(opp)).join('');

        // Bind row actions
        document.querySelectorAll('.table-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const opportunityId = btn.closest('tr').dataset.opportunityId;

                switch (action) {
                    case 'view':
                        this.openDetailModal(opportunityId);
                        break;
                    case 'edit':
                        this.editOpportunity(opportunityId);
                        break;
                    case 'delete':
                        this.deleteOpportunity(opportunityId);
                        break;
                }
            });
        });
    }

    createTableRow(opportunity) {
        const partner = this.getPartnerName(opportunity.partnerId);
        const daysToClose = this.getDaysToClose(opportunity.expectedCloseDate);
        const isOverdue = daysToClose < 0;

        return `
            <tr role="row" class="data-table__row" data-opportunity-id="${opportunity.id}">
                <td class="data-table__cell">
                    <div class="opportunity-info">
                        <strong>${opportunity.customerName}</strong>
                        <span class="opportunity-company">${opportunity.customerContact?.company || ''}</span>
                    </div>
                </td>
                <td class="data-table__cell">
                    <div class="partner-info">
                        <strong>${partner}</strong>
                    </div>
                </td>
                <td class="data-table__cell">
                    <strong class="deal-value">${this.formatCurrency(opportunity.dealValue)}</strong>
                </td>
                <td class="data-table__cell">
                    <span class="stage-pill stage-pill--${opportunity.stage}">${this.pipelineStages[opportunity.stage].label}</span>
                </td>
                <td class="data-table__cell">
                    <div class="probability-indicator">
                        <div class="probability-bar">
                            <div class="probability-fill" style="width: ${opportunity.probability}%; background-color: ${this.pipelineStages[opportunity.stage].color};"></div>
                        </div>
                        <span class="probability-text">${opportunity.probability}%</span>
                    </div>
                </td>
                <td class="data-table__cell">
                    <span class="${isOverdue ? 'date-overdue' : ''}">${this.formatDate(opportunity.expectedCloseDate)}</span>
                </td>
                <td class="data-table__cell">
                    <div class="table-actions">
                        <button class="table-action-btn" data-action="view" title="View Details">
                            <svg class="icon icon--sm" aria-hidden="true"><use href="#icon-eye"></use></svg>
                        </button>
                        <button class="table-action-btn" data-action="edit" title="Edit">
                            <svg class="icon icon--sm" aria-hidden="true"><use href="#icon-edit-3"></use></svg>
                        </button>
                        <button class="table-action-btn table-action-btn--danger" data-action="delete" title="Delete">
                            <svg class="icon icon--sm" aria-hidden="true"><use href="#icon-trash-2"></use></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    renderAnalyticsView() {
        console.log('🔍 Rendering Analytics View...');

        // Check if analytics view is visible
        const analyticsView = document.getElementById('analytics-view');
        if (!analyticsView || analyticsView.style.display === 'none') {
            console.warn('❌ Analytics view not visible, skipping chart initialization');
            return;
        }

        // Initialize charts if they don't exist
        if (!this.velocityChart || !this.funnelChart || !this.forecastChart || !this.winLossChart) {
            console.log('📊 Initializing charts for first time...');
            setTimeout(() => {
                try {
                    this.initializeCharts();
                    this.updateAnalyticsCharts();
                    this.populateAnalyticsData();
                } catch (error) {
                    console.error('❌ Error initializing charts:', error);
                }
            }, 100);
        } else {
            console.log('📊 Charts already exist, updating data...');
            this.updateAnalyticsCharts();
            this.populateAnalyticsData();
        }
    }

    applyFilters() {
        const partnerFilter = document.getElementById('partner-filter').value;
        const assigneeFilter = document.getElementById('assignee-filter').value;
        const valueFilter = document.getElementById('value-filter').value;
        const dateFilter = document.getElementById('date-filter').value;
        const searchTerm = document.getElementById('search-input').value.toLowerCase();

        this.filteredOpportunities = this.opportunities.filter(opp => {
            // Partner filter
            if (partnerFilter && opp.partnerId !== partnerFilter) return false;

            // Assignee filter
            if (assigneeFilter && opp.assignedUserId !== assigneeFilter) return false;

            // Value filter
            if (valueFilter) {
                const value = opp.dealValue;
                switch (valueFilter) {
                    case 'small': if (value >= 50000) return false; break;
                    case 'medium': if (value < 50000 || value > 200000) return false; break;
                    case 'large': if (value < 200000 || value > 500000) return false; break;
                    case 'enterprise': if (value <= 500000) return false; break;
                }
            }

            // Date filter
            if (dateFilter) {
                const closeDate = new Date(opp.expectedCloseDate);
                const now = new Date();
                const diffTime = closeDate - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                switch (dateFilter) {
                    case 'overdue': if (diffDays >= 0) return false; break;
                    case 'thisweek': if (diffDays < 0 || diffDays > 7) return false; break;
                    case 'thismonth': if (diffDays < 0 || diffDays > 30) return false; break;
                    case 'nextmonth': if (diffDays < 30 || diffDays > 60) return false; break;
                    case 'thisquarter': if (diffDays < 0 || diffDays > 90) return false; break;
                }
            }

            // Search filter
            if (searchTerm) {
                const searchableText = `${opp.customerName} ${opp.customerContact?.company || ''} ${this.getPartnerName(opp.partnerId)}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) return false;
            }

            return true;
        });

        // NEVER re-render kanban after init - only update data/counts
        if (this.currentView === 'kanban' && this.sortableInstances.length > 0) {
            console.log('🎯 FILTER UPDATE - preserving Sortable, updating cards and counts');
            // Update kanban cards without destroying Sortable instances
            this.updateKanbanCards();
            this.updatePipelineCounts();
        } else {
            console.log('🔄 View re-render (safe - not kanban or first time)');
            this.renderCurrentView();
        }
        this.updateKPIs();
    }

    resetFilters() {
        console.log('🔄 Resetting all filters...');

        // Reset all filter dropdowns to their default values
        document.getElementById('partner-filter').value = '';
        document.getElementById('assignee-filter').value = '';
        document.getElementById('value-filter').value = '';
        document.getElementById('date-filter').value = '';

        // Clear search input
        document.getElementById('search-input').value = '';

        // Apply filters to refresh the view with all opportunities
        this.applyFilters();

        // Show notification
        showNotification('All filters have been reset', 'info');

        console.log('✅ Filters reset successfully');
    }

    sortTable(field) {
        if (this.sortBy === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = field;
            this.sortDirection = 'asc';
        }

        this.filteredOpportunities.sort((a, b) => {
            let valueA = a[field];
            let valueB = b[field];

            // Handle special cases
            if (field === 'partnerName') {
                valueA = this.getPartnerName(a.partnerId);
                valueB = this.getPartnerName(b.partnerId);
            }

            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }

            if (this.sortDirection === 'asc') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });

        this.renderTableView();
        this.updateSortIndicators();
    }

    updateSortIndicators() {
        document.querySelectorAll('.sortable').forEach(header => {
            const icon = header.querySelector('.sort-icon');
            if (header.dataset.sort === this.sortBy) {
                icon.innerHTML = this.sortDirection === 'asc'
                    ? '<use href="#icon-chevron-up"></use>'
                    : '<use href="#icon-chevron-down"></use>';
            } else {
                icon.innerHTML = '<use href="#icon-chevrons-up-down"></use>';
            }
        });
    }

    openOpportunityModal(opportunityId = null) {
        console.log('🚀 Opening opportunity modal:', { opportunityId });

        this.editingOpportunity = opportunityId;
        const modal = document.getElementById('opportunity-modal');
        const form = document.getElementById('opportunity-form');
        const title = document.getElementById('modal-title');
        const saveText = document.getElementById('save-text');

        console.log('📦 Modal elements found:', {
            modal: !!modal,
            form: !!form,
            title: !!title,
            saveText: !!saveText
        });

        if (opportunityId) {
            const opportunity = this.opportunities.find(opp => opp.id === opportunityId);
            console.log('✏️ Editing opportunity:', opportunity);

            if (opportunity) {
                title.textContent = 'Edit Opportunity';
                saveText.textContent = 'Update Opportunity';
                this.populateForm(opportunity);
            }
        } else {
            title.textContent = 'Add New Opportunity';
            saveText.textContent = 'Save Opportunity';
            form.reset();
            document.getElementById('commission-preview').style.display = 'none';
        }

        console.log('👀 Setting modal display to flex...');
        document.body.classList.add('modal-open');
        modal.style.display = 'flex';

        setTimeout(() => {
            const customerName = document.getElementById('customer-name');
            if (customerName) {
                customerName.focus();
            }
        }, 100);

        console.log('✅ Modal should be visible now');
    }

    closeOpportunityModal() {
        document.body.classList.remove('modal-open');
        document.getElementById('opportunity-modal').style.display = 'none';
        this.editingOpportunity = null;
    }

    populateForm(opportunity) {
        document.getElementById('customer-name').value = opportunity.customerName;
        document.getElementById('customer-contact-name').value = opportunity.customerContact?.name || '';
        document.getElementById('customer-email').value = opportunity.customerContact?.email || '';
        document.getElementById('customer-company').value = opportunity.customerContact?.company || '';
        document.getElementById('partner-select').value = opportunity.partnerId;
        document.getElementById('deal-value').value = opportunity.dealValue;
        document.getElementById('stage-select').value = opportunity.stage;
        document.getElementById('probability').value = opportunity.probability;
        document.getElementById('close-date').value = opportunity.expectedCloseDate;
        document.getElementById('assigned-user').value = opportunity.assignedUserId || '';
        document.getElementById('opportunity-notes').value = opportunity.notes || '';

        this.updateCommissionPreview();
    }

    saveOpportunity(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const opportunityData = {
            customerName: formData.get('customerName'),
            customerContact: {
                name: formData.get('contactName'),
                email: formData.get('contactEmail'),
                company: formData.get('contactCompany')
            },
            partnerId: formData.get('partnerId'),
            dealValue: parseFloat(formData.get('dealValue')),
            stage: formData.get('stage'),
            probability: parseInt(formData.get('probability')),
            expectedCloseDate: formData.get('expectedCloseDate'),
            assignedUserId: formData.get('assignedUserId') || null,
            notes: formData.get('notes')
        };

        if (this.editingOpportunity) {
            // Update existing opportunity
            const index = this.opportunities.findIndex(opp => opp.id === this.editingOpportunity);
            if (index !== -1) {
                this.opportunities[index] = {
                    ...this.opportunities[index],
                    ...opportunityData,
                    updatedAt: new Date()
                };
                showNotification('Opportunity updated successfully', 'success');
            }
        } else {
            // Create new opportunity
            const newOpportunity = {
                id: this.generateId(),
                ...opportunityData,
                status: 'open',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            this.opportunities.push(newOpportunity);
            showNotification('Opportunity created successfully', 'success');
        }

        this.closeOpportunityModal();
        this.applyFilters();
        this.updateKPIs();
    }

    editOpportunity(opportunityId) {
        console.log('🖊️ Edit opportunity clicked:', opportunityId);
        this.openOpportunityModal(opportunityId);
    }

    deleteOpportunity(opportunityId) {
        if (confirm('Are you sure you want to delete this opportunity?')) {
            this.opportunities = this.opportunities.filter(opp => opp.id !== opportunityId);
            this.applyFilters();
            this.updateKPIs();
            showNotification('Opportunity deleted', 'info');
        }
    }

    openDetailModal(opportunityId) {
        const opportunity = this.opportunities.find(opp => opp.id === opportunityId);
        if (!opportunity) return;

        const modal = document.getElementById('detail-modal');
        const title = document.getElementById('detail-title');
        const content = document.getElementById('detail-content');

        title.textContent = opportunity.customerName;
        content.innerHTML = this.createDetailContent(opportunity);

        // Bind detail modal actions
        document.getElementById('edit-opportunity').onclick = () => {
            this.closeDetailModal();
            this.editOpportunity(opportunityId);
        };

        document.getElementById('delete-opportunity').onclick = () => {
            this.closeDetailModal();
            this.deleteOpportunity(opportunityId);
        };

        document.body.classList.add('modal-open');
        modal.style.display = 'flex';
    }

    createDetailContent(opportunity) {
        const partner = this.getPartnerName(opportunity.partnerId);
        const assignee = this.getAssigneeName(opportunity.assignedUserId);
        const weightedValue = (opportunity.dealValue * opportunity.probability / 100);

        return `
            <div class="detail-grid">
                <div class="detail-section">
                    <h4>Customer Information</h4>
                    <div class="detail-item">
                        <span class="detail-label">Customer:</span>
                        <span class="detail-value">${opportunity.customerName}</span>
                    </div>
                    ${opportunity.customerContact?.name ? `
                        <div class="detail-item">
                            <span class="detail-label">Contact:</span>
                            <span class="detail-value">${opportunity.customerContact.name}</span>
                        </div>
                    ` : ''}
                    ${opportunity.customerContact?.email ? `
                        <div class="detail-item">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value">${opportunity.customerContact.email}</span>
                        </div>
                    ` : ''}
                    ${opportunity.customerContact?.company ? `
                        <div class="detail-item">
                            <span class="detail-label">Company:</span>
                            <span class="detail-value">${opportunity.customerContact.company}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="detail-section">
                    <h4>Deal Information</h4>
                    <div class="detail-item">
                        <span class="detail-label">Partner:</span>
                        <span class="detail-value">${partner}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Value:</span>
                        <span class="detail-value">${this.formatCurrency(opportunity.dealValue)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Stage:</span>
                        <span class="detail-value">
                            <span class="stage-pill stage-pill--${opportunity.stage}">${this.pipelineStages[opportunity.stage].label}</span>
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Probability:</span>
                        <span class="detail-value">${opportunity.probability}%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Weighted Value:</span>
                        <span class="detail-value">${this.formatCurrency(weightedValue)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Expected Close:</span>
                        <span class="detail-value">${this.formatDate(opportunity.expectedCloseDate)}</span>
                    </div>
                    ${assignee ? `
                        <div class="detail-item">
                            <span class="detail-label">Assigned To:</span>
                            <span class="detail-value">${assignee}</span>
                        </div>
                    ` : ''}
                </div>
            </div>

            ${opportunity.notes ? `
                <div class="detail-section detail-section--full">
                    <h4>Notes</h4>
                    <div class="detail-notes">${opportunity.notes}</div>
                </div>
            ` : ''}

            <div class="detail-section detail-section--full">
                <h4>Commission Information</h4>
                <div class="commission-grid">
                    <div class="commission-card">
                        <div class="commission-label">Estimated Commission</div>
                        <div class="commission-amount">${this.formatCurrency(opportunity.dealValue * 0.05)}</div>
                        <div class="commission-note">5% of deal value</div>
                    </div>
                    <div class="commission-card">
                        <div class="commission-label">Weighted Commission</div>
                        <div class="commission-amount">${this.formatCurrency(weightedValue * 0.05)}</div>
                        <div class="commission-note">Based on ${opportunity.probability}% probability</div>
                    </div>
                </div>
            </div>
        `;
    }

    closeDetailModal() {
        document.body.classList.remove('modal-open');
        document.getElementById('detail-modal').style.display = 'none';
    }

    openForecastModal() {
        const modal = document.getElementById('forecast-modal');
        this.updateForecastData();
        document.body.classList.add('modal-open');
        modal.style.display = 'flex';
    }

    closeForecastModal() {
        document.body.classList.remove('modal-open');
        document.getElementById('forecast-modal').style.display = 'none';
    }

    openPipelineReport() {
        console.log('📊 Opening Pipeline Report...');
        const modal = document.getElementById('pipeline-report-modal');

        // Populate report data
        this.populatePipelineReport();

        document.body.classList.add('modal-open');
        modal.style.display = 'flex';
        showNotification('Pipeline report generated', 'success');
    }

    closePipelineReport() {
        document.body.classList.remove('modal-open');
        document.getElementById('pipeline-report-modal').style.display = 'none';
    }

    populatePipelineReport() {
        console.log('📈 Populating pipeline report data...');

        // Calculate summary metrics
        const totalValue = this.opportunities.reduce((sum, opp) => sum + opp.dealValue, 0);
        const weightedValue = this.opportunities.reduce((sum, opp) => sum + (opp.dealValue * opp.probability / 100), 0);
        const activeCount = this.opportunities.filter(opp => opp.status === 'open').length;
        const avgDealSize = activeCount > 0 ? totalValue / activeCount : 0;

        // Update summary cards
        document.getElementById('report-total-value').textContent = this.formatCurrency(totalValue);
        document.getElementById('report-weighted-value').textContent = this.formatCurrency(weightedValue);
        document.getElementById('report-active-count').textContent = activeCount;
        document.getElementById('report-avg-deal').textContent = this.formatCurrency(avgDealSize);

        // Populate stage breakdown
        this.populateStageBreakdown();

        // Populate partner breakdown
        this.populatePartnerBreakdown();

        // Populate time analysis
        this.populateTimeAnalysis();
    }

    populateStageBreakdown() {
        const stageStats = {};

        // Initialize stage stats
        Object.keys(this.pipelineStages).forEach(stage => {
            stageStats[stage] = {
                count: 0,
                totalValue: 0,
                weightedValue: 0,
                label: this.pipelineStages[stage].label,
                probability: this.pipelineStages[stage].probability
            };
        });

        // Calculate stats for each stage
        this.opportunities.forEach(opp => {
            if (stageStats[opp.stage]) {
                stageStats[opp.stage].count++;
                stageStats[opp.stage].totalValue += opp.dealValue;
                stageStats[opp.stage].weightedValue += (opp.dealValue * opp.probability / 100);
            }
        });

        // Populate table
        const tbody = document.getElementById('stage-breakdown-body');
        tbody.innerHTML = Object.entries(stageStats).map(([stage, stats]) => {
            const avgDeal = stats.count > 0 ? stats.totalValue / stats.count : 0;
            return `
                <tr>
                    <td><strong>${stats.label}</strong></td>
                    <td>${stats.count}</td>
                    <td>${this.formatCurrency(stats.totalValue)}</td>
                    <td>${this.formatCurrency(stats.weightedValue)}</td>
                    <td>${this.formatCurrency(avgDeal)}</td>
                </tr>
            `;
        }).join('');
    }

    populatePartnerBreakdown() {
        const partnerStats = {};

        // Calculate stats for each partner
        this.opportunities.forEach(opp => {
            const partnerName = this.getPartnerName(opp.partnerId);
            if (!partnerStats[partnerName]) {
                partnerStats[partnerName] = {
                    count: 0,
                    totalValue: 0,
                    won: 0,
                    lost: 0
                };
            }

            partnerStats[partnerName].count++;
            partnerStats[partnerName].totalValue += opp.dealValue;

            if (opp.stage === 'closed_won') {
                partnerStats[partnerName].won++;
            } else if (opp.stage === 'closed_lost') {
                partnerStats[partnerName].lost++;
            }
        });

        // Populate table
        const tbody = document.getElementById('partner-breakdown-body');
        tbody.innerHTML = Object.entries(partnerStats).map(([partner, stats]) => {
            const closed = stats.won + stats.lost;
            const winRate = closed > 0 ? ((stats.won / closed) * 100).toFixed(1) : '0.0';
            const avgDeal = stats.count > 0 ? stats.totalValue / stats.count : 0;

            return `
                <tr>
                    <td><strong>${partner}</strong></td>
                    <td>${stats.count}</td>
                    <td>${this.formatCurrency(stats.totalValue)}</td>
                    <td>${winRate}%</td>
                    <td>${this.formatCurrency(avgDeal)}</td>
                </tr>
            `;
        }).join('');
    }

    populateTimeAnalysis() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let thisMonthValue = 0, thisMonthCount = 0;
        let nextMonthValue = 0, nextMonthCount = 0;
        let overdueValue = 0, overdueCount = 0;

        this.opportunities.forEach(opp => {
            const closeDate = new Date(opp.expectedCloseDate);
            const oppMonth = closeDate.getMonth();
            const oppYear = closeDate.getFullYear();

            if (closeDate < now) {
                overdueValue += opp.dealValue;
                overdueCount++;
            } else if (oppYear === currentYear && oppMonth === currentMonth) {
                thisMonthValue += opp.dealValue;
                thisMonthCount++;
            } else if ((oppYear === currentYear && oppMonth === currentMonth + 1) ||
                      (currentMonth === 11 && oppYear === currentYear + 1 && oppMonth === 0)) {
                nextMonthValue += opp.dealValue;
                nextMonthCount++;
            }
        });

        // Update time analysis cards
        document.getElementById('report-this-month').textContent = this.formatCurrency(thisMonthValue);
        document.getElementById('report-this-month-count').textContent = `${thisMonthCount} opportunities`;

        document.getElementById('report-next-month').textContent = this.formatCurrency(nextMonthValue);
        document.getElementById('report-next-month-count').textContent = `${nextMonthCount} opportunities`;

        document.getElementById('report-overdue').textContent = this.formatCurrency(overdueValue);
        document.getElementById('report-overdue-count').textContent = `${overdueCount} opportunities`;
    }

    exportPipelineReport() {
        console.log('📤 Exporting pipeline report...');

        // Generate detailed CSV report
        const reportData = this.generatePipelineReportCSV();
        this.downloadCSV(reportData, 'pipeline-detailed-report.csv');

        showNotification('Pipeline report exported successfully', 'success');
    }

    generatePipelineReportCSV() {
        // Create comprehensive report with multiple sections
        let csv = 'Pipeline Value Report\n\n';

        // Summary section
        csv += 'Executive Summary\n';
        csv += 'Metric,Value\n';
        csv += `Total Pipeline Value,${this.formatCurrency(this.opportunities.reduce((sum, opp) => sum + opp.dealValue, 0))}\n`;
        csv += `Weighted Forecast,${this.formatCurrency(this.opportunities.reduce((sum, opp) => sum + (opp.dealValue * opp.probability / 100), 0))}\n`;
        csv += `Active Opportunities,${this.opportunities.filter(opp => opp.status === 'open').length}\n\n`;

        // Detailed opportunities
        csv += 'Detailed Opportunities\n';
        csv += 'Customer,Partner,Stage,Deal Value,Probability,Expected Close,Assigned To\n';

        this.opportunities.forEach(opp => {
            csv += `"${opp.customerName}","${this.getPartnerName(opp.partnerId)}","${this.pipelineStages[opp.stage].label}","${this.formatCurrency(opp.dealValue)}","${opp.probability}%","${this.formatDate(opp.expectedCloseDate)}","${this.getAssigneeName(opp.assignedUserId)}"\n`;
        });

        return csv;
    }

    updateCommissionPreview() {
        const dealValue = parseFloat(document.getElementById('deal-value').value) || 0;
        const probability = parseInt(document.getElementById('probability').value) || 0;
        const commissionRate = 0.05; // 5%

        const estimatedCommission = dealValue * commissionRate;
        const weightedValue = dealValue * probability / 100;

        document.getElementById('estimated-commission').textContent = this.formatCurrency(estimatedCommission);
        document.getElementById('weighted-value').textContent = this.formatCurrency(weightedValue);

        document.getElementById('commission-preview').style.display = dealValue > 0 ? 'block' : 'none';
    }

    updateKPIs() {
        const totalValue = this.opportunities.reduce((sum, opp) => sum + opp.dealValue, 0);
        const weightedValue = this.opportunities.reduce((sum, opp) => sum + (opp.dealValue * opp.probability / 100), 0);
        const activeCount = this.opportunities.filter(opp => opp.status === 'open').length;
        const closedWon = this.opportunities.filter(opp => opp.stage === 'closed_won').length;
        const totalClosed = this.opportunities.filter(opp => opp.stage === 'closed_won' || opp.stage === 'closed_lost').length;
        const conversionRate = totalClosed > 0 ? (closedWon / totalClosed * 100) : 0;
        const avgDealSize = activeCount > 0 ? totalValue / activeCount : 0;

        // Update KPI displays
        document.getElementById('total-pipeline-value').textContent = this.formatCurrency(totalValue);
        document.getElementById('weighted-forecast').textContent = this.formatCurrency(weightedValue);
        document.getElementById('active-count').textContent = `${activeCount} active opportunities`;
        document.getElementById('conversion-rate').textContent = `${conversionRate.toFixed(1)}%`;
        document.getElementById('avg-deal-size').textContent = this.formatCurrency(avgDealSize);
    }

    updateForecastData() {
        const weightedValue = this.opportunities.reduce((sum, opp) => sum + (opp.dealValue * opp.probability / 100), 0);

        // Scenario calculations (simplified)
        const conservative = weightedValue * 0.7;
        const likely = weightedValue;
        const optimistic = weightedValue * 1.3;

        document.getElementById('conservative-forecast').textContent = this.formatCurrency(conservative);
        document.getElementById('likely-forecast').textContent = this.formatCurrency(likely);
        document.getElementById('optimistic-forecast').textContent = this.formatCurrency(optimistic);
    }

    initializeCharts() {
        console.log('🚀 Initializing all charts...');
        try {
            // Initialize Chart.js charts for analytics view
            this.createVelocityChart();
            this.createFunnelChart();
            this.createForecastChart();
            this.createWinLossChart();
            console.log('✅ All charts initialized successfully');
        } catch (error) {
            console.error('❌ Error in chart initialization:', error);
        }
    }

    createVelocityChart() {
        const ctx = document.getElementById('velocity-chart');
        if (!ctx) {
            console.warn('❌ Velocity chart canvas not found');
            return;
        }

        console.log('📊 Creating velocity chart...');
        try {
            this.velocityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Lead', 'Demo', 'POC', 'Proposal'],
                datasets: [{
                    label: 'Average Days',
                    data: [14, 21, 35, 18],
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
            console.log('✅ Velocity chart created successfully');
        } catch (error) {
            console.error('❌ Error creating velocity chart:', error);
        }
    }

    createFunnelChart() {
        const ctx = document.getElementById('funnel-chart');
        if (!ctx) {
            console.warn('❌ Funnel chart canvas not found');
            return;
        }

        console.log('📊 Creating funnel chart...');
        try {
            this.funnelChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Lead', 'Demo', 'POC', 'Proposal', 'Closed Won'],
                    datasets: [{
                        data: [23, 18, 15, 12, 31],
                        backgroundColor: [
                            '#6b7280',
                            '#3b82f6',
                            '#f59e0b',
                            '#8b5cf6',
                            '#10b981'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
            console.log('✅ Funnel chart created successfully');
        } catch (error) {
            console.error('❌ Error creating funnel chart:', error);
        }
    }

    createForecastChart() {
        const ctx = document.getElementById('forecast-chart');
        if (!ctx) {
            console.warn('❌ Forecast chart canvas not found');
            return;
        }

        console.log('📊 Creating forecast chart...');
        try {
            this.forecastChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Forecast',
                        data: [2.1, 2.8, 3.2, 3.6, 4.1, 4.5],
                        borderColor: 'rgba(59, 130, 246, 1)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Actual',
                        data: [2.0, 2.7, 3.1, 3.4, null, null],
                        borderColor: 'rgba(16, 185, 129, 1)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: false,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    interaction: { intersect: false },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value + 'M';
                                }
                            }
                        }
                    }
                }
            });
            console.log('✅ Forecast chart created successfully');
        } catch (error) {
            console.error('❌ Error creating forecast chart:', error);
        }
    }

    createWinLossChart() {
        const ctx = document.getElementById('winloss-chart');
        if (!ctx) {
            console.warn('❌ Win/Loss chart canvas not found');
            return;
        }

        console.log('📊 Creating win/loss chart...');
        try {
            this.winLossChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Won', 'Lost'],
                    datasets: [{
                        data: [31, 12],
                        backgroundColor: ['#10b981', '#ef4444']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
            console.log('✅ Win/Loss chart created successfully');
        } catch (error) {
            console.error('❌ Error creating win/loss chart:', error);
        }
    }

    updateAnalyticsCharts() {
        console.log('📊 Updating Analytics Charts with data...');

        // Update charts with current filtered data
        if (this.velocityChart) {
            this.updateVelocityChart();
        }
        if (this.funnelChart) {
            this.updateFunnelChart();
        }
        if (this.forecastChart) {
            this.updateForecastChart();
        }
        if (this.winLossChart) {
            this.updateWinLossChart();
        }
    }

    populateAnalyticsData() {
        console.log('📈 Populating Analytics Data...');

        // Calculate and display key analytics metrics
        this.updateAnalyticsKPIs();
        this.updateStageMetrics();
        this.updatePerformanceMetrics();
    }

    updateAnalyticsKPIs() {
        // Pipeline velocity metrics
        const avgDealCycle = this.calculateAverageDealCycle();
        const stageVelocity = this.calculateStageVelocity();

        // Update velocity KPIs in the UI
        const velocityEl = document.getElementById('avg-velocity');
        if (velocityEl) {
            velocityEl.textContent = `${avgDealCycle} days`;
        }

        console.log('✅ Analytics KPIs updated:', { avgDealCycle, stageVelocity });
    }

    updateStageMetrics() {
        // Calculate stage-by-stage metrics
        const stageMetrics = this.pipelineStages;
        Object.keys(stageMetrics).forEach(stage => {
            const stageOpps = this.filteredOpportunities.filter(opp => opp.stage === stage);
            const stageValue = stageOpps.reduce((sum, opp) => sum + opp.dealValue, 0);

            console.log(`Stage ${stage}:`, { count: stageOpps.length, value: stageValue });
        });
    }

    updatePerformanceMetrics() {
        // Win rate calculation
        const closedOpps = this.opportunities.filter(opp =>
            opp.stage === 'closed_won' || opp.stage === 'closed_lost'
        );
        const wonOpps = this.opportunities.filter(opp => opp.stage === 'closed_won');
        const winRate = closedOpps.length > 0 ? (wonOpps.length / closedOpps.length) * 100 : 0;

        // Average deal size
        const avgDealSize = this.opportunities.length > 0
            ? this.opportunities.reduce((sum, opp) => sum + opp.dealValue, 0) / this.opportunities.length
            : 0;

        console.log('📊 Performance metrics:', { winRate: winRate.toFixed(1), avgDealSize });
    }

    calculateAverageDealCycle() {
        // Simple calculation - in real app this would use actual dates
        const stages = Object.keys(this.pipelineStages).length;
        return stages * 14; // Assume 14 days per stage on average
    }

    calculateStageVelocity() {
        // Calculate time spent in each stage
        return {
            lead: 21,
            demo: 14,
            poc: 28,
            proposal: 10,
            closed_won: 7
        };
    }

    updateVelocityChart() {
        if (!this.velocityChart) return;

        const stageVelocity = this.calculateStageVelocity();
        this.velocityChart.data.datasets[0].data = [
            stageVelocity.lead,
            stageVelocity.demo,
            stageVelocity.poc,
            stageVelocity.proposal
        ];
        this.velocityChart.update();
        console.log('✅ Velocity chart updated');
    }

    updateFunnelChart() {
        if (!this.funnelChart) return;

        // Calculate opportunities in each stage
        const stageCounts = {
            lead: this.filteredOpportunities.filter(opp => opp.stage === 'lead').length,
            demo: this.filteredOpportunities.filter(opp => opp.stage === 'demo').length,
            poc: this.filteredOpportunities.filter(opp => opp.stage === 'poc').length,
            proposal: this.filteredOpportunities.filter(opp => opp.stage === 'proposal').length,
            closed_won: this.filteredOpportunities.filter(opp => opp.stage === 'closed_won').length
        };

        this.funnelChart.data.datasets[0].data = [
            stageCounts.lead,
            stageCounts.demo,
            stageCounts.poc,
            stageCounts.proposal,
            stageCounts.closed_won
        ];
        this.funnelChart.update();
        console.log('✅ Funnel chart updated', stageCounts);
    }

    updateForecastChart() {
        if (!this.forecastChart) return;

        // Simple forecast calculation
        const monthlyValues = [2.1, 2.4, 2.8, 3.2, 3.4, 3.7]; // Sample data
        this.forecastChart.data.datasets[0].data = monthlyValues;
        this.forecastChart.update();
        console.log('✅ Forecast chart updated');
    }

    updateWinLossChart() {
        if (!this.winLossChart) return;

        const wonCount = this.opportunities.filter(opp => opp.stage === 'closed_won').length;
        const lostCount = this.opportunities.filter(opp => opp.stage === 'closed_lost').length || 3; // Default some lost deals

        this.winLossChart.data.datasets[0].data = [wonCount, lostCount];
        this.winLossChart.update();
        console.log('✅ Win/Loss chart updated:', { won: wonCount, lost: lostCount });
    }

    exportPipeline() {
        // Generate CSV export
        const csvContent = this.generateCSV();
        this.downloadCSV(csvContent, 'pipeline-export.csv');
        showNotification('Pipeline exported successfully', 'success');
    }

    generateCSV() {
        const headers = ['Customer', 'Partner', 'Value', 'Stage', 'Probability', 'Close Date', 'Assigned To'];
        const rows = this.opportunities.map(opp => [
            opp.customerName,
            this.getPartnerName(opp.partnerId),
            opp.dealValue,
            this.pipelineStages[opp.stage].label,
            opp.probability,
            opp.expectedCloseDate,
            this.getAssigneeName(opp.assignedUserId) || 'Unassigned'
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Utility methods
    generateId() {
        return 'opp_' + Math.random().toString(36).substr(2, 9);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getDaysToClose(dateString) {
        const closeDate = new Date(dateString);
        const now = new Date();
        const diffTime = closeDate - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getPartnerName(partnerId) {
        const partners = {
            cloudtech: 'CloudTech Solutions',
            dataflow: 'DataFlow Systems',
            techflow: 'TechFlow Partners',
            securedata: 'SecureData Inc',
            devops: 'DevOps Pro'
        };
        return partners[partnerId] || 'Unknown Partner';
    }

    getAssigneeName(assigneeId) {
        const assignees = {
            sarah: 'Sarah Chen',
            mike: 'Mike Rodriguez',
            alex: 'Alex Kumar',
            jennifer: 'Jennifer Park'
        };
        return assignees[assigneeId] || null;
    }

    loadSampleData() {
        // Load sample opportunities for demonstration
        this.opportunities = [
            {
                id: 'opp_001',
                customerName: 'Enterprise Corp',
                customerContact: {
                    name: 'John Smith',
                    email: 'john.smith@enterprise.com',
                    company: 'Enterprise Corp'
                },
                partnerId: 'cloudtech',
                dealValue: 485000,
                stage: 'proposal',
                probability: 75,
                expectedCloseDate: '2024-12-15',
                assignedUserId: 'sarah',
                notes: 'Large enterprise deal with strong technical fit. Decision maker approved budget.',
                status: 'open',
                createdAt: new Date('2024-10-01'),
                updatedAt: new Date('2024-11-15')
            },
            {
                id: 'opp_002',
                customerName: 'FinTech Innovations',
                customerContact: {
                    name: 'Maria Garcia',
                    email: 'maria@fintech.com',
                    company: 'FinTech Innovations'
                },
                partnerId: 'dataflow',
                dealValue: 320000,
                stage: 'poc',
                probability: 50,
                expectedCloseDate: '2025-01-30',
                assignedUserId: 'mike',
                notes: 'POC in progress. Strong technical validation needed.',
                status: 'open',
                createdAt: new Date('2024-09-15'),
                updatedAt: new Date('2024-11-10')
            },
            {
                id: 'opp_003',
                customerName: 'Global Manufacturing',
                customerContact: {
                    name: 'David Johnson',
                    email: 'david@globalmanuf.com',
                    company: 'Global Manufacturing Inc'
                },
                partnerId: 'techflow',
                dealValue: 275000,
                stage: 'demo',
                probability: 25,
                expectedCloseDate: '2025-02-15',
                assignedUserId: 'alex',
                notes: 'Initial demo scheduled. Need to address integration concerns.',
                status: 'open',
                createdAt: new Date('2024-11-01'),
                updatedAt: new Date('2024-11-05')
            },
            // Lead stage opportunities
            {
                id: 'opp_004',
                customerName: 'StartupTech Inc',
                customerContact: { name: 'Lisa Park', email: 'lisa@startuptech.com', company: 'StartupTech Inc' },
                partnerId: 'cloudtech',
                dealValue: 45000,
                stage: 'lead',
                probability: 10,
                expectedCloseDate: '2025-03-20',
                assignedUserId: 'sarah',
                status: 'open',
                createdAt: new Date('2024-11-20'),
                updatedAt: new Date('2024-11-20')
            },
            {
                id: 'opp_005',
                customerName: 'Global Retail Corp',
                customerContact: { name: 'Mike Chen', email: 'mike@globalretail.com', company: 'Global Retail Corp' },
                partnerId: 'dataflow',
                dealValue: 380000,
                stage: 'lead',
                probability: 10,
                expectedCloseDate: '2025-04-15',
                assignedUserId: 'alex',
                status: 'open',
                createdAt: new Date('2024-11-18'),
                updatedAt: new Date('2024-11-18')
            },
            {
                id: 'opp_006',
                customerName: 'Healthcare Systems Ltd',
                customerContact: { name: 'Dr. Sarah Wilson', email: 'sarah@healthsys.com', company: 'Healthcare Systems Ltd' },
                partnerId: 'securedata',
                dealValue: 620000,
                stage: 'lead',
                probability: 10,
                expectedCloseDate: '2025-05-10',
                assignedUserId: 'jennifer',
                status: 'open',
                createdAt: new Date('2024-11-15'),
                updatedAt: new Date('2024-11-15')
            },
            {
                id: 'opp_007',
                customerName: 'Financial Services Group',
                customerContact: { name: 'Robert Kim', email: 'robert@finservices.com', company: 'Financial Services Group' },
                partnerId: 'techflow',
                dealValue: 155000,
                stage: 'lead',
                probability: 10,
                expectedCloseDate: '2025-03-30',
                assignedUserId: 'mike',
                status: 'open',
                createdAt: new Date('2024-11-10'),
                updatedAt: new Date('2024-11-10')
            },
            // More demo stage opportunities
            {
                id: 'opp_008',
                customerName: 'Manufacturing Plus',
                customerContact: { name: 'Tom Anderson', email: 'tom@mfgplus.com', company: 'Manufacturing Plus' },
                partnerId: 'devops',
                dealValue: 290000,
                stage: 'demo',
                probability: 25,
                expectedCloseDate: '2025-02-28',
                assignedUserId: 'alex',
                status: 'open',
                createdAt: new Date('2024-10-15'),
                updatedAt: new Date('2024-11-01')
            },
            {
                id: 'opp_009',
                customerName: 'Tech Innovations LLC',
                customerContact: { name: 'Emma Davis', email: 'emma@techinno.com', company: 'Tech Innovations LLC' },
                partnerId: 'cloudtech',
                dealValue: 185000,
                stage: 'demo',
                probability: 25,
                expectedCloseDate: '2025-03-15',
                assignedUserId: 'sarah',
                status: 'open',
                createdAt: new Date('2024-10-20'),
                updatedAt: new Date('2024-11-05')
            },
            {
                id: 'opp_010',
                customerName: 'Logistics Corp',
                customerContact: { name: 'James Wilson', email: 'james@logistics.com', company: 'Logistics Corp' },
                partnerId: 'dataflow',
                dealValue: 410000,
                stage: 'demo',
                probability: 25,
                expectedCloseDate: '2025-02-20',
                assignedUserId: 'mike',
                status: 'open',
                createdAt: new Date('2024-10-25'),
                updatedAt: new Date('2024-11-08')
            },
            // More POC stage opportunities
            {
                id: 'opp_011',
                customerName: 'Energy Solutions Inc',
                customerContact: { name: 'Anna Martinez', email: 'anna@energysol.com', company: 'Energy Solutions Inc' },
                partnerId: 'techflow',
                dealValue: 750000,
                stage: 'poc',
                probability: 50,
                expectedCloseDate: '2025-01-25',
                assignedUserId: 'jennifer',
                status: 'open',
                createdAt: new Date('2024-09-10'),
                updatedAt: new Date('2024-10-20')
            },
            {
                id: 'opp_012',
                customerName: 'Media Group International',
                customerContact: { name: 'Chris Taylor', email: 'chris@mediagroup.com', company: 'Media Group International' },
                partnerId: 'securedata',
                dealValue: 340000,
                stage: 'poc',
                probability: 50,
                expectedCloseDate: '2025-02-10',
                assignedUserId: 'sarah',
                status: 'open',
                createdAt: new Date('2024-09-20'),
                updatedAt: new Date('2024-10-25')
            },
            {
                id: 'opp_013',
                customerName: 'Educational Systems',
                customerContact: { name: 'Dr. Linda Brown', email: 'linda@edusys.com', company: 'Educational Systems' },
                partnerId: 'cloudtech',
                dealValue: 225000,
                stage: 'poc',
                probability: 50,
                expectedCloseDate: '2025-01-15',
                assignedUserId: 'alex',
                status: 'open',
                createdAt: new Date('2024-09-05'),
                updatedAt: new Date('2024-10-15')
            },
            // More proposal stage opportunities
            {
                id: 'opp_014',
                customerName: 'Insurance Leaders',
                customerContact: { name: 'Kevin Zhang', email: 'kevin@insuranceleaders.com', company: 'Insurance Leaders' },
                partnerId: 'dataflow',
                dealValue: 890000,
                stage: 'proposal',
                probability: 75,
                expectedCloseDate: '2024-12-20',
                assignedUserId: 'mike',
                status: 'open',
                createdAt: new Date('2024-08-15'),
                updatedAt: new Date('2024-11-01')
            },
            {
                id: 'opp_015',
                customerName: 'Real Estate Solutions',
                customerContact: { name: 'Sophie Johnson', email: 'sophie@realestate.com', company: 'Real Estate Solutions' },
                partnerId: 'techflow',
                dealValue: 445000,
                stage: 'proposal',
                probability: 75,
                expectedCloseDate: '2024-12-30',
                assignedUserId: 'jennifer',
                status: 'open',
                createdAt: new Date('2024-08-20'),
                updatedAt: new Date('2024-10-28')
            },
            // Closed won opportunities
            {
                id: 'opp_016',
                customerName: 'Enterprise Solutions Group',
                customerContact: { name: 'Mark Thompson', email: 'mark@enterprisesol.com', company: 'Enterprise Solutions Group' },
                partnerId: 'cloudtech',
                dealValue: 1200000,
                stage: 'closed_won',
                probability: 100,
                expectedCloseDate: '2024-11-15',
                assignedUserId: 'sarah',
                status: 'closed',
                createdAt: new Date('2024-07-01'),
                updatedAt: new Date('2024-11-15')
            },
            {
                id: 'opp_017',
                customerName: 'Government Services',
                customerContact: { name: 'Patricia Lee', email: 'patricia@govservices.com', company: 'Government Services' },
                partnerId: 'securedata',
                dealValue: 850000,
                stage: 'closed_won',
                probability: 100,
                expectedCloseDate: '2024-10-30',
                assignedUserId: 'alex',
                status: 'closed',
                createdAt: new Date('2024-06-15'),
                updatedAt: new Date('2024-10-30')
            },
            {
                id: 'opp_018',
                customerName: 'Transportation Network',
                customerContact: { name: 'Daniel Rodriguez', email: 'daniel@transport.com', company: 'Transportation Network' },
                partnerId: 'dataflow',
                dealValue: 675000,
                stage: 'closed_won',
                probability: 100,
                expectedCloseDate: '2024-11-01',
                assignedUserId: 'mike',
                status: 'closed',
                createdAt: new Date('2024-06-20'),
                updatedAt: new Date('2024-11-01')
            },
            {
                id: 'opp_019',
                customerName: 'Consulting Partners',
                customerContact: { name: 'Rachel Green', email: 'rachel@consulting.com', company: 'Consulting Partners' },
                partnerId: 'devops',
                dealValue: 390000,
                stage: 'closed_won',
                probability: 100,
                expectedCloseDate: '2024-10-15',
                assignedUserId: 'jennifer',
                status: 'closed',
                createdAt: new Date('2024-05-10'),
                updatedAt: new Date('2024-10-15')
            },
            {
                id: 'opp_020',
                customerName: 'Retail Chain Systems',
                customerContact: { name: 'Andrew Miller', email: 'andrew@retailchain.com', company: 'Retail Chain Systems' },
                partnerId: 'techflow',
                dealValue: 520000,
                stage: 'closed_won',
                probability: 100,
                expectedCloseDate: '2024-09-30',
                assignedUserId: 'sarah',
                status: 'closed',
                createdAt: new Date('2024-05-15'),
                updatedAt: new Date('2024-09-30')
            }
        ];

        this.filteredOpportunities = [...this.opportunities];
    }
}

// Initialize the opportunity manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 DEBUG: DOM Content Loaded');
    window.opportunityManager = new OpportunityManager();
    console.log('🔧 DEBUG: OpportunityManager created');
    window.opportunityManager.init();
    console.log('🔧 DEBUG: OpportunityManager initialized');

    // Ensure counts are calculated after all initialization is complete
    setTimeout(() => {
        console.log('🔧 DEBUG: Timeout executing - checking if manager and method exist');
        if (window.opportunityManager && window.opportunityManager.updatePipelineCounts) {
            console.log('🔧 DEBUG: Calling updatePipelineCounts from timeout');
            window.opportunityManager.updatePipelineCounts();
        } else {
            console.log('🔧 DEBUG: Manager or method not available:', {
                manager: !!window.opportunityManager,
                method: !!(window.opportunityManager && window.opportunityManager.updatePipelineCounts)
            });
        }
    }, 300);
});