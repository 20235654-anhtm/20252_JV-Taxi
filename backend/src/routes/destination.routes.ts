import { Router } from 'express';
import { getRecentDestinations } from '../controllers/destination.controller';

const router = Router();

// Endpoint: GET /api/destinations/recent
router.get('/recent', getRecentDestinations);

export default router;