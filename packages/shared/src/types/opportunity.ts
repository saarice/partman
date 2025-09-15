export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  customerId: string;
  customerName: string;
  partnerId: string;
  assignedUserId: string;
  stage: PipelineStage;
  value: number;
  probability: number;
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  stageHistory: OpportunityStageHistory[];
}

export interface OpportunityStageHistory {
  id: string;
  opportunityId: string;
  stage: PipelineStage;
  previousStage?: PipelineStage;
  changedAt: Date;
  changedBy: string;
  notes?: string;
}

export enum PipelineStage {
  LEAD = 'lead',
  DEMO = 'demo',
  POC = 'poc',
  PROPOSAL = 'proposal',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost'
}

export interface PipelineStageConfig {
  stage: PipelineStage;
  order: number;
  probability: number;
  color: string;
  name: string;
}

export interface PipelineForecast {
  totalWeightedValue: number;
  totalOpportunities: number;
  stageBreakdown: Record<PipelineStage, {
    count: number;
    totalValue: number;
    weightedValue: number;
  }>;
  confidenceInterval: {
    low: number;
    high: number;
  };
}