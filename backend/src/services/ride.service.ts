import prisma from '../config/db';
import { Prisma, RideStatus } from '@prisma/client';

// Interface custom do Prisma không hỗ trợ tạo trực tiếp type cho trường GEOGRAPHY
export interface CreateRideInput {
  passengerId: string;
  driverId?: string;
  startAddress: string;
  endAddress: string;
  startLng: number; // Kinh độ điểm đón
  startLat: number; // Vĩ độ điểm đón
  endLng: number;   // Kinh độ điểm đến
  endLat: number;   // Vĩ độ điểm đến
  matchFee?: number;
  matchType?: string;
  vehicleTypeRequested?: string;
}

export class RideService {
  /**
   * Tạo một chuyến đi mới (Ride) sử dụng Raw SQL vì có trường PostGIS Geography
   */
  async createRide(data: CreateRideInput) {
    try {
      // Dùng $queryRaw để gọi hàm ST_MakePoint của PostGIS
      const rides = await prisma.$queryRaw<any[]>`
        INSERT INTO "rides" (
          "id", "passenger_id", "driver_id", "start_address", "end_address",
          "start_location", "end_location", "match_fee", "match_type", "vehicle_type_requested", "created_at"
        ) VALUES (
          gen_random_uuid(),
          ${data.passengerId}::uuid, 
          ${data.driverId ? Prisma.sql`${data.driverId}::uuid` : Prisma.sql`NULL`}, 
          ${data.startAddress}, 
          ${data.endAddress}, 
          ST_SetSRID(ST_MakePoint(${data.startLng}, ${data.startLat}), 4326)::geography, 
          ST_SetSRID(ST_MakePoint(${data.endLng}, ${data.endLat}), 4326)::geography, 
          ${data.matchFee ? data.matchFee : Prisma.sql`NULL`}, 
          ${data.matchType ? data.matchType : Prisma.sql`NULL`},
          ${data.vehicleTypeRequested ? data.vehicleTypeRequested : Prisma.sql`NULL`},
          NOW()
        )
        RETURNING *;
      `;
      return rides[0];
    } catch (error) {
      console.error('Error creating ride:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin chuyến đi theo ID
   */
  async getRideById(id: string) {
    try {
      const ride = await prisma.ride.findUnique({
        where: { id },
        include: {
          passenger: true,
          driver: true,
          payment: true,
        },
      });
      return ride;
    } catch (error) {
      console.error('Error fetching ride:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách chuyến đi của một hành khách
   */
  async getRidesByPassenger(passengerId: string) {
    try {
      const rides = await prisma.ride.findMany({
        where: { passengerId },
        orderBy: { createdAt: 'desc' },
      });
      return rides;
    } catch (error) {
      console.error('Error fetching rides by passenger:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách chuyến đi của một tài xế
   */
  async getRidesByDriver(driverId: string) {
    try {
      const rides = await prisma.ride.findMany({
        where: { driverId },
        orderBy: { createdAt: 'desc' },
      });
      return rides;
    } catch (error) {
      console.error('Error fetching rides by driver:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái chuyến đi
   */
  async updateRideStatus(id: string, status: RideStatus) {
    try {
      const ride = await prisma.ride.update({
        where: { id },
        data: { status },
      });
      return ride;
    } catch (error) {
      console.error('Error updating ride status:', error);
      throw error;
    }
  }

  /**
   * Thêm ID tài xế vào danh sách từ chối
   */
  async addRejectedDriver(id: string, driverId: string) {
    try {
      // Vì rejectedDriverIds là mảng UUID, dùng hàm update của array
      const ride = await prisma.$executeRaw`
        UPDATE "rides" 
        SET "rejected_driver_ids" = array_append("rejected_driver_ids", ${driverId}::uuid)
        WHERE "id" = ${id}::uuid
      `;
      return ride;
    } catch (error) {
      console.error('Error adding rejected driver:', error);
      throw error;
    }
  }

  /**
   * Xóa chuyến đi (thường không nên xóa, chỉ nên đổi status thành CANCELLED, nhưng đây là hàm CRUD mẫu)
   */
  async deleteRide(id: string) {
    try {
      const ride = await prisma.ride.delete({
        where: { id },
      });
      return ride;
    } catch (error) {
      console.error('Error deleting ride:', error);
      throw error;
    }
  }
}

export const rideService = new RideService();
