import { Request, Response } from 'express';
import { RideStatus } from '@prisma/client';
import db from '../config/db';

export const getRecentDestinations = async (
  req: Request,
  res: Response
) => {
  try {
    const passengerId = req.query.userId as string;

    if (!passengerId) {
      return res.status(400).json({
        success: false,
        message: 'ユーザーIDが必要です'
      });
    }

    const rides = await db.ride.findMany({
      where: {
        passengerId: passengerId,
        status: RideStatus.COMPLETED
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        endAddress: true,
        createdAt: true
      }
    });

    // remove duplicate destinations
    const uniqueDestinations = rides.filter(
      (ride, index, self) =>
        index ===
        self.findIndex(
          (r) => r.endAddress === ride.endAddress
        )
    );

    // max 3 results
    const recentDestinations = uniqueDestinations.slice(0, 3);

    return res.status(200).json({
      success: true,
      data: recentDestinations
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};