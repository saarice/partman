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
 * GET /api/opportunities
 * Get all opportunities with filtering, sorting, and pagination
 */
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      stage,
      partnerId,
      assignedUserId,
      minValue,
      maxValue,
      minProbability,
      maxProbability,
      search,
      sortBy = 'updated_at',
      sortOrder = 'desc',
      page = '1',
      pageSize = '50'
    } = req.query;

    // Build WHERE conditions
    const conditions: string[] = ['1=1']; // Always true condition for building dynamic WHERE
    const params: any[] = [];
    let paramCount = 0;

    if (stage) {
      paramCount++;
      conditions.push(`o.stage = $${paramCount}`);
      params.push(stage);
    }

    if (partnerId) {
      paramCount++;
      conditions.push(`o.partner_id = $${paramCount}`);
      params.push(partnerId);
    }

    if (assignedUserId) {
      paramCount++;
      conditions.push(`o.assigned_user_id = $${paramCount}`);
      params.push(assignedUserId);
    }

    if (minValue) {
      paramCount++;
      conditions.push(`o.value >= $${paramCount}`);
      params.push(minValue);
    }

    if (maxValue) {
      paramCount++;
      conditions.push(`o.value <= $${paramCount}`);
      params.push(maxValue);
    }

    if (minProbability) {
      paramCount++;
      conditions.push(`o.probability >= $${paramCount}`);
      params.push(minProbability);
    }

    if (maxProbability) {
      paramCount++;
      conditions.push(`o.probability <= $${paramCount}`);
      params.push(maxProbability);
    }

    if (search) {
      paramCount++;
      conditions.push(`(o.title ILIKE $${paramCount} OR o.description ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }

    // Build ORDER BY clause
    const validSortFields = ['title', 'value', 'probability', 'stage', 'created_at', 'updated_at', 'expected_close_date'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'updated_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Calculate pagination
    const pageNum = parseInt(page as string) || 1;
    const limit = parseInt(pageSize as string) || 50;
    const offset = (pageNum - 1) * limit;

    // Query opportunities
    const opportunitiesQuery = `
      SELECT
        o.id,
        o.title as name,
        o.description,
        o.value as amount,
        o.stage,
        o.probability,
        o.expected_close_date as "expectedCloseDate",
        o.created_at as "createdAt",
        o.updated_at as "updatedAt",
        o.value * o.probability / 100 as "weightedValue",
        EXTRACT(DAY FROM (CURRENT_TIMESTAMP - o.updated_at)) as "daysInStage",
        'USD' as currency,
        CASE
          WHEN o.probability >= 75 THEN 'healthy'
          WHEN o.probability >= 50 THEN 'at-risk'
          ELSE 'critical'
        END as health,
        p.id as "partnerId",
        p.name as "partnerName",
        p.domain,
        json_build_object(
          'id', p.id,
          'name', p.name,
          'type', p.domain,
          'tier', 'Standard',
          'logoUrl', NULL
        ) as partner,
        u.id as "ownerId",
        CONCAT(u.first_name, ' ', u.last_name) as "ownerName",
        json_build_object(
          'id', u.id,
          'name', CONCAT(u.first_name, ' ', u.last_name),
          'email', u.email,
          'avatar', NULL
        ) as owner
      FROM opportunities o
      LEFT JOIN partners p ON o.partner_id = p.id
      LEFT JOIN users u ON o.assigned_user_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY o.${sortField} ${order}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);

    // Get total count
    const countQuery = `
      SELECT COUNT(*)
      FROM opportunities o
      WHERE ${conditions.join(' AND ')}
    `;
    const countResult = await query(countQuery, params.slice(0, paramCount));
    const total = parseInt(countResult.rows[0].count);

    // Execute opportunities query
    const result = await query(opportunitiesQuery, params);

    res.json({
      status: 'success',
      data: {
        opportunities: result.rows,
        pagination: {
          page: pageNum,
          pageSize: limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching opportunities:', error);
    next(error);
  }
});

/**
 * GET /api/opportunities/:id
 * Get a single opportunity by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
      SELECT
        o.*,
        p.name as partner_name,
        p.domain as partner_domain,
        CONCAT(u.first_name, ' ', u.last_name) as owner_name,
        u.email as owner_email
      FROM opportunities o
      LEFT JOIN partners p ON o.partner_id = p.id
      LEFT JOIN users u ON o.assigned_user_id = u.id
      WHERE o.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Opportunity not found'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error fetching opportunity:', error);
    next(error);
  }
});

/**
 * POST /api/opportunities
 * Create a new opportunity
 */
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const {
      title,
      description,
      value,
      stage = 'lead',
      probability = 0,
      partnerId,
      assignedUserId,
      expectedCloseDate,
      customerId,
      customerName
    } = req.body;

    // Validate required fields
    if (!title || value === undefined || !customerId || !customerName || !partnerId) {
      return res.status(400).json({
        status: 'error',
        message: 'Title, value, customerId, customerName, and partnerId are required'
      });
    }

    const result = await query(
      `
      INSERT INTO opportunities (
        title,
        description,
        value,
        stage,
        probability,
        customer_id,
        customer_name,
        partner_id,
        assigned_user_id,
        expected_close_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
      `,
      [
        title,
        description,
        value,
        stage,
        probability,
        customerId,
        customerName,
        partnerId,
        assignedUserId || userId,
        expectedCloseDate
      ]
    );

    // Log stage history
    await query(
      `
      INSERT INTO opportunity_stage_history (opportunity_id, stage, changed_by)
      VALUES ($1, $2, $3)
      `,
      [result.rows[0].id, stage, userId]
    );

    logger.info(`Opportunity created: ${result.rows[0].id}`);

    res.status(201).json({
      status: 'success',
      data: result.rows[0],
      message: 'Opportunity created successfully'
    });
  } catch (error) {
    logger.error('Error creating opportunity:', error);
    next(error);
  }
});

/**
 * PATCH /api/opportunities/:id
 * Update an opportunity
 */
router.patch('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { id } = req.params;
    const updates = req.body;

    // Check if opportunity exists
    const existing = await query(
      'SELECT * FROM opportunities WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Opportunity not found'
      });
    }

    // Build update query dynamically
    const allowedFields = [
      'title', 'description', 'value', 'stage', 'probability',
      'partner_id', 'assigned_user_id', 'expected_close_date',
      'actual_close_date', 'customer_id', 'customer_name'
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
      UPDATE opportunities
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await query(updateQuery, params);

    // Log stage change if applicable
    if (updates.stage && updates.stage !== existing.rows[0].stage) {
      await query(
        `
        INSERT INTO opportunity_stage_history (opportunity_id, previous_stage, stage, changed_by)
        VALUES ($1, $2, $3, $4)
        `,
        [id, existing.rows[0].stage, updates.stage, userId]
      );
    }

    logger.info(`Opportunity updated: ${id}`);

    res.json({
      status: 'success',
      data: result.rows[0],
      message: 'Opportunity updated successfully'
    });
  } catch (error) {
    logger.error('Error updating opportunity:', error);
    next(error);
  }
});

/**
 * DELETE /api/opportunities/:id
 * Delete (soft delete) an opportunity
 */
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
      DELETE FROM opportunities
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Opportunity not found'
      });
    }

    logger.info(`Opportunity deleted: ${id}`);

    res.json({
      status: 'success',
      message: 'Opportunity deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting opportunity:', error);
    next(error);
  }
});

export { router as opportunityRoutes };