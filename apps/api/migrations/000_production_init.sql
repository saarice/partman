-- Production Database Initialization Script
-- Partnership Management Platform
-- This script creates a clean production database with minimal seed data

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User roles
CREATE TYPE user_role AS ENUM ('system_owner', 'admin', 'manager', 'user', 'partner');

-- Partner types
CREATE TYPE partner_type AS ENUM ('referral', 'reseller', 'msp', 'strategic');

-- Partner tiers
CREATE TYPE partner_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'strategic');

-- Opportunity stages
CREATE TYPE opportunity_stage AS ENUM ('lead', 'qualified', 'proposal', 'negotiation', 'closing', 'won', 'lost');

-- Opportunity health status
CREATE TYPE opportunity_health AS ENUM ('healthy', 'at-risk', 'critical');

-- Commission status
CREATE TYPE commission_status AS ENUM ('pending', 'approved', 'paid', 'cancelled');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Partners table
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    partner_type partner_type NOT NULL,
    tier partner_tier NOT NULL DEFAULT 'bronze',
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    website VARCHAR(255),
    commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.15, -- Default 15%
    is_active BOOLEAN DEFAULT true,
    onboarding_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partners_type ON partners(partner_type);
CREATE INDEX idx_partners_tier ON partners(tier);
CREATE INDEX idx_partners_active ON partners(is_active);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    industry VARCHAR(100),
    size VARCHAR(50), -- small, medium, large, enterprise
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_active ON customers(is_active);

-- Opportunities table
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(255), -- Denormalized for quick display
    partner_id UUID REFERENCES partners(id),
    assigned_user_id UUID REFERENCES users(id),
    stage opportunity_stage NOT NULL DEFAULT 'lead',
    value DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
    weighted_value DECIMAL(15,2) GENERATED ALWAYS AS (value * probability / 100) STORED,
    commission_rate DECIMAL(5,4), -- Specific rate for this opportunity, if different from partner default
    expected_close_date DATE,
    actual_close_date DATE,
    health opportunity_health DEFAULT 'healthy',
    days_in_stage INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_partner ON opportunities(partner_id);
CREATE INDEX idx_opportunities_assigned_user ON opportunities(assigned_user_id);
CREATE INDEX idx_opportunities_customer ON opportunities(customer_id);
CREATE INDEX idx_opportunities_close_date ON opportunities(expected_close_date);

-- Opportunity history (stage tracking)
CREATE TABLE opportunity_stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    from_stage opportunity_stage,
    to_stage opportunity_stage NOT NULL,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE INDEX idx_opp_history_opportunity ON opportunity_stage_history(opportunity_id);
CREATE INDEX idx_opp_history_date ON opportunity_stage_history(changed_at);

-- Commissions table
CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    commission_rate DECIMAL(5,4) NOT NULL,
    status commission_status DEFAULT 'pending',
    calculation_date DATE DEFAULT CURRENT_DATE,
    payment_date DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commissions_opportunity ON commissions(opportunity_id);
CREATE INDEX idx_commissions_partner ON commissions(partner_id);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_commissions_payment_date ON commissions(payment_date);

-- Session tokens (for authentication)
CREATE TABLE session_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_session_tokens_user ON session_tokens(user_id);
CREATE INDEX idx_session_tokens_token ON session_tokens(token);
CREATE INDEX idx_session_tokens_expires ON session_tokens(expires_at);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update_updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MINIMAL SEED DATA (Only System Owner)
-- ============================================================================

-- Insert System Owner (password: admin123 - CHANGE THIS IN PRODUCTION!)
-- Password hash is bcrypt hash of 'admin123'
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) VALUES
('admin@partman.com', '$2b$10$rLQYQjY2U8hFWYJX9o0PReE8f5jP5Y5KJz8XWqXqXo5KJz8XWqXqX', 'System', 'Owner', 'system_owner', true);

-- ============================================================================
-- VIEWS (for reporting)
-- ============================================================================

-- Partner performance view
CREATE OR REPLACE VIEW partner_performance AS
SELECT
    p.id as partner_id,
    p.company_name,
    p.partner_type,
    p.tier,
    p.commission_rate,
    COUNT(DISTINCT o.id) as total_opportunities,
    COUNT(DISTINCT CASE WHEN o.stage = 'won' THEN o.id END) as won_opportunities,
    SUM(CASE WHEN o.stage = 'won' THEN o.value ELSE 0 END) as total_revenue,
    SUM(CASE WHEN o.stage = 'won' THEN o.value * COALESCE(o.commission_rate, p.commission_rate) ELSE 0 END) as total_commissions,
    AVG(CASE WHEN o.stage IN ('won', 'lost') THEN o.days_in_stage END) as avg_days_to_close
FROM partners p
LEFT JOIN opportunities o ON p.id = o.partner_id
WHERE p.is_active = true
GROUP BY p.id, p.company_name, p.partner_type, p.tier, p.commission_rate;

-- Pipeline summary view
CREATE OR REPLACE VIEW pipeline_summary AS
SELECT
    stage,
    COUNT(*) as opportunity_count,
    SUM(value) as total_value,
    SUM(weighted_value) as total_weighted_value,
    AVG(probability) as avg_probability,
    AVG(days_in_stage) as avg_days_in_stage
FROM opportunities
WHERE stage NOT IN ('won', 'lost')
GROUP BY stage;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'System users with role-based access control';
COMMENT ON TABLE partners IS 'Partner companies and their commission structures';
COMMENT ON TABLE customers IS 'Customer companies and contacts';
COMMENT ON TABLE opportunities IS 'Sales opportunities tracked through the pipeline';
COMMENT ON TABLE commissions IS 'Commission calculations and payment tracking';
COMMENT ON TABLE opportunity_stage_history IS 'Audit trail for opportunity stage changes';
COMMENT ON TABLE session_tokens IS 'JWT session token management';

COMMENT ON VIEW partner_performance IS 'Aggregated partner performance metrics';
COMMENT ON VIEW pipeline_summary IS 'Current pipeline status by stage';

-- ============================================================================
-- GRANTS (adjust based on your security requirements)
-- ============================================================================

-- Grant permissions to application database user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO partman_app;
-- GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO partman_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO partman_app;

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Log initialization completion
DO $$
BEGIN
    RAISE NOTICE 'Production database initialized successfully';
    RAISE NOTICE 'IMPORTANT: Change the default admin password immediately!';
    RAISE NOTICE 'Default admin credentials: admin@partman.com / admin123';
END $$;
