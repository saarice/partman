-- Migration: Initial Schema
-- Created: 2025-10-18
-- Description: Creates core tables for partnership management platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('system_owner', 'vp', 'sales_manager', 'partnership_manager', 'team_member')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Partners table
CREATE TABLE IF NOT EXISTS partners (
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
CREATE TABLE IF NOT EXISTS commission_structures (
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
CREATE TABLE IF NOT EXISTS opportunities (
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

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_assigned_user ON opportunities(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_partner ON opportunities(partner_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Create comments for documentation
COMMENT ON TABLE users IS 'Platform users with role-based access';
COMMENT ON TABLE partners IS 'Partner organizations in the ecosystem';
COMMENT ON TABLE commission_structures IS 'Commission rates and structures for partners';
COMMENT ON TABLE opportunities IS 'Sales opportunities managed through partners';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for authentication';
