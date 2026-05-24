import { Router, Request, Response } from 'express';
import prisma from '../config/db';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

/**
 * Lấy lịch sử tin nhắn của một chuyến đi
 */
router.get('/:rideId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const rideId = req.params.rideId as string;
    
    // Kiểm tra xem rideId có hợp lệ không (có tồn tại không)
    const ride = await prisma.ride.findUnique({
      where: { id: rideId }
    });

    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { rideId },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
