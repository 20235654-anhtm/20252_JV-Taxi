import { Router } from 'express';
import { estimateFare } from '../controllers/fare.controller';

const router = Router();

// Endpoint tính cước phí ước tính và ETA dựa trên OSRM
router.post('/estimate', estimateFare);

export default router;
