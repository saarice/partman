-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('vp', 'sales_manager', 'partnership_manager', 'team_member')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Partners table
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(50) NOT NULL CHECK (domain IN ('finops', 'security', 'observability', 'devops', 'data')),
  website VARCHAR(255),
  primary_contact_name VARCHAR(255) NOT NULL,
  primary_contact_email VARCHAR(255) NOT NULL,
  primary_contact_phone VARCHAR(50),
  relationship_health_score INTEGER DEFAULT 50 CHECK (relationship_health_score >= 0 AND relationship_health_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Commission structures table
CREATE TABLE commission_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('referral', 'reseller', 'msp', 'custom')),
  percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  minimum_deal_size DECIMAL(12,2),
  maximum_deal_size DECIMAL(12,2),
  is_default BOOLEAN DEFAULT false,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Opportunities table
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  customer_id UUID NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  partner_id UUID NOT NULL REFERENCES partners(id),
  assigned_user_id UUID NOT NULL REFERENCES users(id),
  stage VARCHAR(50) NOT NULL CHECK (stage IN ('lead', 'demo', 'poc', 'proposal', 'closed_won', 'closed_lost')),
  value DECIMAL(12,2) NOT NULL CHECK (value >= 0),
  probability INTEGER NOT NULL CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Opportunity stage history table
CREATE TABLE opportunity_stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  stage VARCHAR(50) NOT NULL,
  previous_stage VARCHAR(50),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  changed_by UUID NOT NULL REFERENCES users(id),
  notes TEXT
);

-- Weekly status table
CREATE TABLE weekly_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  week_starting DATE NOT NULL,
  accomplishments TEXT NOT NULL,
  upcoming_tasks TEXT NOT NULL,
  blockers TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_late BOOLEAN DEFAULT false,
  UNIQUE(user_id, week_starting)
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  category VARCHAR(20) NOT NULL CHECK (category IN ('opportunity', 'partner', 'administrative', 'personal')),
  opportunity_id UUID REFERENCES opportunities(id),
  partner_id UUID REFERENCES partners(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alerts table
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL CHECK (type IN ('opportunity', 'partner', 'goal', 'task', 'commission')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  entity_id UUID,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_assigned_user ON opportunities(assigned_user_id);
CREATE INDEX idx_opportunities_partner ON opportunities(partner_id);
CREATE INDEX idx_opportunities_expected_close ON opportunities(expected_close_date);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_alerts_user_acknowledged ON alerts(user_id, is_acknowledged);
CREATE INDEX idx_weekly_status_user_week ON weekly_status(user_id, week_starting);
CREATE INDEX idx_opportunity_stage_history_opportunity ON opportunity_stage_history(opportunity_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commission_structures_updated_at BEFORE UPDATE ON commission_structures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();