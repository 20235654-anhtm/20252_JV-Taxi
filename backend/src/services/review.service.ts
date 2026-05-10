import prisma from '../config/db';
import { Prisma } from '@prisma/client';

export class ReviewService {
  /**
   * Tạo đánh giá mới
   */
  async createReview(data: Prisma.ReviewCreateInput) {
    try {
      const review = await prisma.review.create({
        data,
      });

      // Tự động tính toán lại rating trung bình cho tài xế
      if (data.driver?.connect?.id) {
        await this.updateDriverAverageRating(data.driver.connect.id);
      }

      return review;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Tính toán và cập nhật lại averageRating của tài xế
   */
  private async updateDriverAverageRating(driverId: string) {
    const agg = await prisma.review.aggregate({
      where: { driverId },
      _avg: {
        starReview: true,
      }
    });

    const averageRating = agg._avg.starReview || 0;

    await prisma.driverProfile.update({
      where: { userId: driverId },
      data: { averageRating },
    });
  }

  /**
   * Lấy chi tiết đánh giá theo ID
   */
  async getReviewById(id: string) {
    try {
      return await prisma.review.findUnique({
        where: { id },
        include: {
          reviewer: true,
          driver: true,
          ride: true,
        }
      });
    } catch (error) {
      console.error('Error fetching review:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách đánh giá của một tài xế
   */
  async getReviewsByDriverId(driverId: string, skip: number = 0, take: number = 10) {
    try {
      return await prisma.review.findMany({
        where: { driverId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: true,
        }
      });
    } catch (error) {
      console.error('Error fetching reviews by driver:', error);
      throw error;
    }
  }

  /**
   * Lấy đánh giá của một chuyến đi cụ thể
   */
  async getReviewByRideId(rideId: string) {
    try {
      return await prisma.review.findFirst({
        where: { rideId },
      });
    } catch (error) {
      console.error('Error fetching review by ride:', error);
      throw error;
    }
  }

  /**
   * Cập nhật đánh giá
   */
  async updateReview(id: string, data: Prisma.ReviewUpdateInput) {
    try {
      const review = await prisma.review.update({
        where: { id },
        data,
      });

      if (review.driverId) {
         await this.updateDriverAverageRating(review.driverId);
      }

      return review;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  /**
   * Xóa đánh giá
   */
  async deleteReview(id: string) {
    try {
      const review = await prisma.review.delete({
        where: { id },
      });

      if (review.driverId) {
        await this.updateDriverAverageRating(review.driverId);
      }

      return review;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }
}

export const reviewService = new ReviewService();
