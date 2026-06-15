import prisma from '../config/db';
import { Prisma } from '@prisma/client';

export interface CreateDriverProfileInput {
  userId: string;
  drivingLicenseInfor: string;
  vehicleInfor: string;
  vehicleType?: string;
  japaneseCerInfor?: string;
  avatarPicture?: string;
  lng?: number; // Kinh độ
  lat?: number; // Vĩ độ
  drivingLicenseImage?: string;
  japaneseCerImage?: string;
  identityCardFrontImage?: string;
  identityCardBackImage?: string;
}

export interface UpdateDriverProfileInput {
  isOnline?: boolean;
  isBusy?: boolean;
  isApproved?: boolean;
  averageRating?: number;
  vehicleType?: string;
  japaneseCerInfor?: string;
  drivingLicenseInfor?: string;
  vehicleInfor?: string;
  avatarPicture?: string;
  lng?: number;
  lat?: number;
  drivingLicenseImage?: string;
  japaneseCerImage?: string;
  identityCardFrontImage?: string;
  identityCardBackImage?: string;
}

export class DriverProfileService {
  /**
   * Tạo hồ sơ tài xế mới
   */
  async createDriverProfile(data: CreateDriverProfileInput) {
    try {
      if (data.lng !== undefined && data.lat !== undefined) {
        // Có tọa độ => dùng Raw SQL
        const drivers = await prisma.$queryRaw<any[]>`
          INSERT INTO "driver_profiles" (
            "user_id", "driving_license_infor", "vehicle_infor", 
            "vehicle_type", "japanese_cer_infor", "avatar_picture", 
            "current_location", "driving_license_image", "japanese_cer_image",
            "identity_card_front_image", "identity_card_back_image"
          ) VALUES (
            ${data.userId}::uuid,
            ${data.drivingLicenseInfor},
            ${data.vehicleInfor},
            ${data.vehicleType ? data.vehicleType : Prisma.sql`NULL`},
            ${data.japaneseCerInfor ? data.japaneseCerInfor : Prisma.sql`NULL`},
            ${data.avatarPicture ? data.avatarPicture : Prisma.sql`NULL`},
            ST_SetSRID(ST_MakePoint(${data.lng}, ${data.lat}), 4326)::geography,
            ${data.drivingLicenseImage ? data.drivingLicenseImage : Prisma.sql`NULL`},
            ${data.japaneseCerImage ? data.japaneseCerImage : Prisma.sql`NULL`},
            ${data.identityCardFrontImage ? data.identityCardFrontImage : Prisma.sql`NULL`},
            ${data.identityCardBackImage ? data.identityCardBackImage : Prisma.sql`NULL`}
          ) RETURNING *;
        `;
        return drivers[0];
      } else {
        // Không có tọa độ => dùng Prisma thông thường
        return await prisma.driverProfile.create({
          data: {
            userId: data.userId,
            drivingLicenseInfor: data.drivingLicenseInfor,
            vehicleInfor: data.vehicleInfor,
            vehicleType: data.vehicleType ?? null,
            japaneseCerInfor: data.japaneseCerInfor ?? null,
            avatarPicture: data.avatarPicture ?? null,
            drivingLicenseImage: data.drivingLicenseImage ?? null,
            japaneseCerImage: data.japaneseCerImage ?? null,
            identityCardFrontImage: data.identityCardFrontImage ?? null,
            identityCardBackImage: data.identityCardBackImage ?? null,
          }
        });
      }
    } catch (error) {
      console.error('Error creating driver profile:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin tài xế theo ID
   */
  async getDriverProfileById(userId: string) {
    try {
      return await prisma.driverProfile.findUnique({
        where: { userId },
        include: { profile: true }
      });
    } catch (error) {
      console.error('Error fetching driver profile:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin tài xế (bao gồm cả cập nhật vị trí)
   */
  async updateDriverProfile(userId: string, data: UpdateDriverProfileInput) {
    try {
      if (data.lng !== undefined && data.lat !== undefined) {
        // Cập nhật vị trí bằng Raw SQL
        await prisma.$executeRaw`
          UPDATE "driver_profiles"
          SET "current_location" = ST_SetSRID(ST_MakePoint(${data.lng}, ${data.lat}), 4326)::geography
          WHERE "user_id" = ${userId}::uuid
        `;
      }

      // Tạo object data cho Prisma update
      const updateData: any = { ...data };
      delete updateData.lng;
      delete updateData.lat;

      if (Object.keys(updateData).length > 0) {
        return await prisma.driverProfile.update({
          where: { userId },
          data: updateData,
        });
      }

      return this.getDriverProfileById(userId);
    } catch (error) {
      console.error('Error updating driver profile:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tài xế
   */
  async getDriverProfiles(skip: number = 0, take: number = 10) {
    try {
      return await prisma.driverProfile.findMany({
        skip,
        take,
      });
    } catch (error) {
      console.error('Error fetching driver profiles:', error);
      throw error;
    }
  }

  /**
   * Xóa hồ sơ tài xế
   */
  async deleteDriverProfile(userId: string) {
    try {
      // dùng deleteMany để không throw lỗi khi record không tồn tại
      const result = await prisma.driverProfile.deleteMany({
        where: { userId },
      });
      return result;
    } catch (error) {
      console.error('Error deleting driver profile:', error);
      throw error;
    }
  }

  /**
   * Tìm tài xế xung quanh bán kính (dùng cho Auto Booking)
   */
  async findNearbyDrivers(lng: number, lat: number, radiusInMeters: number = 3000, vehicleType?: string, ignoredDriverIds: string[] = []) {
    try {
      // Xây dựng điều kiện lọc thêm
      let vehicleTypeCondition = Prisma.empty;
      if (vehicleType) {
        vehicleTypeCondition = Prisma.sql`AND vehicle_type = ${vehicleType}`;
      }

      let ignoredDriversCondition = Prisma.empty;
      if (ignoredDriverIds && ignoredDriverIds.length > 0) {
        ignoredDriversCondition = Prisma.sql`AND user_id NOT IN (${Prisma.join(ignoredDriverIds)})`;
      }

      const drivers = await prisma.$queryRaw<any[]>`
        SELECT 
          "user_id", "average_rating", "vehicle_type", "vehicle_infor",
          ST_Distance("current_location", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography) as distance
        FROM "driver_profiles"
        WHERE 
          "is_online" = true 
          AND "is_busy" = false 
          AND "is_approved" = true
          AND ST_DWithin("current_location", ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusInMeters})
          ${vehicleTypeCondition}
          ${ignoredDriversCondition}
        ORDER BY distance ASC
        LIMIT 5;
      `;
      return drivers;
    } catch (error) {
      console.error('Error finding nearby drivers:', error);
      throw error;
    }
  }
}

export const driverProfileService = new DriverProfileService();
