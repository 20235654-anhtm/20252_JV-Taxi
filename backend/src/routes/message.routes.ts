import { Router, Request, Response } from 'express';
import prisma from '../config/db';

const router = Router();

/**
 * GET /api/messages/:rideId
 * Lấy lịch sử tin nhắn của một chuyến đi
 */
router.get('/:rideId', async (req: Request, res: Response) => {
  try {
    const rideId = req.params.rideId as string;

    // Fetch messages with sender info using raw query to avoid Prisma relation issues
    const messages = await prisma.$queryRaw<Array<{
      id: string;
      ride_id: string;
      sender_id: string;
      full_name: string | null;
      content: string;
      created_at: Date;
    }>>`
      SELECT m.id, m.ride_id, m.sender_id, p.full_name, m.content, m.created_at
      FROM "messages" m
      JOIN "profiles" p ON p.id = m.sender_id
      WHERE m.ride_id = ${rideId}::uuid
      ORDER BY m.created_at ASC
    `;

    return res.status(200).json({
      success: true,
      data: messages.map((m) => ({
        id: m.id,
        rideId: m.ride_id,
        senderId: m.sender_id,
        senderName: m.full_name,
        content: m.content,
        createdAt: m.created_at,
      })),
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy tin nhắn.' });
  }
});

export default router;
