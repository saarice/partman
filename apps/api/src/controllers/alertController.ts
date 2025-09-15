import { Request, Response } from 'express';
import { AlertService, AlertType, AlertPriority } from '../services/alertService.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const alertService = new AlertService();

export const getAlerts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const includeAcknowledged = req.query.include_acknowledged === 'true';
  const limit = parseInt(req.query.limit as string) || 50;

  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  const alerts = await alertService.getAlertsForUser(userId, includeAcknowledged, limit);

  res.json({
    status: 'success',
    data: alerts,
    count: alerts.length
  });
});

export const getAlertSummary = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  const summary = await alertService.getAlertSummary(userId);

  res.json({
    status: 'success',
    data: summary
  });
});

export const acknowledgeAlert = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const alertId = req.params.alertId;

  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  if (!alertId) {
    throw createError('Alert ID is required', 400);
  }

  const success = await alertService.acknowledgeAlert(alertId, userId);

  if (!success) {
    throw createError('Alert not found or already acknowledged', 404);
  }

  res.json({
    status: 'success',
    message: 'Alert acknowledged successfully'
  });
});

export const acknowledgeMultipleAlerts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { alertIds } = req.body;

  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  if (!Array.isArray(alertIds) || alertIds.length === 0) {
    throw createError('Alert IDs array is required', 400);
  }

  const acknowledgedCount = await alertService.acknowledgeMultipleAlerts(alertIds, userId);

  res.json({
    status: 'success',
    data: {
      acknowledgedCount,
      requestedCount: alertIds.length
    },
    message: `${acknowledgedCount} alerts acknowledged successfully`
  });
});

export const createAlert = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { type, priority, title, message, entityId, targetUserId } = req.body;

  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  // Validate required fields
  if (!type || !priority || !title || !message) {
    throw createError('Type, priority, title, and message are required', 400);
  }

  // Validate enum values
  if (!Object.values(AlertType).includes(type)) {
    throw createError('Invalid alert type', 400);
  }

  if (!Object.values(AlertPriority).includes(priority)) {
    throw createError('Invalid alert priority', 400);
  }

  const alert = await alertService.createAlert(
    targetUserId || userId,
    type,
    priority,
    title,
    message,
    entityId
  );

  res.status(201).json({
    status: 'success',
    data: alert,
    message: 'Alert created successfully'
  });
});

export const generateAlerts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  // Only VPs can trigger alert generation
  if (userRole !== 'vp') {
    throw createError('Insufficient permissions', 403);
  }

  logger.info(`Manual alert generation triggered by user ${userId}`);

  // Run alert generation in background
  setImmediate(() => {
    alertService.runAlertGeneration().catch(error => {
      logger.error('Background alert generation failed:', error);
    });
  });

  res.json({
    status: 'success',
    message: 'Alert generation started in background'
  });
});

export const getAlertStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  // Get alert statistics for dashboard
  const stats = await alertService.getAlertSummary(userId);

  const totalAlerts = stats.reduce((sum, stat) => sum + stat.count, 0);
  const urgentAlerts = stats
    .filter(stat => stat.priority === 'urgent')
    .reduce((sum, stat) => sum + stat.count, 0);
  const highPriorityAlerts = stats
    .filter(stat => stat.priority === 'high')
    .reduce((sum, stat) => sum + stat.count, 0);

  res.json({
    status: 'success',
    data: {
      totalAlerts,
      urgentAlerts,
      highPriorityAlerts,
      breakdown: stats
    }
  });
});