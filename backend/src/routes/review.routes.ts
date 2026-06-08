import { Router } from 'express';
import {
  createReview,
  getReviewsByDriver,
  getReviewsByDriverPaginated,
  getStarCountsByDriver,
} from '../controllers/review.controller';

const router = Router();

// POST /api/reviews - Gửi đánh giá mới
router.post('/', createReview);

// GET /api/reviews/driver/:driverId/paginated?page=1&limit=5&star=5 - Lấy đánh giá có phân trang + lọc sao
router.get('/driver/:driverId/paginated', getReviewsByDriverPaginated);

// GET /api/reviews/driver/:driverId/star-counts - Lấy số lượng review theo từng mức sao
router.get('/driver/:driverId/star-counts', getStarCountsByDriver);

// GET /api/reviews/driver/:driverId - Lấy toàn bộ đánh giá (legacy)
router.get('/driver/:driverId', getReviewsByDriver);

export default router;
