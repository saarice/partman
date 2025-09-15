import { Router } from 'express';
import { authenticate } from '../middleware/authentication.js';

const router = Router();

router.use(authenticate);

// Placeholder opportunity routes
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    data: [],
    message: 'Opportunity routes not implemented yet'
  });
});

export { router as opportunityRoutes };