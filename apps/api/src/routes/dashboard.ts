import { Router } from 'express';
import { getKPIs, getRevenueProgress, getPipelineFunnel, getTeamPerformance } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authentication.js';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// Dashboard KPIs endpoint
router.get('/kpis', getKPIs);

// Revenue progress endpoint
router.get('/revenue', getRevenueProgress);

// Pipeline funnel endpoint
router.get('/pipeline', getPipelineFunnel);

// Team performance endpoint
router.get('/team', getTeamPerformance);

export { router as dashboardRoutes };