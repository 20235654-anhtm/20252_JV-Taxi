import express from 'express';
import { loginPassenger } from '../controllers/auth.controller';

const router = express.Router();

router.post('/login', loginPassenger);

export default router;
