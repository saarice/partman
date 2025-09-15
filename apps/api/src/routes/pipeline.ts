import { Router } from 'express';
import { authenticate } from '../middleware/authentication.js';
import { pool } from '../utils/database.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Get pipeline health data
router.get('/health', authenticate, async (req, res) => {
  try {
    const { teamMember, partner, dateRange = '30d' } = req.query;

    // Calculate date filter
    let dateFilter = '';
    const params: any[] = [];
    let paramIndex = 1;

    if (dateRange === '30d') {
      dateFilter = `AND o.created_at >= NOW() - INTERVAL '30 days'`;
    } else if (dateRange === '90d') {
      dateFilter = `AND o.created_at >= NOW() - INTERVAL '90 days'`;
    } else if (dateRange === '1y') {
      dateFilter = `AND o.created_at >= NOW() - INTERVAL '1 year'`;
    }

    // Team member filter
    if (teamMember && teamMember !== 'all') {
      dateFilter += ` AND o.assigned_to = $${paramIndex}`;
      params.push(teamMember);
      paramIndex++;
    }

    // Partner filter
    if (partner && partner !== 'all') {
      dateFilter += ` AND p.id = $${paramIndex}`;
      params.push(partner);
      paramIndex++;
    }

    // Get pipeline stages data
    const stagesQuery = `
      SELECT
        o.stage,
        COUNT(*) as count,
        SUM(o.value) as total_value,
        AVG(CASE WHEN o.stage = 'closed_won' THEN 100 ELSE stage_probability.prob END) as avg_probability
      FROM opportunities o
      LEFT JOIN partners p ON o.partner_id = p.id
      LEFT JOIN (VALUES
        ('lead', 10),
        ('demo', 25),
        ('poc', 50),
        ('proposal', 75),
        ('closed_won', 100)
      ) AS stage_probability(stage, prob) ON o.stage = stage_probability.stage
      WHERE 1=1 ${dateFilter}
      GROUP BY o.stage, stage_probability.prob
      ORDER BY stage_probability.prob ASC
    `;

    const stagesResult = await pool.query(stagesQuery, params);

    // Get conversion rates (mock for now - would need historical data analysis)
    const conversionRates = {
      'lead': 32.5,
      'demo': 68.2,
      'poc': 73.5,
      'proposal': 85.2,
      'closed_won': 100
    };

    // Get trends (mock for now - would need historical comparison)
    const trends = {
      'lead': 'up',
      'demo': 'up',
      'poc': 'stable',
      'proposal': 'down',
      'closed_won': 'up'
    } as const;

    // Format stages data
    const stages = stagesResult.rows.map(row => ({
      stage: row.stage.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      count: parseInt(row.count),
      value: parseFloat(row.total_value) || 0,
      probability: parseFloat(row.avg_probability) || 0,
      conversionRate: conversionRates[row.stage as keyof typeof conversionRates] || 0,
      trend: trends[row.stage as keyof typeof trends] || 'stable'
    }));

    // Calculate totals
    const totalOpportunities = stages.reduce((sum, stage) => sum + stage.count, 0);
    const totalValue = stages.reduce((sum, stage) => sum + stage.value, 0);
    const weightedValue = stages.reduce((sum, stage) => sum + (stage.value * stage.probability / 100), 0);

    const response = {
      stages,
      totalOpportunities,
      totalValue,
      weightedValue
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching pipeline health data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pipeline health data'
    });
  }
});

// Get opportunities by stage
router.get('/opportunities/:stage', authenticate, async (req, res) => {
  try {
    const { stage } = req.params;
    const { teamMember, partner, dateRange = '30d' } = req.query;

    // Convert stage name back to database format
    const dbStage = stage.toLowerCase().replace(' ', '_');

    let whereClause = 'WHERE o.stage = $1';
    const params: any[] = [dbStage];
    let paramIndex = 2;

    // Date filter
    if (dateRange === '30d') {
      whereClause += ` AND o.created_at >= NOW() - INTERVAL '30 days'`;
    } else if (dateRange === '90d') {
      whereClause += ` AND o.created_at >= NOW() - INTERVAL '90 days'`;
    } else if (dateRange === '1y') {
      whereClause += ` AND o.created_at >= NOW() - INTERVAL '1 year'`;
    }

    // Team member filter
    if (teamMember && teamMember !== 'all') {
      whereClause += ` AND o.assigned_to = $${paramIndex}`;
      params.push(teamMember);
      paramIndex++;
    }

    // Partner filter
    if (partner && partner !== 'all') {
      whereClause += ` AND p.id = $${paramIndex}`;
      params.push(partner);
    }

    const query = `
      SELECT
        o.id,
        o.title,
        o.value,
        o.stage,
        o.created_at,
        o.updated_at,
        p.name as partner_name,
        u.first_name || ' ' || u.last_name as assigned_to_name
      FROM opportunities o
      LEFT JOIN partners p ON o.partner_id = p.id
      LEFT JOIN users u ON o.assigned_to = u.id
      ${whereClause}
      ORDER BY o.value DESC, o.updated_at DESC
    `;

    const result = await pool.query(query, params);

    const opportunities = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      value: parseFloat(row.value),
      stage: row.stage,
      partnerName: row.partner_name,
      assignedTo: row.assigned_to_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json(opportunities);
  } catch (error) {
    logger.error('Error fetching opportunities by stage:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch opportunities'
    });
  }
});

// Get historical pipeline trends
router.get('/trends', authenticate, async (req, res) => {
  try {
    const { period = 'quarterly' } = req.query;

    let intervalClause = '';
    let groupClause = '';

    if (period === 'quarterly') {
      intervalClause = "DATE_TRUNC('quarter', o.created_at)";
      groupClause = 'quarter';
    } else {
      intervalClause = "DATE_TRUNC('month', o.created_at)";
      groupClause = 'month';
    }

    const query = `
      SELECT
        ${intervalClause} as period,
        o.stage,
        COUNT(*) as count,
        SUM(o.value) as total_value
      FROM opportunities o
      WHERE o.created_at >= NOW() - INTERVAL '2 years'
      GROUP BY ${intervalClause}, o.stage
      ORDER BY period DESC, o.stage
    `;

    const result = await pool.query(query);

    const trends = result.rows.map(row => ({
      period: row.period,
      stage: row.stage.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      count: parseInt(row.count),
      value: parseFloat(row.total_value)
    }));

    res.json(trends);
  } catch (error) {
    logger.error('Error fetching pipeline trends:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pipeline trends'
    });
  }
});

export { router as pipelineRoutes };