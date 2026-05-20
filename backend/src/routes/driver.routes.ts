import { Router, Request, Response } from 'express';
import { getNearbyDrivers, getAllDrivers, getNearbyDriversMock } from '../services/driver.service';
import prisma from '../config/db';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { driverProfileService } from '../services/driverProfile.service';

const router = Router();

/**
 * API: GET /api/drivers/nearby?lng=...&lat=...&radius=...
 * 
 * Task 18: Extract drivers within 3km radius
 * - Receive passenger's GPS coordinates (lng, lat)
 * - Return list of "Online" + "Available" drivers within 3km
 * - Sorted by distance in ascending order
 * 
 * Query params:
 *   lng    - Passenger longitude (required)
 *   lat    - Passenger latitude (required)
 *   radius - Search radius in meters (optional, default 3000)
 */
router.get('/nearby', async (req: Request, res: Response) => {
  try {
    const { lng, lat, radius } = req.query;

    // Coordinate validation
    if (!lng || !lat) {
      res.status(400).json({
        success: false,
        message: 'Coordinates missing. Please provide lng and lat.',
      });
      return;
    }

    const longitude = parseFloat(lng as string);
    const latitude = parseFloat(lat as string);
    const radiusInMeters = radius ? parseInt(radius as string) : 3000;

    // Validate coordinate values
    if (isNaN(longitude) || isNaN(latitude)) {
      res.status(400).json({
        success: false,
        message: 'Invalid coordinates. lng and lat must be numbers.',
      });
      return;
    }

    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      res.status(400).json({
        success: false,
        message: 'Coordinates out of allowed range.',
      });
      return;
    }

    const drivers = await getNearbyDrivers(longitude, latitude, radiusInMeters);

    // Format response data for FE
    const formattedDrivers = drivers.map(driver => ({
      id: driver.user_id,
      name: driver.full_name,
      car: driver.vehicle_infor,
      vehicleType: driver.vehicle_type,
      distance: `${(Number(driver.distance) / 1000).toFixed(1)} KM`,
      distanceMeters: Number(driver.distance),
      time: `${Math.max(1, Math.ceil(Number(driver.distance) / 500))} min`,
      rating: Number(driver.average_rating),
      avatar: driver.avatar_picture || 'https://placehold.co/80x80',
      // Calculate estimated price based on distance
      price: calculateEstimatedPrice(Number(driver.distance)),
    }));

    res.status(200).json({
      success: true,
      data: formattedDrivers,
      meta: {
        total: formattedDrivers.length,
        radiusKm: radiusInMeters / 1000,
        searchLocation: { lng: longitude, lat: latitude },
      }
    });
  } catch (error) {
    console.error('Nearby driver search API error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching for nearby drivers.',
    });
  }
});

/**
 * API: GET /api/drivers
 * Returns all real drivers from DB (fallback when GPS is not available)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const drivers = await getAllDrivers();

    const formattedDrivers = drivers.map(driver => ({
      id: driver.user_id,
      name: driver.full_name,
      car: driver.vehicle_infor,
      vehicleType: driver.vehicle_type,
      distance: driver.distance > 0 ? `${(driver.distance / 1000).toFixed(1)} KM` : 'N/A',
      distanceMeters: driver.distance,
      time: driver.distance > 0 ? `${Math.max(1, Math.ceil(driver.distance / 500))} min` : '--',
      rating: Number(driver.average_rating),
      avatar: driver.avatar_picture || 'https://placehold.co/80x80',
      price: calculateEstimatedPrice(driver.distance > 0 ? driver.distance : 5000), // Default 5km for price if no distance
    }));

    res.status(200).json({
      success: true,
      data: formattedDrivers,
      meta: {
        total: formattedDrivers.length,
        isMock: false,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching driver list.',
    });
  }
});

/**
 * Calculate estimated price based on distance
 * Formula: Base fare (30,000 VND) + 12,000 VND/km
 */
function calculateEstimatedPrice(distanceInMeters: number): string {
  const baseFare = 30000; // 30,000 VND
  const perKmRate = 12000; // 12,000 VND/km
  const distanceKm = distanceInMeters / 1000;
  const totalFare = baseFare + (perKmRate * distanceKm);
  
  // Format as "xxxk" 
  return `${Math.round(totalFare / 1000)}k`;
}

/**
 * API: GET /api/drivers/admin/pending
 * Returns all unapproved drivers from DB
 */
router.get('/admin/pending', async (req: Request, res: Response) => {
  try {
    const pendingDrivers = await prisma.driverProfile.findMany({
      where: { isApproved: false },
      include: {
        profile: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: pendingDrivers,
    });
  } catch (error) {
    console.error('Error fetching pending drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending drivers.',
    });
  }
});

/**
 * API: PUT /api/drivers/admin/approve/:userId
 * Sets isApproved to true for a driver
 */
router.put('/admin/approve/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const updated = await prisma.driverProfile.update({
      where: { userId: userId as string },
      data: { isApproved: true },
    });

    res.status(200).json({
      success: true,
      message: 'Driver approved successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('Error approving driver:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving driver.',
    });
  }
});

/**
 * API: PUT /api/drivers/status
 * Updates driver's online/offline status and current GPS location.
 * Requires driver authentication.
 */
router.put('/status', authMiddleware as any, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { isOnline, lat, lng } = req.body;

    const updateData: any = {};
    if (isOnline !== undefined) {
      updateData.isOnline = Boolean(isOnline);
      // Reset isBusy to false to make the driver searchable again
      if (updateData.isOnline) {
        updateData.isBusy = false;
      }
    }
    if (lat !== undefined) updateData.lat = Number(lat);
    if (lng !== undefined) updateData.lng = Number(lng);

    const updated = await driverProfileService.updateDriverProfile(userId, updateData);

    res.status(200).json({
      success: true,
      message: 'Driver status updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating driver status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating driver status.',
    });
  }
});

export default router;