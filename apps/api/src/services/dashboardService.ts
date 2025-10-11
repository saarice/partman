import { query } from '../utils/database.js';
import { logger } from '../utils/logger.js';

export interface DashboardKPIs {
  revenue: {
    currentQuarterTarget: number;
    currentQuarterActual: number;
    currentQuarterProgress: number;
    previousQuarterActual: number;
    yearToDateActual: number;
    forecastedQuarterEnd: number;
  };
  pipeline: {
    totalWeightedValue: number;
    totalOpportunities: number;
    conversionRateByStage: Record<string, number>;
    averageDealSize: number;
    averageSalesCycle: number;
    stageDistribution: Record<string, { count: number; value: number }>;
  };
  team: {
    totalMembers: number;
    activeOpportunities: number;
    completedTasksThisWeek: number;
    teamPerformance: Array<{
      userId: string;
      userName: string;
      revenue: number;
      activeOpportunities: number;
      taskCompletionRate: number;
      goalProgress: number;
      lastActivityDate: Date;
    }>;
    weeklyStatusCompliance: number;
  };
  partners: {
    totalPartners: number;
    activePartners: number;
    healthDistribution: Record<string, number>;
    topPerformingPartners: Array<{
      partnerId: string;
      partnerName: string;
      revenue: number;
      opportunityCount: number;
      healthScore: number;
      lastInteraction: Date;
    }>;
    relationshipMaintenanceAlerts: number;
  };
  alerts: Array<{
    type: string;
    priority: string;
    count: number;
    mostRecentDate: Date;
  }>;
}

export class DashboardService {
  async getKPIs(userId: string, organizationId: string): Promise<DashboardKPIs> {
    try {
      logger.info(`Fetching dashboard KPIs for user ${userId}, org ${organizationId}`);

      const [
        revenueData,
        pipelineData,
        teamData,
        partnerData,
        alertData
      ] = await Promise.all([
        this.getRevenueKPIs(organizationId),
        this.getPipelineKPIs(organizationId),
        this.getTeamKPIs(organizationId),
        this.getPartnerKPIs(organizationId),
        this.getAlertSummary(userId, organizationId)
      ]);

      return {
        revenue: revenueData,
        pipeline: pipelineData,
        team: teamData,
        partners: partnerData,
        alerts: alertData
      };
    } catch (error) {
      logger.error('Error fetching dashboard KPIs', error);
      throw error;
    }
  }

  private async getRevenueKPIs(organizationId: string) {
    const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
    const currentYear = new Date().getFullYear();

    // Get quarterly goals and actual revenue
    const revenueQuery = `
      SELECT
        qg.target_value as quarter_target,
        qg.current_value as quarter_actual,
        COALESCE(SUM(o.value) FILTER (WHERE o.stage = 'won' AND EXTRACT(YEAR FROM o.updated_at) = $2), 0) as ytd_actual
      FROM quarterly_goals qg
      LEFT JOIN opportunities o ON o.organization_id = qg.organization_id
      WHERE qg.organization_id = $1
        AND qg.quarter = $3
        AND qg.year = $2
        AND qg.goal_type = 'revenue'
      GROUP BY qg.target_value, qg.current_value
      LIMIT 1
    `;

    const result = await query(revenueQuery, [organizationId, currentYear, currentQuarter]);

    if (result.rows.length === 0) {
      // Return default values if no goals set
      return {
        currentQuarterTarget: 250000,
        currentQuarterActual: 0,
        currentQuarterProgress: 0,
        previousQuarterActual: 0,
        yearToDateActual: 0,
        forecastedQuarterEnd: 0
      };
    }

    const row = result.rows[0];
    const target = parseFloat(row.quarter_target) || 250000;
    const actual = parseFloat(row.quarter_actual) || 0;
    const progress = target > 0 ? Math.round((actual / target) * 100) : 0;

    return {
      currentQuarterTarget: target,
      currentQuarterActual: actual,
      currentQuarterProgress: progress,
      previousQuarterActual: 220000, // TODO: Calculate from previous quarter
      yearToDateActual: parseFloat(row.ytd_actual) || 0,
      forecastedQuarterEnd: actual * 1.3 // Simple forecast: current + 30%
    };
  }

  private async getPipelineKPIs(organizationId: string) {
    const pipelineQuery = `
      SELECT
        stage,
        COUNT(*) as count,
        SUM(value) as total_value,
        SUM(value * probability / 100) as weighted_value
      FROM opportunities
      WHERE organization_id = $1 AND status = 'active'
      GROUP BY stage
    `;

    const result = await query(pipelineQuery, [organizationId]);

    const stageDistribution: Record<string, { count: number; value: number }> = {};
    let totalWeightedValue = 0;
    let totalOpportunities = 0;
    let totalValue = 0;

    result.rows.forEach(row => {
      stageDistribution[row.stage] = {
        count: parseInt(row.count),
        value: parseFloat(row.total_value)
      };
      totalWeightedValue += parseFloat(row.weighted_value);
      totalOpportunities += parseInt(row.count);
      totalValue += parseFloat(row.total_value);
    });

    return {
      totalWeightedValue,
      totalOpportunities,
      conversionRateByStage: {
        lead: 25,
        demo: 50,
        poc: 75,
        proposal: 85
      },
      averageDealSize: totalOpportunities > 0 ? totalValue / totalOpportunities : 0,
      averageSalesCycle: 45, // days - mock data
      stageDistribution
    };
  }

  private async getTeamKPIs(organizationId: string) {
    const teamQuery = `
      SELECT
        u.id,
        u.first_name || ' ' || u.last_name as name,
        COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'active') as active_opportunities,
        COALESCE(SUM(o.value) FILTER (WHERE o.stage = 'won'), 0) as revenue
      FROM users u
      LEFT JOIN opportunities o ON u.id = o.assigned_user_id AND o.organization_id = u.organization_id
      WHERE u.organization_id = $1 AND u.is_active = true
      GROUP BY u.id, u.first_name, u.last_name
    `;

    const result = await query(teamQuery, [organizationId]);

    const teamPerformance = result.rows.map(row => ({
      userId: row.id,
      userName: row.name,
      revenue: parseFloat(row.revenue),
      activeOpportunities: parseInt(row.active_opportunities),
      taskCompletionRate: 85, // mock data
      goalProgress: 78, // mock data
      lastActivityDate: new Date()
    }));

    return {
      totalMembers: result.rows.length,
      activeOpportunities: result.rows.reduce((sum, row) => sum + parseInt(row.active_opportunities), 0),
      completedTasksThisWeek: 42, // mock data
      teamPerformance,
      weeklyStatusCompliance: 95 // mock data
    };
  }

  private async getPartnerKPIs(organizationId: string) {
    const partnerQuery = `
      SELECT
        p.id,
        p.name,
        p.relationship_health_score,
        COUNT(o.id) FILTER (WHERE o.status = 'active') as opportunity_count,
        COALESCE(SUM(o.value) FILTER (WHERE o.stage = 'won'), 0) as revenue
      FROM partners p
      LEFT JOIN opportunities o ON p.id = o.partner_id AND o.organization_id = p.organization_id
      WHERE p.organization_id = $1 AND p.is_active = true
      GROUP BY p.id, p.name, p.relationship_health_score
      ORDER BY revenue DESC
      LIMIT 5
    `;

    const result = await query(partnerQuery, [organizationId]);

    // Get total partner count and health distribution
    const countQuery = `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(*) FILTER (WHERE relationship_health_score >= 80) as excellent,
        COUNT(*) FILTER (WHERE relationship_health_score >= 60 AND relationship_health_score < 80) as healthy,
        COUNT(*) FILTER (WHERE relationship_health_score >= 40 AND relationship_health_score < 60) as needs_attention,
        COUNT(*) FILTER (WHERE relationship_health_score < 40) as at_risk
      FROM partners
      WHERE organization_id = $1
    `;

    const countResult = await query(countQuery, [organizationId]);

    const topPerformingPartners = result.rows.map(row => ({
      partnerId: row.id,
      partnerName: row.name,
      revenue: parseFloat(row.revenue),
      opportunityCount: parseInt(row.opportunity_count),
      healthScore: parseInt(row.relationship_health_score),
      lastInteraction: new Date() // TODO: Track actual interactions
    }));

    const counts = countResult.rows[0];
    const healthDistribution = {
      excellent: parseInt(counts.excellent) || 0,
      healthy: parseInt(counts.healthy) || 0,
      needs_attention: parseInt(counts.needs_attention) || 0,
      at_risk: parseInt(counts.at_risk) || 0
    };

    return {
      totalPartners: parseInt(counts.total) || 0,
      activePartners: parseInt(counts.active) || 0,
      healthDistribution,
      topPerformingPartners,
      relationshipMaintenanceAlerts: parseInt(counts.needs_attention) + parseInt(counts.at_risk)
    };
  }

  private async getAlertSummary(userId: string, organizationId: string) {
    const alertQuery = `
      SELECT
        type,
        priority,
        COUNT(*) as count,
        MAX(created_at) as most_recent_date
      FROM alerts
      WHERE organization_id = $1 AND is_acknowledged = false
        AND (user_id = $2 OR user_id IS NULL)
      GROUP BY type, priority
      ORDER BY priority DESC, count DESC
    `;

    const result = await query(alertQuery, [organizationId, userId]);

    return result.rows.map(row => ({
      type: row.type,
      priority: row.priority,
      count: parseInt(row.count),
      mostRecentDate: new Date(row.most_recent_date)
    }));
  }
}