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

-- Create indexes
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_assigned_user ON opportunities(assigned_user_id);

-- Insert sample data
INSERT INTO users (id, email, password_hash, first_name, last_name, role)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'vp@partman.com', '$2b$10$hash', 'John', 'Smith', 'vp');