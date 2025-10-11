import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/authentication.js';
import { query } from '../utils/database.js';
import { logger } from '../utils/logger.js';

const router = Router();

router.use(authenticate);

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    organizationId: string;
  };
}

/**
 * GET /api/partners
 * Get all partners with filtering and pagination
 */
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      minHealthScore,
      maxHealthScore,
      sortBy = 'name',
      sortOrder = 'asc',
      page = '1',
      pageSize = '50'
    } = req.query;

    // Build WHERE conditions
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      conditions.push(`name ILIKE $${paramCount}`);
      params.push(`%${search}%`);
    }

    if (minHealthScore) {
      paramCount++;
      conditions.push(`relationship_health_score >= $${paramCount}`);
      params.push(minHealthScore);
    }

    if (maxHealthScore) {
      paramCount++;
      conditions.push(`relationship_health_score <= $${paramCount}`);
      params.push(maxHealthScore);
    }

    // Build ORDER BY clause
    const validSortFields = ['name', 'relationship_health_score', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'name';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Calculate pagination
    const pageNum = parseInt(page as string) || 1;
    const limit = parseInt(pageSize as string) || 50;
    const offset = (pageNum - 1) * limit;

    // Query partners with opportunity count
    const partnersQuery = `
      SELECT
        p.id,
        p.name,
        p.domain,
        p.relationship_health_score as "healthScore",
        p.primary_contact_name as "primaryContactName",
        p.primary_contact_email as "primaryContactEmail",
        p.primary_contact_phone as "primaryContactPhone",
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        COUNT(o.id) as "activeOpportunities",
        COALESCE(SUM(o.value), 0) as "totalValue"
      FROM partners p
      LEFT JOIN opportunities o ON p.id = o.partner_id
      WHERE ${conditions.join(' AND ')}
      GROUP BY p.id
      ORDER BY p.${sortField} ${order}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);

    // Get total count
    const countQuery = `
      SELECT COUNT(*)
      FROM partners
      WHERE ${conditions.join(' AND ')}
    `;
    const countResult = await query(countQuery, params.slice(0, paramCount));
    const total = parseInt(countResult.rows[0].count);

    // Execute partners query
    const result = await query(partnersQuery, params);

    res.json({
      status: 'success',
      data: {
        partners: result.rows,
        pagination: {
          page: pageNum,
          pageSize: limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching partners:', error);
    next(error);
  }
});

/**
 * GET /api/partners/:id
 * Get a single partner by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
      SELECT
        p.*,
        COUNT(o.id) as active_opportunities,
        COUNT(o.id) FILTER (WHERE o.stage = 'closed_won') as won_opportunities,
        COALESCE(SUM(o.value), 0) as total_pipeline_value,
        COALESCE(SUM(o.value) FILTER (WHERE o.stage = 'closed_won'), 0) as total_won_value
      FROM partners p
      LEFT JOIN opportunities o ON p.id = o.partner_id
      WHERE p.id = $1
      GROUP BY p.id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Partner not found'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching partner:', error);
    next(error);
  }
});

/**
 * POST /api/partners
 * Create a new partner
 */
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      domain,
      website,
      primaryContactName,
      primaryContactEmail,
      primaryContactPhone,
      healthScore = 50
    } = req.body;

    // Validate required fields
    if (!name || !domain || !primaryContactName || !primaryContactEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, domain, primary contact name and email are required'
      });
    }

    const result = await query(
      `
      INSERT INTO partners (
        name,
        domain,
        website,
        primary_contact_name,
        primary_contact_email,
        primary_contact_phone,
        relationship_health_score
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        name,
        domain,
        website,
        primaryContactName,
        primaryContactEmail,
        primaryContactPhone,
        healthScore
      ]
    );

    logger.info(`Partner created: ${result.rows[0].id}`);

    res.status(201).json({
      status: 'success',
      data: result.rows[0],
      message: 'Partner created successfully'
    });
  } catch (error) {
    logger.error('Error creating partner:', error);
    next(error);
  }
});

/**
 * PATCH /api/partners/:id
 * Update a partner
 */
router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if partner exists
    const existing = await query(
      'SELECT * FROM partners WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Partner not found'
      });
    }

    // Build update query dynamically
    const allowedFields = [
      'name',
      'domain',
      'website',
      'relationship_health_score',
      'primary_contact_name',
      'primary_contact_email',
      'primary_contact_phone'
    ];

    const updateFields: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    Object.keys(updates).forEach(key => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(snakeKey)) {
        paramCount++;
        updateFields.push(`${snakeKey} = $${paramCount}`);
        params.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields to update'
      });
    }

    params.push(id);
    const updateQuery = `
      UPDATE partners
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await query(updateQuery, params);

    logger.info(`Partner updated: ${id}`);

    res.json({
      status: 'success',
      data: result.rows[0],
      message: 'Partner updated successfully'
    });
  } catch (error) {
    logger.error('Error updating partner:', error);
    next(error);
  }
});

/**
 * DELETE /api/partners/:id
 * Delete (soft delete) a partner
 */
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if partner has opportunities
    const oppCheck = await query(
      'SELECT COUNT(*) FROM opportunities WHERE partner_id = $1',
      [id]
    );

    if (parseInt(oppCheck.rows[0].count) > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete partner with opportunities'
      });
    }

    const result = await query(
      `
      DELETE FROM partners
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Partner not found'
      });
    }

    logger.info(`Partner deleted: ${id}`);

    res.json({
      status: 'success',
      message: 'Partner deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting partner:', error);
    next(error);
  }
});

export { router as partnerRoutes };