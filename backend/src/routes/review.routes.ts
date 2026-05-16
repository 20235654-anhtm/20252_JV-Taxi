import { Router } from 'express';
import { createReview, getReviewsByDriver } from '../controllers/review.controller';

const router = Router();

// POST /api/reviews - Gửi đánh giá mới
router.post('/', createReview);

// GET /api/reviews/driver/:driverId - Lấy danh sách đánh giá của tài xế
router.get('/driver/:driverId', getReviewsByDriver);

export default router;
