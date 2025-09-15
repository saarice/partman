import { Router } from 'express';
import { authenticate } from '../middleware/authentication.js';

const router = Router();

router.use(authenticate);

// Placeholder partner routes
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    data: [],
    message: 'Partner routes not implemented yet'
  });
});

export { router as partnerRoutes };