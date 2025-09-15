import { Router } from 'express';
import {
  getAlerts,
  getAlertSummary,
  acknowledgeAlert,
  acknowledgeMultipleAlerts,
  createAlert,
  generateAlerts,
  getAlertStats
} from '../controllers/alertController.js';
import { authenticate } from '../middleware/authentication.js';

const router = Router();

// All alert routes require authentication
router.use(authenticate);

// Get user's alerts
router.get('/', getAlerts);

// Get alert summary for dashboard
router.get('/summary', getAlertSummary);

// Get alert statistics
router.get('/stats', getAlertStats);

// Acknowledge a single alert
router.patch('/:alertId/acknowledge', acknowledgeAlert);

// Acknowledge multiple alerts
router.patch('/acknowledge-multiple', acknowledgeMultipleAlerts);

// Create a new alert (for testing or manual creation)
router.post('/', createAlert);

// Generate alerts (manual trigger, VP only)
router.post('/generate', generateAlerts);

export { router as alertRoutes };