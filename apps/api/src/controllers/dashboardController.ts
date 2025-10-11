import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const dashboardService = new DashboardService();

export const getKPIs = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId || req.user?.id;
  const organizationId = req.user?.organizationId;

  if (!userId || !organizationId) {
    throw createError('User not authenticated', 401);
  }

  logger.info(`Dashboard KPIs requested by user ${userId}`);

  const kpis = await dashboardService.getKPIs(userId, organizationId);

  res.json({
    status: 'success',
    data: kpis,
    timestamp: new Date().toISOString()
  });
});

export const getRevenueProgress = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  // Mock revenue progress data
  const revenueProgress = {
    currentQuarter: {
      target: 250000,
      actual: 187500,
      progress: 75,
      onTrack: true
    },
    monthlyBreakdown: [
      { month: 'January', actual: 82000, target: 83333 },
      { month: 'February', actual: 75000, target: 83333 },
      { month: 'March', actual: 30500, target: 83333 }
    ],
    forecastAccuracy: 92
  };

  res.json({
    status: 'success',
    data: revenueProgress
  });
});

export const getPipelineFunnel = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  // Mock pipeline funnel data
  const pipelineFunnel = {
    stages: [
      { stage: 'lead', name: 'Lead', count: 45, value: 2250000, probability: 10 },
      { stage: 'demo', name: 'Demo', count: 28, value: 1400000, probability: 25 },
      { stage: 'poc', name: 'POC', count: 18, value: 900000, probability: 50 },
      { stage: 'proposal', name: 'Proposal', count: 12, value: 600000, probability: 75 },
    ],
    conversionRates: {
      'lead-demo': 62,
      'demo-poc': 64,
      'poc-proposal': 67,
      'proposal-closed': 75
    },
    averageSalesCycle: 45
  };

  res.json({
    status: 'success',
    data: pipelineFunnel
  });
});

export const getTeamPerformance = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  // Mock team performance data
  const teamPerformance = {
    overview: {
      totalMembers: 8,
      activeOpportunities: 103,
      completedTasksThisWeek: 42,
      weeklyStatusCompliance: 95
    },
    members: [
      {
        id: '1',
        name: 'Sarah Johnson',
        revenue: 145000,
        activeOpportunities: 15,
        taskCompletionRate: 92,
        goalProgress: 87,
        status: 'on-track'
      },
      {
        id: '2',
        name: 'Mike Chen',
        revenue: 128000,
        activeOpportunities: 12,
        taskCompletionRate: 88,
        goalProgress: 76,
        status: 'on-track'
      },
      {
        id: '3',
        name: 'Emily Davis',
        revenue: 156000,
        activeOpportunities: 18,
        taskCompletionRate: 95,
        goalProgress: 93,
        status: 'exceeding'
      }
    ]
  };

  res.json({
    status: 'success',
    data: teamPerformance
  });
});