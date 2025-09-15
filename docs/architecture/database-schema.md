# Database Schema

```sql
-- Configuration-first multi-tenant database schema

-- Organizations (Tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    max_users INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuration management (core of the system)
CREATE TABLE configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- 'organization', 'team', 'revenue', 'commission', 'pipeline'
    key VARCHAR(255) NOT NULL,
    value JSONB NOT NULL,
    default_value JSONB,
    data_type VARCHAR(50) NOT NULL, -- 'string', 'number', 'boolean', 'object', 'array'
    is_required BOOLEAN DEFAULT false,
    validation_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(organization_id, category, key)
);

-- Users with configurable roles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL, -- Configurable: 'vp', 'sales_manager', 'partnership_manager'
    permissions JSONB DEFAULT '{}',
    personal_settings JSONB DEFAULT '{}',
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(organization_id, email)
);

-- Partners with flexible commission structures
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(100) NOT NULL, -- Configurable domains
    website VARCHAR(500),
    commission_structure JSONB NOT NULL, -- Flexible commission configuration
    relationship_health INTEGER DEFAULT 50, -- 0-100 calculated score
    primary_contact JSONB DEFAULT '{}',
    agreement_details JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunities with configurable pipeline stages
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_contact JSONB DEFAULT '{}',
    deal_value DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    stage VARCHAR(100) NOT NULL, -- Configurable pipeline stages
    probability INTEGER DEFAULT 10, -- 0-100
    expected_close_date DATE NOT NULL,
    actual_close_date DATE,
    commission_details JSONB DEFAULT '{}',
    notes TEXT,
    attachments JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunity stage history for auditing
CREATE TABLE opportunity_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    from_stage VARCHAR(100),
    to_stage VARCHAR(100) NOT NULL,
    changed_by_user_id UUID REFERENCES users(id),
    change_reason TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partner interactions for relationship health
CREATE TABLE partner_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(100) NOT NULL, -- 'meeting', 'call', 'email', 'event'
    description TEXT,
    interaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weekly status submissions
CREATE TABLE weekly_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_ending DATE NOT NULL,
    accomplishments JSONB DEFAULT '[]',
    upcoming_tasks JSONB DEFAULT '[]',
    blockers JSONB DEFAULT '[]',
    kpi_data JSONB DEFAULT '{}',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(organization_id, user_id, week_ending)
);

-- Task management with rollover
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quarterly goals with configurable targets
CREATE TABLE quarterly_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for org-wide goals
    quarter INTEGER NOT NULL, -- 1, 2, 3, 4
    year INTEGER NOT NULL,
    goal_type VARCHAR(100) NOT NULL, -- Configurable: 'revenue', 'opportunities', 'partners'
    target_value DECIMAL(15,2) NOT NULL,
    current_value DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(organization_id, user_id, quarter, year, goal_type)
);

-- Alerts and notifications
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for org-wide alerts
    alert_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL, -- 'opportunity', 'partner', 'goal', 'task'
    entity_id UUID,
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'acknowledged', 'resolved'
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance optimization
CREATE INDEX idx_organizations_subdomain ON organizations(subdomain);
CREATE INDEX idx_configurations_org_category ON configurations(organization_id, category);
CREATE INDEX idx_users_org_email ON users(organization_id, email);
CREATE INDEX idx_partners_org_domain ON partners(organization_id, domain);
CREATE INDEX idx_opportunities_org_stage ON opportunities(organization_id, stage);
CREATE INDEX idx_opportunities_partner ON opportunities(partner_id);
CREATE INDEX idx_opportunities_assigned_user ON opportunities(assigned_user_id);
CREATE INDEX idx_opportunity_history_opp_id ON opportunity_stage_history(opportunity_id);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_alerts_user_status ON alerts(user_id, status);
CREATE INDEX idx_weekly_status_user_week ON weekly_status(user_id, week_ending);

-- Row Level Security for multi-tenant isolation
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarterly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (to be completed in implementation)
-- CREATE POLICY tenant_isolation_users ON users
--   FOR ALL TO authenticated
--   USING (organization_id = current_setting('app.current_organization_id')::uuid);
```
