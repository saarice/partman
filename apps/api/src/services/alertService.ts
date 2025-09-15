import { query } from '../utils/database.js';
import { logger } from '../utils/logger.js';
import { io } from '../server.js';

export enum AlertType {
  OPPORTUNITY = 'opportunity',
  PARTNER = 'partner',
  GOAL = 'goal',
  TASK = 'task',
  COMMISSION = 'commission'
}

export enum AlertPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  entityId?: string;
  isAcknowledged: boolean;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export class AlertService {

  async createAlert(
    userId: string,
    type: AlertType,
    priority: AlertPriority,
    title: string,
    message: string,
    entityId?: string
  ): Promise<Alert> {
    const alertQuery = `
      INSERT INTO alerts (user_id, type, priority, title, message, entity_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await query(alertQuery, [userId, type, priority, title, message, entityId]);
    const alert = result.rows[0];

    // Emit real-time notification
    io.to(`user_${userId}`).emit('new_alert', {
      id: alert.id,
      type: alert.type,
      priority: alert.priority,
      title: alert.title,
      message: alert.message,
      createdAt: alert.created_at
    });

    logger.info(`Created ${priority} ${type} alert for user ${userId}: ${title}`);

    return this.mapAlert(alert);
  }

  async getAlertsForUser(
    userId: string,
    includeAcknowledged = false,
    limit = 50
  ): Promise<Alert[]> {
    const alertQuery = `
      SELECT * FROM alerts
      WHERE user_id = $1
      ${includeAcknowledged ? '' : 'AND is_acknowledged = false'}
      ORDER BY
        CASE priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        created_at DESC
      LIMIT $2
    `;

    const result = await query(alertQuery, [userId, limit]);
    return result.rows.map(this.mapAlert);
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
    const updateQuery = `
      UPDATE alerts
      SET is_acknowledged = true, acknowledged_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2 AND is_acknowledged = false
      RETURNING id
    `;

    const result = await query(updateQuery, [alertId, userId]);

    if (result.rows.length > 0) {
      logger.info(`User ${userId} acknowledged alert ${alertId}`);
      return true;
    }

    return false;
  }

  async acknowledgeMultipleAlerts(alertIds: string[], userId: string): Promise<number> {
    if (alertIds.length === 0) return 0;

    const placeholders = alertIds.map((_, i) => `$${i + 2}`).join(',');
    const updateQuery = `
      UPDATE alerts
      SET is_acknowledged = true, acknowledged_at = CURRENT_TIMESTAMP
      WHERE id IN (${placeholders}) AND user_id = $1 AND is_acknowledged = false
    `;

    const result = await query(updateQuery, [userId, ...alertIds]);
    const count = result.rowCount || 0;

    logger.info(`User ${userId} acknowledged ${count} alerts`);
    return count;
  }

  async getAlertSummary(userId: string): Promise<any[]> {
    const summaryQuery = `
      SELECT
        type,
        priority,
        COUNT(*) as count,
        MAX(created_at) as most_recent_date
      FROM alerts
      WHERE user_id = $1 AND is_acknowledged = false
      GROUP BY type, priority
      ORDER BY
        CASE priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        count DESC
    `;

    const result = await query(summaryQuery, [userId]);
    return result.rows.map(row => ({
      type: row.type,
      priority: row.priority,
      count: parseInt(row.count),
      mostRecentDate: new Date(row.most_recent_date)
    }));
  }

  // Alert generation methods
  async generateOpportunityAlerts(): Promise<void> {
    logger.info('Generating opportunity alerts...');

    // Stage stagnation alerts
    await this.generateStagnationAlerts();

    // Close date approaching alerts
    await this.generateCloseDateAlerts();

    // High-value deal change alerts
    await this.generateHighValueChangeAlerts();
  }

  private async generateStagnationAlerts(): Promise<void> {
    const stagnationQuery = `
      SELECT
        o.id,
        o.title,
        o.assigned_user_id,
        o.stage,
        o.updated_at,
        EXTRACT(DAYS FROM (CURRENT_TIMESTAMP - o.updated_at)) as days_stagnant
      FROM opportunities o
      WHERE o.stage NOT IN ('closed_won', 'closed_lost')
        AND o.updated_at < CURRENT_TIMESTAMP - INTERVAL '14 days'
        AND NOT EXISTS (
          SELECT 1 FROM alerts a
          WHERE a.entity_id = o.id::text
            AND a.type = 'opportunity'
            AND a.title LIKE '%stagnant%'
            AND a.created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
        )
    `;

    const result = await query(stagnationQuery);

    for (const opp of result.rows) {
      await this.createAlert(
        opp.assigned_user_id,
        AlertType.OPPORTUNITY,
        opp.days_stagnant > 30 ? AlertPriority.HIGH : AlertPriority.MEDIUM,
        `Opportunity "${opp.title}" is stagnant`,
        `This opportunity has been in ${opp.stage} stage for ${Math.floor(opp.days_stagnant)} days without updates.`,
        opp.id
      );
    }
  }

  private async generateCloseDateAlerts(): Promise<void> {
    const closeDateQuery = `
      SELECT
        o.id,
        o.title,
        o.assigned_user_id,
        o.expected_close_date,
        o.value,
        EXTRACT(DAYS FROM (o.expected_close_date - CURRENT_DATE)) as days_until_close
      FROM opportunities o
      WHERE o.stage NOT IN ('closed_won', 'closed_lost')
        AND o.expected_close_date IS NOT NULL
        AND o.expected_close_date <= CURRENT_DATE + INTERVAL '7 days'
        AND NOT EXISTS (
          SELECT 1 FROM alerts a
          WHERE a.entity_id = o.id::text
            AND a.type = 'opportunity'
            AND a.title LIKE '%closing soon%'
            AND a.created_at > CURRENT_TIMESTAMP - INTERVAL '3 days'
        )
    `;

    const result = await query(closeDateQuery);

    for (const opp of result.rows) {
      const daysUntilClose = Math.floor(opp.days_until_close);
      const priority = daysUntilClose <= 1 ? AlertPriority.URGENT :
                      daysUntilClose <= 3 ? AlertPriority.HIGH : AlertPriority.MEDIUM;

      await this.createAlert(
        opp.assigned_user_id,
        AlertType.OPPORTUNITY,
        priority,
        `Opportunity "${opp.title}" closing soon`,
        `Expected close date is ${daysUntilClose <= 0 ? 'today' : `in ${daysUntilClose} days`}. Value: $${Number(opp.value).toLocaleString()}`,
        opp.id
      );
    }
  }

  private async generateHighValueChangeAlerts(): Promise<void> {
    // This would track significant value changes in opportunities
    // For demo purposes, we'll create some mock high-value alerts
    logger.info('High-value change alerts would be generated based on opportunity value changes');
  }

  async generatePartnerAlerts(): Promise<void> {
    logger.info('Generating partner alerts...');

    // Relationship maintenance alerts
    const maintenanceQuery = `
      SELECT
        p.id,
        p.name,
        p.relationship_health_score,
        p.updated_at,
        EXTRACT(DAYS FROM (CURRENT_TIMESTAMP - p.updated_at)) as days_since_update
      FROM partners p
      WHERE p.relationship_health_score < 70
        OR p.updated_at < CURRENT_TIMESTAMP - INTERVAL '30 days'
      AND NOT EXISTS (
        SELECT 1 FROM alerts a
        WHERE a.entity_id = p.id::text
          AND a.type = 'partner'
          AND a.created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
      )
    `;

    const result = await query(maintenanceQuery);

    for (const partner of result.rows) {
      const priority = partner.relationship_health_score < 50 ? AlertPriority.HIGH :
                      partner.relationship_health_score < 70 ? AlertPriority.MEDIUM : AlertPriority.LOW;

      // Get all VPs and partnership managers for partner alerts
      const usersQuery = `
        SELECT id FROM users
        WHERE role IN ('vp', 'partnership_manager')
        AND is_active = true
      `;
      const users = await query(usersQuery);

      for (const user of users.rows) {
        await this.createAlert(
          user.id,
          AlertType.PARTNER,
          priority,
          `Partner "${partner.name}" needs attention`,
          `Health score: ${partner.relationship_health_score}/100. Last updated ${Math.floor(partner.days_since_update)} days ago.`,
          partner.id
        );
      }
    }
  }

  async generateGoalAlerts(): Promise<void> {
    logger.info('Generating goal alerts...');

    // Mock goal alerts for demo
    const usersQuery = `SELECT id FROM users WHERE role = 'vp' AND is_active = true`;
    const users = await query(usersQuery);

    for (const user of users.rows) {
      // Quarter progress alert
      await this.createAlert(
        user.id,
        AlertType.GOAL,
        AlertPriority.MEDIUM,
        'Quarterly goal progress update',
        'Currently at 75% of quarterly target with 3 weeks remaining. On track for goal achievement.',
        null
      );
    }
  }

  private mapAlert(row: any): Alert {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      priority: row.priority,
      title: row.title,
      message: row.message,
      entityId: row.entity_id,
      isAcknowledged: row.is_acknowledged,
      acknowledgedAt: row.acknowledged_at ? new Date(row.acknowledged_at) : undefined,
      createdAt: new Date(row.created_at)
    };
  }

  // Background job to generate all alerts
  async runAlertGeneration(): Promise<void> {
    try {
      logger.info('Starting alert generation cycle...');

      await Promise.all([
        this.generateOpportunityAlerts(),
        this.generatePartnerAlerts(),
        this.generateGoalAlerts()
      ]);

      logger.info('Alert generation cycle completed');
    } catch (error) {
      logger.error('Error during alert generation:', error);
    }
  }
}