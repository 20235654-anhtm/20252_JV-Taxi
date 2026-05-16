import { Router, Request, Response } from 'express';
import { rideService } from '../services/ride.service';
import prisma from '../config/db';
import { getIO } from '../socket/io';

const router = Router();

/**
 * POST /api/rides
 * Khách hàng tạo chuyến đi mới (Designated Driver mode)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      passengerId,
      driverId,
      startAddress,
      endAddress,
      startLng,
      startLat,
      endLng,
      endLat,
      matchFee,
      vehicleTypeRequested,
    } = req.body;

    if (!passengerId || !startAddress || !endAddress) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc.' });
    }

    const ride = await rideService.createRide({
      passengerId,
      driverId,
      startAddress,
      endAddress,
      startLng,
      startLat,
      endLng,
      endLat,
      matchFee,
      matchType: driverId ? 'DESIGNATED' : 'AUTO',
      vehicleTypeRequested,
    });

    // Notify driver via Socket.io if designated
    if (driverId) {
      const passenger = await prisma.profile.findUnique({
        where: { id: passengerId },
        select: { fullName: true, phone: true },
      });

      const io = getIO();
      io.to(`driver:${driverId}`).emit('new_ride_request', {
        rideId: ride.id,
        passengerId,
        passengerName: passenger?.fullName || 'Hành khách',
        passengerPhone: passenger?.phone || '',
        startAddress,
        endAddress,
        matchFee,
        vehicleTypeRequested,
      });
    }

    return res.status(201).json({ success: true, data: ride });
  } catch (error) {
    console.error('Create ride error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tạo chuyến đi.' });
  }
});

/**
 * PUT /api/rides/:id/status
 * Tài xế cập nhật trạng thái chuyến (ACCEPTED / REJECTED)
 */
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, driverId } = req.body;

    if (!['ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
    }

    const ride = await rideService.updateRideStatus(id as string, status);

    const io = getIO();

    if (status === 'ACCEPTED') {
      // Fetch driver info to send back to passenger
      const driver = await prisma.profile.findUnique({
        where: { id: driverId },
        select: {
          fullName: true,
          phone: true,
          driverProfile: {
            select: {
              vehicleInfor: true,
              vehicleType: true,
              averageRating: true,
              avatarPicture: true,
            },
          },
        },
      });

      // Notify passenger
      io.to(`user:${ride.passengerId}`).emit('ride_status_updated', {
        rideId: id,
        status: 'ACCEPTED',
        driver: {
          id: driverId,
          name: driver?.fullName,
          phone: driver?.phone,
          car: driver?.driverProfile?.vehicleInfor,
          vehicleType: driver?.driverProfile?.vehicleType,
          rating: Number(driver?.driverProfile?.averageRating),
          avatar: driver?.driverProfile?.avatarPicture,
        },
      });
    } else if (status === 'REJECTED') {
      io.to(`user:${ride.passengerId}`).emit('ride_status_updated', {
        rideId: id,
        status: 'REJECTED',
      });
    }

    return res.status(200).json({ success: true, data: ride });
  } catch (error) {
    console.error('Update ride status error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật trạng thái.' });
  }
});

/**
 * GET /api/rides/:id
 * Lấy thông tin chuyến đi
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const ride = await rideService.getRideById(req.params.id as string);
    if (!ride) return res.status(404).json({ success: false, message: 'Không tìm thấy chuyến đi.' });
    return res.status(200).json({ success: true, data: ride });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

export default router;
