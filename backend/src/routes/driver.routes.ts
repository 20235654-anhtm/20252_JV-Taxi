import { Router, Request, Response } from 'express';
import { getNearbyDrivers } from '../services/driver.service';

const router = Router();

// Định nghĩa API: GET /api/drivers
router.get('/', async (req: Request, res: Response) => {
  try {
    const drivers = await getNearbyDrivers();
    
    // Trả dữ liệu về cho Frontend dưới dạng JSON
    res.status(200).json({
      success: true,
      data: drivers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách tài xế',
    });
  }
});

export default router;