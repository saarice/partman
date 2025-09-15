export interface DashboardKPIs {
    revenue: RevenueKPIs;
    pipeline: PipelineKPIs;
    team: TeamKPIs;
    partners: PartnerKPIs;
    alerts: AlertSummary[];
}
export interface RevenueKPIs {
    currentQuarterTarget: number;
    currentQuarterActual: number;
    currentQuarterProgress: number;
    previousQuarterActual: number;
    yearToDateActual: number;
    forecastedQuarterEnd: number;
}
export interface PipelineKPIs {
    totalWeightedValue: number;
    totalOpportunities: number;
    conversionRateByStage: Record<string, number>;
    averageDealSize: number;
    averageSalesCycle: number;
    stageDistribution: Record<string, {
        count: number;
        value: number;
    }>;
}
export interface TeamKPIs {
    totalMembers: number;
    activeOpportunities: number;
    completedTasksThisWeek: number;
    teamPerformance: TeamMemberPerformance[];
    weeklyStatusCompliance: number;
}
export interface TeamMemberPerformance {
    userId: string;
    userName: string;
    revenue: number;
    activeOpportunities: number;
    taskCompletionRate: number;
    goalProgress: number;
    lastActivityDate: Date;
}
export interface PartnerKPIs {
    totalPartners: number;
    activePartners: number;
    healthDistribution: Record<string, number>;
    topPerformingPartners: PartnerPerformance[];
    relationshipMaintenanceAlerts: number;
}
export interface PartnerPerformance {
    partnerId: string;
    partnerName: string;
    revenue: number;
    opportunityCount: number;
    healthScore: number;
    lastInteraction: Date;
}
export interface AlertSummary {
    type: AlertType;
    priority: AlertPriority;
    count: number;
    mostRecentDate: Date;
}
export declare enum AlertType {
    OPPORTUNITY = "opportunity",
    PARTNER = "partner",
    GOAL = "goal",
    TASK = "task",
    COMMISSION = "commission"
}
export declare enum AlertPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
//# sourceMappingURL=dashboard.d.ts.map