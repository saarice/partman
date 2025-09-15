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
  async getKPIs(userId: string): Promise<DashboardKPIs> {
    try {
      logger.info(`Fetching dashboard KPIs for user ${userId}`);

      const [
        revenueData,
        pipelineData,
        teamData,
        partnerData,
        alertData
      ] = await Promise.all([
        this.getRevenueKPIs(),
        this.getPipelineKPIs(),
        this.getTeamKPIs(),
        this.getPartnerKPIs(),
        this.getAlertSummary(userId)
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

  private async getRevenueKPIs() {
    const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
    const currentYear = new Date().getFullYear();

    // Mock data for now - replace with actual queries
    return {
      currentQuarterTarget: 250000,
      currentQuarterActual: 187500,
      currentQuarterProgress: 75,
      previousQuarterActual: 220000,
      yearToDateActual: 675000,
      forecastedQuarterEnd: 245000
    };
  }

  private async getPipelineKPIs() {
    const pipelineQuery = `
      SELECT
        stage,
        COUNT(*) as count,
        SUM(value) as total_value,
        SUM(value * probability / 100) as weighted_value
      FROM opportunities
      WHERE stage NOT IN ('closed_won', 'closed_lost')
      GROUP BY stage
    `;

    const result = await query(pipelineQuery);

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

  private async getTeamKPIs() {
    const teamQuery = `
      SELECT
        u.id,
        u.first_name || ' ' || u.last_name as name,
        COUNT(DISTINCT o.id) as active_opportunities,
        COALESCE(SUM(o.value), 0) as revenue
      FROM users u
      LEFT JOIN opportunities o ON u.id = o.assigned_user_id
        AND o.stage NOT IN ('closed_won', 'closed_lost')
      WHERE u.role != 'vp'
      GROUP BY u.id, u.first_name, u.last_name
    `;

    const result = await query(teamQuery);

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

  private async getPartnerKPIs() {
    const partnerQuery = `
      SELECT
        p.id,
        p.name,
        p.relationship_health_score,
        COUNT(o.id) as opportunity_count,
        COALESCE(SUM(CASE WHEN o.stage = 'closed_won' THEN o.value ELSE 0 END), 0) as revenue
      FROM partners p
      LEFT JOIN opportunities o ON p.id = o.partner_id
      GROUP BY p.id, p.name, p.relationship_health_score
      ORDER BY revenue DESC
      LIMIT 5
    `;

    const result = await query(partnerQuery);

    const topPerformingPartners = result.rows.map(row => ({
      partnerId: row.id,
      partnerName: row.name,
      revenue: parseFloat(row.revenue),
      opportunityCount: parseInt(row.opportunity_count),
      healthScore: parseInt(row.relationship_health_score),
      lastInteraction: new Date() // mock data
    }));

    // Health distribution mock data
    const healthDistribution = {
      excellent: 5,
      healthy: 12,
      needs_attention: 6,
      at_risk: 2
    };

    return {
      totalPartners: 25,
      activePartners: 23,
      healthDistribution,
      topPerformingPartners,
      relationshipMaintenanceAlerts: 3
    };
  }

  private async getAlertSummary(userId: string) {
    const alertQuery = `
      SELECT
        type,
        priority,
        COUNT(*) as count,
        MAX(created_at) as most_recent_date
      FROM alerts
      WHERE user_id = $1 AND is_acknowledged = false
      GROUP BY type, priority
      ORDER BY priority DESC, count DESC
    `;

    const result = await query(alertQuery, [userId]);

    return result.rows.map(row => ({
      type: row.type,
      priority: row.priority,
      count: parseInt(row.count),
      mostRecentDate: new Date(row.most_recent_date)
    }));
  }
}