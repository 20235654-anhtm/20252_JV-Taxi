import { Router, Response } from 'express';
import prisma from '../config/db';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { rideService } from '../services/ride.service';
import { io, userSocketMap } from '../index';

const router = Router();

/**
 * POST /api/rides/create
 * Passenger creates a ride and notifies the selected driver.
 */
router.post('/create', authMiddleware as any, async (req: AuthRequest, res: Response) => {
  try {
    const passengerId = req.user?.userId;
    if (!passengerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { 
      driverId, 
      startAddress, 
      endAddress, 
      startLng, 
      startLat, 
      endLng, 
      endLat, 
      matchFee, 
      matchType, 
      vehicleTypeRequested 
    } = req.body;

    // Create Ride in database
    const ride = await rideService.createRide({
      passengerId,
      driverId,
      startAddress,
      endAddress,
      startLng: Number(startLng || 105.8542),
      startLat: Number(startLat || 21.0285),
      endLng: Number(endLng || 105.8542),
      endLat: Number(endLat || 21.0285),
      matchFee: Number(matchFee || 145000),
      matchType: matchType || 'designated',
      vehicleTypeRequested: vehicleTypeRequested || 'Sedan',
    });

    // Query Passenger details
    const passenger = await prisma.profile.findUnique({
      where: { id: passengerId }
    });

    // Notify Driver via Socket.io
    if (driverId) {
      const driverSocketId = userSocketMap.get(driverId);
      if (driverSocketId) {
        io.to(driverSocketId).emit('incoming-booking', {
          rideId: ride.id,
          passengerName: passenger?.fullName || 'Hành khách',
          passengerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop',
          pickupLocation: ride.start_address,
          destinationLocation: ride.end_address,
          distanceToPickup: '1.2 km',
          estimatedFare: `${Math.round(Number(ride.match_fee) / 1000)}k VND`,
          duration: '約25分',
          paymentMethod: 'Tiền mặt'
        });
        console.log(`📡 Booking notification sent to Driver: ${driverId} via socket ${driverSocketId}`);
      } else {
        console.log(`⚠️ Driver ${driverId} socket not found (offline)`);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Ride created and driver notified successfully.',
      data: ride
    });
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating ride.'
    });
  }
});

/**
 * POST /api/rides/accept
 * Driver accepts the pending ride request.
 */
router.post('/accept', authMiddleware as any, async (req: AuthRequest, res: Response) => {
  try {
    const driverId = req.user?.userId;
    if (!driverId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { rideId } = req.body;

    // Update Ride status in DB
    const ride = await rideService.updateRideStatus(rideId, 'ACCEPTED');

    // Set driver status to busy
    await prisma.driverProfile.update({
      where: { userId: driverId },
      data: { isBusy: true }
    });

    // Query Driver info
    const driverProfile = await prisma.profile.findUnique({
      where: { id: driverId },
      include: { driverProfile: true }
    });

    // Notify Passenger via Socket.io
    if (ride.passengerId) {
      const passengerSocketId = userSocketMap.get(ride.passengerId);
      if (passengerSocketId) {
        io.to(passengerSocketId).emit('booking-accepted', {
          rideId,
          driver: {
            id: driverId,
            name: driverProfile?.fullName || 'Tài xế',
            avatar: driverProfile?.driverProfile?.avatarPicture || 'https://placehold.co/100x100?text=Driver',
            rating: driverProfile?.driverProfile?.averageRating ? String(driverProfile.driverProfile.averageRating) : '5.0',
            car: (() => {
              const info = driverProfile?.driverProfile?.vehicleInfor;
              if (!info) return 'Toyota Vios';
              try {
                return JSON.parse(info).model || 'Toyota Vios';
              } catch (e) {
                const parts = info.split(' • ');
                return parts[0] || info;
              }
            })(),
            vehicleType: driverProfile?.driverProfile?.vehicleType || 'Sedan',
          }
        });
        console.log(`📡 Booking accept sent to Passenger: ${ride.passengerId}`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Ride accepted successfully.',
      data: ride
    });
  } catch (error) {
    console.error('Error accepting ride:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while accepting ride.'
    });
  }
});

/**
 * POST /api/rides/decline
 * Driver declines the pending ride request.
 */
router.post('/decline', authMiddleware as any, async (req: AuthRequest, res: Response) => {
  try {
    const driverId = req.user?.userId;
    if (!driverId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { rideId } = req.body;

    // Update Ride status to REJECTED
    const ride = await rideService.updateRideStatus(rideId, 'REJECTED');

    // Notify Passenger via Socket.io
    if (ride.passengerId) {
      const passengerSocketId = userSocketMap.get(ride.passengerId);
      if (passengerSocketId) {
        io.to(passengerSocketId).emit('booking-rejected', {
          rideId
        });
        console.log(`📡 Booking reject sent to Passenger: ${ride.passengerId}`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Ride declined successfully.',
      data: ride
    });
  } catch (error) {
    console.error('Error declining ride:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while declining ride.'
    });
  }
});

export default router;
