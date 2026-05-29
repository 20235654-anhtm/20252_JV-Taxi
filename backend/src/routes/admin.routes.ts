import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { getUsers, blockUser, unblockUser, getPendingDrivers, approveDriver, rejectDriver } from '../controllers/admin.controller';

const router = Router();

// Áp dụng lớp bảo vệ kép cho tất cả các endpoint bên dưới
router.use(authMiddleware as any);
router.use(adminMiddleware as any);

/**
 * @route   GET /api/admin/users
 * @desc    Lấy danh sách người dùng kèm bộ lọc và phân trang
 * @access  Private (Admin)
 */
router.get('/users', getUsers as any);

/**
 * @route   POST /api/admin/users/:id/block
 * @desc    Khóa tài khoản người dùng/tài xế
 * @access  Private (Admin)
 */
router.post('/users/:id/block', blockUser as any);

/**
 * @route   POST /api/admin/users/:id/unblock
 * @desc    Mở khóa tài khoản người dùng/tài xế
 * @access  Private (Admin)
 */
router.post('/users/:id/unblock', unblockUser as any);

/**
 * @route   GET /api/admin/drivers/pending
 * @desc    Lấy danh sách tài xế đang chờ duyệt
 * @access  Private (Admin)
 */
router.get('/drivers/pending', getPendingDrivers as any);

/**
 * @route   POST /api/admin/drivers/:id/approve
 * @desc    Phê duyệt tài xế
 * @access  Private (Admin)
 */
router.post('/drivers/:id/approve', approveDriver as any);

/**
 * @route   POST /api/admin/drivers/:id/reject
 * @desc    Từ chối tài xế
 * @access  Private (Admin)
 */
router.post('/drivers/:id/reject', rejectDriver as any);

export default router;
