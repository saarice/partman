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
 * PATCH /api/opportunities/bulk
 * Bulk update opportunities
 * IMPORTANT: This must come BEFORE /:id routes
 */
router.patch('/bulk', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { ids, updates } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'IDs array is required'
      });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Updates object is required'
      });
    }

    // Build update query
    const allowedFields = [
      'stage', 'probability', 'assigned_user_id', 'expected_close_date', 'status'
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

    // Create placeholders for IDs
    const idPlaceholders = ids.map((_, index) => `$${paramCount + index + 1}`).join(', ');
    params.push(...ids);

    const updateQuery = `
      UPDATE opportunities
      SET ${updateFields.join(', ')}
      WHERE id IN (${idPlaceholders})
      RETURNING *
    `;

    const result = await query(updateQuery, params);

    // Log stage changes if stage was updated
    if (updates.stage) {
      const historyPromises = result.rows.map((opp: any) =>
        query(
          `
          INSERT INTO opportunity_stage_history (opportunity_id, to_stage, changed_by, notes)
          VALUES ($1, $2, $3, $4)
          `,
          [opp.id, updates.stage, userId, 'Bulk update']
        )
      );
      await Promise.all(historyPromises);
    }

    logger.info(`Bulk updated ${result.rows.length} opportunities`);

    res.json({
      status: 'success',
      data: result.rows,
      message: `Successfully updated ${result.rows.length} opportunities`
    });
  } catch (error) {
    logger.error('Error bulk updating opportunities:', error);
    next(error);
  }
});

/**
 * DELETE /api/opportunities/bulk
 * Bulk delete opportunities
 * IMPORTANT: This must come BEFORE /:id routes
 */
router.delete('/bulk', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'IDs array is required'
      });
    }

    const placeholders = ids.map((_, index) => `$${index + 1}`).join(', ');
    const result = await query(
      `
      DELETE FROM opportunities
      WHERE id IN (${placeholders})
      RETURNING id
      `,
      ids
    );

    logger.info(`Bulk deleted ${result.rows.length} opportunities`);

    res.json({
      status: 'success',
      message: `Successfully deleted ${result.rows.length} opportunities`
    });
  } catch (error) {
    logger.error('Error bulk deleting opportunities:', error);
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

/**
 * POST /api/opportunities/:id/clone
 * Clone an existing opportunity
 */
router.post('/:id/clone', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { id } = req.params;

    // Get original opportunity
    const original = await query(
      'SELECT * FROM opportunities WHERE id = $1',
      [id]
    );

    if (original.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Opportunity not found'
      });
    }

    const opp = original.rows[0];

    // Clone opportunity with updated title
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
        expected_close_date,
        organization_id,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
      `,
      [
        `${opp.title} (Copy)`,
        opp.description,
        opp.value,
        'lead', // Reset to lead stage
        10, // Reset probability
        opp.customer_id,
        opp.customer_name,
        opp.partner_id,
        userId, // Assign to current user
        null, // Clear expected close date
        opp.organization_id,
        'active'
      ]
    );

    // Log initial stage history for cloned opportunity
    await query(
      `
      INSERT INTO opportunity_stage_history (opportunity_id, to_stage, changed_by)
      VALUES ($1, $2, $3)
      `,
      [result.rows[0].id, 'lead', userId]
    );

    logger.info(`Opportunity cloned: ${id} -> ${result.rows[0].id}`);

    res.status(201).json({
      status: 'success',
      data: result.rows[0],
      message: 'Opportunity cloned successfully'
    });
  } catch (error) {
    logger.error('Error cloning opportunity:', error);
    next(error);
  }
});

/**
 * GET /api/opportunities/:id/history
 * Get stage change history for an opportunity
 */
router.get('/:id/history', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
      SELECT
        osh.id,
        osh.opportunity_id as "opportunityId",
        osh.from_stage as "fromStage",
        osh.to_stage as "toStage",
        osh.changed_by as "changedBy",
        osh.changed_at as "changedAt",
        osh.notes,
        CONCAT(u.first_name, ' ', u.last_name) as "changedByName",
        u.email as "changedByEmail"
      FROM opportunity_stage_history osh
      LEFT JOIN users u ON osh.changed_by = u.id
      WHERE osh.opportunity_id = $1
      ORDER BY osh.changed_at DESC
      `,
      [id]
    );

    res.json({
      status: 'success',
      data: result.rows
    });
  } catch (error) {
    logger.error('Error fetching opportunity history:', error);
    next(error);
  }
});

/**
 * PATCH /api/opportunities/:id/stage
 * Update opportunity stage with validation
 */
router.patch('/:id/stage', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { id } = req.params;
    const { stage, notes } = req.body;

    if (!stage) {
      return res.status(400).json({
        status: 'error',
        message: 'Stage is required'
      });
    }

    // Get current opportunity
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

    const previousStage = existing.rows[0].stage;

    // Update probability based on new stage
    const stageProbabilities: Record<string, number> = {
      'lead': 10,
      'demo': 25,
      'poc': 50,
      'proposal': 75,
      'closed_won': 100,
      'closed_lost': 0
    };

    const newProbability = stageProbabilities[stage] || existing.rows[0].probability;

    // Update opportunity
    const updateData: any = {
      stage,
      probability: newProbability
    };

    // Set actual close date if closing
    if (stage === 'closed_won' || stage === 'closed_lost') {
      updateData.actual_close_date = new Date().toISOString().split('T')[0];
      updateData.status = stage === 'closed_won' ? 'won' : 'lost';
    }

    const updateFields = Object.keys(updateData).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const updateValues = Object.values(updateData);

    const result = await query(
      `
      UPDATE opportunities
      SET ${updateFields}
      WHERE id = $${updateValues.length + 1}
      RETURNING *
      `,
      [...updateValues, id]
    );

    // Log stage change
    await query(
      `
      INSERT INTO opportunity_stage_history (opportunity_id, from_stage, to_stage, changed_by, notes)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [id, previousStage, stage, userId, notes]
    );

    logger.info(`Opportunity stage updated: ${id} from ${previousStage} to ${stage}`);

    res.json({
      status: 'success',
      data: result.rows[0],
      message: 'Stage updated successfully'
    });
  } catch (error) {
    logger.error('Error updating opportunity stage:', error);
    next(error);
  }
});

export { router as opportunityRoutes };