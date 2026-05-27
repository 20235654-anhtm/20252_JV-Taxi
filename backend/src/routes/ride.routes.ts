import { Router, Response } from 'express';
import prisma from '../config/db';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { rideService } from '../services/ride.service';
import { io, userSocketMap } from '../index';
import { refundPayment } from '../controllers/payment.controller';
import { fareService } from '../services/fare.service';

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
      vehicleTypeRequested,
      paymentType,
      stripePaymentId,
      distance
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

    // Create Payment record
    const payment = await prisma.payment.create({
      data: {
        rideId: ride.id,
        totalAmount: Number(matchFee || 145000),
        paymentType: paymentType || 'CASH',
        stripePaymentId: stripePaymentId || null,
        status: paymentType === 'CARD' ? 'SUCCESS' : 'PENDING',
      }
    });

    // Query Passenger details
    const passenger = await prisma.profile.findUnique({
      where: { id: passengerId }
    });

    let distanceStr = distance || '...';
    if (driverId) {
      try {
        const drivers = await prisma.$queryRaw<any[]>`
          SELECT ST_Distance("current_location", ST_SetSRID(ST_MakePoint(${Number(startLng || 105.8542)}, ${Number(startLat || 21.0285)}), 4326)::geography) as distance
          FROM "driver_profiles"
          WHERE "user_id" = ${driverId}::uuid
        `;
        if (drivers && drivers.length > 0 && drivers[0].distance != null) {
          const distanceVal = Number(drivers[0].distance);
          distanceStr = distanceVal < 1000 ? `${Math.round(distanceVal)} m` : `${(distanceVal / 1000).toFixed(1)} km`;
        }
      } catch (e) {
        console.error('Error calculating distance:', e);
      }
    }

    let durationStr = '...';
    try {
      const routeData = await fareService.getRouteFromOSRM(
        Number(startLng || 105.8542),
        Number(startLat || 21.0285),
        Number(endLng || 105.8542),
        Number(endLat || 21.0285)
      );
      const totalMinutes = Math.round(routeData.durationInSeconds / 60);
      durationStr = `約${totalMinutes}分`;
    } catch (e) {
      console.error('Error calculating duration ETA:', e);
    }

    // Notify Driver via Socket.io
    if (driverId) {
      const driverSocketId = userSocketMap.get(driverId);
      if (driverSocketId) {
        io.to(driverSocketId).emit('incoming-booking', {
          rideId: ride.id,
          passengerId: passenger?.id || ride.passengerId,
          passengerName: passenger?.fullName || '...',
          passengerAvatar: passenger?.avatar || '...',
          pickupLocation: ride.start_address,
          destinationLocation: ride.end_address,
          startLat: Number(startLat || 21.0285),
          startLng: Number(startLng || 105.8542),
          endLat: Number(endLat || 21.0125),
          endLng: Number(endLng || 105.8425),
          distanceToPickup: distanceStr,
          estimatedFare: `${Math.round(Number(ride.match_fee) / 1000)}k VND`,
          duration: durationStr,
          paymentMethod: paymentType === 'CARD' ? 'Thẻ' : 'Tiền mặt'
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
            name: driverProfile?.fullName || '...',
            avatar: driverProfile?.driverProfile?.avatarPicture || '...',
            rating: driverProfile?.driverProfile?.averageRating ? String(driverProfile.driverProfile.averageRating) : '...',
            car: (() => {
              const info = driverProfile?.driverProfile?.vehicleInfor;
              if (!info) return '...';
              try {
                return JSON.parse(info).model || '...';
              } catch (e) {
                const parts = info.split(' • ');
                return parts[0] || info;
              }
            })(),
            vehicleType: driverProfile?.driverProfile?.vehicleType || '...',
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

    // Refund logic if CARD
    const payment = await prisma.payment.findUnique({
      where: { rideId }
    });

    if (payment && payment.paymentType === 'CARD' && payment.stripePaymentId) {
      await refundPayment(payment.stripePaymentId);
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });
      console.log(`💸 Refunded Stripe Payment: ${payment.stripePaymentId} for Ride: ${rideId}`);
    } else if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });
    }

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

/**
 * POST /api/rides/cancel
 * Passenger cancels the pending ride request.
 */
router.post('/cancel', authMiddleware as any, async (req: AuthRequest, res: Response) => {
  try {
    const passengerId = req.user?.userId;
    if (!passengerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { rideId } = req.body;

    // Update Ride status
    const ride = await rideService.updateRideStatus(rideId, 'CANCELLED');

    // Notify Driver via Socket.io
    if (ride.driverId) {
      const driverSocketId = userSocketMap.get(ride.driverId);
      if (driverSocketId) {
        io.to(driverSocketId).emit('booking-cancelled', { rideId });
        console.log(`📡 Booking cancel sent to Driver: ${ride.driverId}`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Ride cancelled successfully.'
    });
  } catch (error) {
    console.error('Error cancelling ride:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling ride.'
    });
  }
});

/**
 * GET /api/rides/passenger/history
 * Fetch the ride history of the authenticated passenger.
 */
router.get('/passenger/history', authMiddleware as any, async (req: AuthRequest, res: Response) => {
  try {
    const passengerId = req.user?.userId;
    if (!passengerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);
    const skip = (page - 1) * limit;

    // Get rides count
    const totalRides = await prisma.ride.count({
      where: { passengerId }
    });

    // Get rides
    const rides = await prisma.ride.findMany({
      where: { passengerId },
      include: {
        payment: true,
        driver: {
          include: {
            driverProfile: true
          }
        },
        reviews: {
          where: { reviewerId: passengerId }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // PostGIS location coordinates
    const ridesWithCoords = await Promise.all(rides.map(async (ride) => {
      let startLat = null;
      let startLng = null;
      let endLat = null;
      let endLng = null;

      try {
        const coords = await prisma.$queryRaw<any[]>`
          SELECT 
            ST_X(start_location::geometry) as start_lng,
            ST_Y(start_location::geometry) as start_lat,
            ST_X(end_location::geometry) as end_lng,
            ST_Y(end_location::geometry) as end_lat
          FROM "rides"
          WHERE "id" = ${ride.id}::uuid
        `;
        if (coords && coords.length > 0) {
          startLng = coords[0].start_lng;
          startLat = coords[0].start_lat;
          endLng = coords[0].end_lng;
          endLat = coords[0].end_lat;
        }
      } catch (err) {
        console.error(`Error fetching coords for ride ${ride.id}:`, err);
      }

      return {
        ...ride,
        startLat,
        startLng,
        endLat,
        endLng
      };
    }));

    res.status(200).json({
      success: true,
      data: ridesWithCoords,
      pagination: {
        total: totalRides,
        page,
        limit,
        hasMore: skip + rides.length < totalRides
      }
    });
  } catch (error) {
    console.error('Error fetching passenger ride history:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching history.' });
  }
});

/**
 * GET /api/rides/:id
 * Get details of a specific ride by its ID (includes payment details)
 */
router.get('/:id', authMiddleware as any, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const ride = await prisma.ride.findUnique({
      where: { id },
      include: {
        payment: true,
        driver: {
          include: {
            driverProfile: true
          }
        },
        passenger: true,
        reviews: true
      }
    }) as any;

    if (!ride) {
      res.status(404).json({ success: false, message: 'Ride not found' });
      return;
    }

    // Fetch ride start and end coordinates from PostGIS
    try {
      const rideCoords = await prisma.$queryRaw<any[]>`
        SELECT 
          ST_X(start_location::geometry) as start_lng,
          ST_Y(start_location::geometry) as start_lat,
          ST_X(end_location::geometry) as end_lng,
          ST_Y(end_location::geometry) as end_lat
        FROM "rides"
        WHERE "id" = ${id}::uuid
      `;
      if (rideCoords && rideCoords.length > 0) {
        ride.startLat = rideCoords[0].start_lat;
        ride.startLng = rideCoords[0].start_lng;
        ride.endLat = rideCoords[0].end_lat;
        ride.endLng = rideCoords[0].end_lng;
      }
    } catch (err) {
      console.error('Error fetching ride start/end location coordinates:', err);
    }

    if (ride.driverId && ride.driver && ride.driver.driverProfile) {
      try {
        const coords = await prisma.$queryRaw<any[]>`
          SELECT 
            ST_X(current_location::geometry) as lng,
            ST_Y(current_location::geometry) as lat
          FROM "driver_profiles"
          WHERE "user_id" = ${ride.driverId}::uuid
        `;
        if (coords && coords.length > 0) {
          ride.driver.driverProfile.lat = coords[0].lat;
          ride.driver.driverProfile.lng = coords[0].lng;
        }
      } catch (err) {
        console.error('Error fetching driver current location coordinates:', err);
      }
    }

    res.status(200).json({
      success: true,
      data: ride
    });
  } catch (error) {
    console.error('Error fetching ride details:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching ride details.' });
  }
});

/**
 * POST /api/rides/complete
 * Driver completes the active ride, sets their status to free, updates payment, and notifies passenger.
 */
router.post('/complete', authMiddleware as any, async (req: AuthRequest, res: Response) => {
  try {
    const driverId = req.user?.userId;
    if (!driverId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { rideId } = req.body;
    if (!rideId) {
      res.status(400).json({ success: false, message: 'Ride ID is required' });
      return;
    }

    // Update Ride status to COMPLETED
    const ride = await rideService.updateRideStatus(rideId, 'COMPLETED');

    // Set driver status to free (isBusy: false)
    await prisma.driverProfile.update({
      where: { userId: driverId },
      data: { isBusy: false }
    });

    // Update Payment status to SUCCESS
    await prisma.payment.updateMany({
      where: { rideId },
      data: { status: 'SUCCESS' }
    });

    // Notify Passenger via Socket.io
    if (ride.passengerId) {
      const passengerSocketId = userSocketMap.get(ride.passengerId);
      if (passengerSocketId) {
        io.to(passengerSocketId).emit('ride-completed', {
          rideId
        });
        console.log(`📡 Ride completion sent to Passenger: ${ride.passengerId}`);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Ride completed successfully.',
      data: ride
    });
  } catch (error) {
    console.error('Error completing ride:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing ride.'
    });
  }
});

export default router;
