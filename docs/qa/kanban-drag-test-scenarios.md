# Kanban Drag & Drop Test Scenarios

## Test Case: KBN-001 - Basic Drag Count Update

**Given**: Kanban board is loaded with sample data
**When**: User drags opportunity card from Lead column to Demo column
**Then**:
- Lead column count decreases by 1
- Lead column value decreases by opportunity's deal value
- Demo column count increases by 1
- Demo column value increases by opportunity's deal value
- Total pipeline count remains unchanged
- Total pipeline value remains unchanged

## Test Case: KBN-002 - Empty Column Display

**Given**: Kanban board with opportunities in Lead column
**When**: User drags all opportunity cards out of Lead column
**Then**:
- Lead column shows count: 0
- Lead column shows value: $0
- Lead column remains visually empty
- Other columns reflect correct increases

## Test Case: KBN-003 - Filter Preservation on Drag

**Given**: User has applied Partner filter to show subset of opportunities
**When**: User drags filtered opportunity from POC to Proposal
**Then**:
- Only filtered opportunities are counted in headers
- POC count decreases by 1 (filtered count)
- Proposal count increases by 1 (filtered count)
- Filter remains active and preserved
- Unfiltered opportunities are not included in counts

## Test Case: KBN-004 - Currency Formatting

**Given**: Opportunity with deal value $1,250,000
**When**: User drags opportunity between columns
**Then**:
- Values display as currency without decimals (e.g., "$1,250,000")
- No decimal places shown (e.g., not "$1,250,000.00")
- Commas used as thousands separators
- Dollar sign prefix present

## Test Case: KBN-005 - Multiple Rapid Drags

**Given**: Kanban board with multiple opportunities
**When**: User performs 5 rapid drag operations between different columns
**Then**:
- All count updates are accurate after each drag
- No count calculation errors or race conditions
- Final counts match actual card distribution
- No DOM re-rendering of existing cards

## Test Case: KBN-006 - Page Load Initial State

**Given**: Browser loads opportunities-enterprise.html for first time
**When**: Page finishes loading and JavaScript initializes
**Then**:
- All column counts match actual data (not hardcoded HTML values)
- All column values accurately reflect sum of opportunities in each stage
- No "undefined" or "NaN" values displayed
- Counts update immediately without user interaction

## Test Case: KBN-007 - Stage Mapping Validation

**Given**: Kanban board with all column types
**When**: User drags opportunities to each possible column
**Then**:
- lead-column maps to 'lead' stage with 10% probability
- demo-column maps to 'demo' stage with 25% probability
- poc-column maps to 'poc' stage with 50% probability
- proposal-column maps to 'proposal' stage with 75% probability
- won-column maps to 'closed_won' stage with 100% probability

## Test Case: KBN-008 - Same Column Drag (No-Op)

**Given**: Opportunity card in Demo column
**When**: User drags card within same Demo column (reorder)
**Then**:
- Demo column count remains unchanged
- Demo column value remains unchanged
- No updateOpportunityModel() call made
- Console logs "Same column - no update needed"

## Performance Requirements

- Count updates must complete within 100ms of drag operation
- No visible delay in count/value updates
- No DOM re-rendering of opportunity cards
- Sortable instances never re-initialized after first load

## Acceptance Criteria Summary

✅ **PASS Criteria:**
- All counts accurate after any drag operation
- Empty columns show 0 and $0
- Filters preserved during drag operations
- Currency formatted per Intl.NumberFormat spec
- No card DOM re-rendering
- Initial load shows calculated (not hardcoded) values

⚠️ **Current Issues:**
- HTML hardcoded values don't match data
- Timing race condition on initial load
- Debug logging needs cleanup