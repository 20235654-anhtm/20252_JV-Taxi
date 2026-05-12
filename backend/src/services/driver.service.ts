import prisma from '../config/db';
import { Prisma } from '@prisma/client';

/**
 * Interface for driver data returned from nearby search API
 */
export interface NearbyDriverResult {
  user_id: string;
  full_name: string;
  average_rating: number;
  vehicle_type: string;
  vehicle_infor: string;
  avatar_picture: string | null;
  distance: number; // Distance in meters
}

/**
 * Task 18: Extraction logic for drivers within 3km radius
 * 
 * The system automatically extracts drivers in "Online" and "Available" (not busy) status
 * within a 3km radius from the passenger's location.
 * 
 * Uses PostGIS ST_DWithin to calculate distance (geography).
 * 
 * @param lng - Passenger longitude
 * @param lat - Passenger latitude
 * @param radiusInMeters - Search radius (default 3000m = 3km)
 * @returns List of matching drivers, sorted by distance ascending
 */
export const getNearbyDrivers = async (
  longitude: number,
  latitude: number,
  radiusInMeters: number = 3000
): Promise<NearbyDriverResult[]> => {
  try {
    const drivers = await prisma.$queryRaw<NearbyDriverResult[]>`
      SELECT 
        dp."user_id",
        p."full_name",
        dp."average_rating",
        dp."vehicle_type",
        dp."vehicle_infor",
        dp."avatar_picture",
        ST_Distance(
          dp."current_location", 
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ) as distance
      FROM "driver_profiles" dp
      INNER JOIN "profiles" p ON dp."user_id" = p."id"
      WHERE 
        dp."is_online" = true 
        AND dp."is_busy" = false 
        AND dp."is_approved" = true
        AND dp."current_location" IS NOT NULL
        AND ST_DWithin(
          dp."current_location", 
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, 
          ${radiusInMeters}
        )
      ORDER BY distance ASC;
    `;

    return drivers;
  } catch (error) {
    console.error("Error fetching nearby drivers:", error);
    throw new Error("Could not fetch driver list");
  }
};

/**
 * Fetch all online and available drivers
 */
export const getAllDrivers = async (): Promise<NearbyDriverResult[]> => {
  try {
    const drivers = await prisma.$queryRaw<NearbyDriverResult[]>`
      SELECT 
        dp."user_id",
        p."full_name",
        dp."average_rating",
        dp."vehicle_type",
        dp."vehicle_infor",
        dp."avatar_picture",
        0 as distance
      FROM "driver_profiles" dp
      INNER JOIN "profiles" p ON dp."user_id" = p."id"
      WHERE 
        dp."is_online" = true 
        AND dp."is_busy" = false 
        AND dp."is_approved" = true
      ORDER BY dp."average_rating" DESC;
    `;

    return drivers;
  } catch (error) {
    console.error("Error fetching all drivers:", error);
    throw new Error("Could not fetch driver list");
  }
};

/**
 * Fetch nearby drivers using mock data (for development/testing without DB)
 */
export const getNearbyDriversMock = async (): Promise<any[]> => {
  const mockDrivers = [
    {
      user_id: "mock-1",
      full_name: "Nguyen Tan",
      vehicle_type: "Sedan",
      vehicle_infor: "TOYOTA CAMRY • ホワイト",
      distance: 1200,
      average_rating: 4.9,
      avatar_picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=face"
    },
    {
      user_id: "mock-2",
      full_name: "Tran Minh",
      vehicle_type: "SUV",
      vehicle_infor: "HONDA CR-V • ブラック",
      distance: 800,
      average_rating: 4.8,
      avatar_picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=face"
    },
    {
      user_id: "mock-3",
      full_name: "Le Hang",
      vehicle_type: "SUV",
      vehicle_infor: "VINFAST VF8 • ブルー",
      distance: 2500,
      average_rating: 5.0,
      avatar_picture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=face"
    }
  ];

  return mockDrivers;
};