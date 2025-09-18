-- Partnership Management Platform - Sample Data
-- Migration 002: Insert sample data for development and testing

-- Insert sample users
INSERT INTO users (id, email, first_name, last_name, role, organization_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'vp@partnership.com', 'John', 'Smith', 'vp', '123e4567-e89b-12d3-a456-426614174000'),
    ('550e8400-e29b-41d4-a716-446655440001', 'sarah.johnson@partnership.com', 'Sarah', 'Johnson', 'user', '123e4567-e89b-12d3-a456-426614174000'),
    ('550e8400-e29b-41d4-a716-446655440002', 'mike.chen@partnership.com', 'Mike', 'Chen', 'user', '123e4567-e89b-12d3-a456-426614174000'),
    ('550e8400-e29b-41d4-a716-446655440003', 'emily.davis@partnership.com', 'Emily', 'Davis', 'user', '123e4567-e89b-12d3-a456-426614174000')
ON CONFLICT (email) DO NOTHING;

-- Insert sample partners
INSERT INTO partners (id, organization_id, name, relationship_health_score, commission_structure) VALUES
    ('660f9511-f3ab-52e5-b827-557766551111', '123e4567-e89b-12d3-a456-426614174000', 'ACME Corp', 85, '{"rate": 15, "type": "percentage"}'),
    ('660f9511-f3ab-52e5-b827-557766551112', '123e4567-e89b-12d3-a456-426614174000', 'TechStart Inc', 92, '{"rate": 12, "type": "percentage"}'),
    ('660f9511-f3ab-52e5-b827-557766551113', '123e4567-e89b-12d3-a456-426614174000', 'Global Solutions', 67, '{"rate": 18, "type": "percentage"}'),
    ('660f9511-f3ab-52e5-b827-557766551114', '123e4567-e89b-12d3-a456-426614174000', 'Innovation Labs', 78, '{"rate": 14, "type": "percentage"}'),
    ('660f9511-f3ab-52e5-b827-557766551115', '123e4567-e89b-12d3-a456-426614174000', 'Enterprise Systems', 88, '{"rate": 16, "type": "percentage"}')
ON CONFLICT (id) DO NOTHING;

-- Insert sample opportunities
INSERT INTO opportunities (id, organization_id, partner_id, assigned_user_id, title, value, stage, probability, expected_close_date) VALUES
    ('770a0622-a4bc-63f6-c938-668877662222', '123e4567-e89b-12d3-a456-426614174000', '660f9511-f3ab-52e5-b827-557766551111', '550e8400-e29b-41d4-a716-446655440001', 'Enterprise CRM Integration', 125000, 'demo', 35, '2025-10-15'),
    ('770a0622-a4bc-63f6-c938-668877662223', '123e4567-e89b-12d3-a456-426614174000', '660f9511-f3ab-52e5-b827-557766551112', '550e8400-e29b-41d4-a716-446655440002', 'Cloud Migration Project', 85000, 'poc', 65, '2025-09-30'),
    ('770a0622-a4bc-63f6-c938-668877662224', '123e4567-e89b-12d3-a456-426614174000', '660f9511-f3ab-52e5-b827-557766551113', '550e8400-e29b-41d4-a716-446655440003', 'Digital Transformation', 200000, 'proposal', 80, '2025-11-20'),
    ('770a0622-a4bc-63f6-c938-668877662225', '123e4567-e89b-12d3-a456-426614174000', '660f9511-f3ab-52e5-b827-557766551114', '550e8400-e29b-41d4-a716-446655440001', 'API Development Platform', 95000, 'lead', 15, '2025-12-01'),
    ('770a0622-a4bc-63f6-c938-668877662226', '123e4567-e89b-12d3-a456-426614174000', '660f9511-f3ab-52e5-b827-557766551115', '550e8400-e29b-41d4-a716-446655440002', 'Security Assessment', 45000, 'demo', 45, '2025-10-10'),
    ('770a0622-a4bc-63f6-c938-668877662227', '123e4567-e89b-12d3-a456-426614174000', '660f9511-f3ab-52e5-b827-557766551111', '550e8400-e29b-41d4-a716-446655440003', 'Data Analytics Suite', 150000, 'closed_won', 100, '2025-08-15'),
    ('770a0622-a4bc-63f6-c938-668877662228', '123e4567-e89b-12d3-a456-426614174000', '660f9511-f3ab-52e5-b827-557766551112', '550e8400-e29b-41d4-a716-446655440001', 'Mobile App Development', 75000, 'lead', 20, '2025-11-30'),
    ('770a0622-a4bc-63f6-c938-668877662229', '123e4567-e89b-12d3-a456-426614174000', '660f9511-f3ab-52e5-b827-557766551113', '550e8400-e29b-41d4-a716-446655440002', 'Infrastructure Upgrade', 110000, 'poc', 70, '2025-10-25')
ON CONFLICT (id) DO NOTHING;

-- Insert quarterly goals
INSERT INTO quarterly_goals (organization_id, user_id, quarter, year, goal_type, target_value, current_value) VALUES
    ('123e4567-e89b-12d3-a456-426614174000', '550e8400-e29b-41d4-a716-446655440000', 4, 2025, 'revenue', 250000, 187500),
    ('123e4567-e89b-12d3-a456-426614174000', '550e8400-e29b-41d4-a716-446655440001', 4, 2025, 'revenue', 80000, 62000),
    ('123e4567-e89b-12d3-a456-426614174000', '550e8400-e29b-41d4-a716-446655440002', 4, 2025, 'revenue', 75000, 58000),
    ('123e4567-e89b-12d3-a456-426614174000', '550e8400-e29b-41d4-a716-446655440003', 4, 2025, 'revenue', 90000, 78000)
ON CONFLICT (organization_id, user_id, quarter, year, goal_type) DO NOTHING;

-- Insert sample alerts
INSERT INTO alerts (user_id, organization_id, type, title, message, priority, entity_id, entity_type) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', '123e4567-e89b-12d3-a456-426614174000', 'opportunity', 'Stagnant Opportunity Alert', 'Enterprise CRM Integration has not been updated in 14 days', 'medium', '770a0622-a4bc-63f6-c938-668877662222', 'opportunity'),
    ('550e8400-e29b-41d4-a716-446655440000', '123e4567-e89b-12d3-a456-426614174000', 'partner', 'Partner Health Alert', 'Global Solutions relationship health has dropped below 70%', 'high', '660f9511-f3ab-52e5-b827-557766551113', 'partner'),
    ('550e8400-e29b-41d4-a716-446655440001', '123e4567-e89b-12d3-a456-426614174000', 'goal', 'Quarterly Goal Update', 'Q4 revenue goal progress updated - currently at 77%', 'low', '550e8400-e29b-41d4-a716-446655440001', 'user')
ON CONFLICT (id) DO NOTHING;

-- Insert dashboard configuration
INSERT INTO configurations (organization_id, config_key, config_value) VALUES
    ('123e4567-e89b-12d3-a456-426614174000', 'dashboard_refresh_interval', '{"value": 300000, "unit": "milliseconds"}'),
    ('123e4567-e89b-12d3-a456-426614174000', 'alert_retention_days', '{"value": 30, "unit": "days"}'),
    ('123e4567-e89b-12d3-a456-426614174000', 'performance_targets', '{"load_time_ms": 2000, "api_response_ms": 500}')
ON CONFLICT (organization_id, config_key) DO NOTHING;