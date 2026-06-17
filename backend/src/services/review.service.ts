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
        communicationStar: true,
        attitudeStar: true,
        safetyStar: true,
      }
    });

    const averageRating = agg._avg.starReview || 0;
    const communicationAverage = agg._avg.communicationStar || 0;
    const attitudeAverage = agg._avg.attitudeStar || 0;
    const safetyAverage = agg._avg.safetyStar || 0;

    await prisma.driverProfile.update({
      where: { userId: driverId },
      data: { 
        averageRating,
        communicationAverage,
        attitudeAverage,
        safetyAverage
      },
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
   * Lấy danh sách đánh giá của một tài xế (có pagination và filter sao)
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
   * Lấy danh sách đánh giá có hỗ trợ pagination và filter theo sao
   */
  async getReviewsByDriverIdPaginated(
    driverId: string,
    page: number = 1,
    limit: number = 5,
    starFilter?: number
  ) {
    try {
      const skip = (page - 1) * limit;
      const where: any = { driverId };
      if (starFilter !== undefined) {
        where.starReview = starFilter;
      }

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { reviewer: true },
        }),
        prisma.review.count({ where }),
      ]);

      return {
        reviews,
        total,
        page,
        limit,
        hasMore: skip + reviews.length < total,
      };
    } catch (error) {
      console.error('Error fetching paginated reviews:', error);
      throw error;
    }
  }

  /**
   * Lấy số lượng review theo từng mức sao (1-5) của một tài xế
   */
  async getStarCountsByDriverId(driverId: string) {
    try {
      const counts = await prisma.review.groupBy({
        by: ['starReview'],
        where: { driverId },
        _count: { starReview: true },
      });

      // Build a map: star (1-5) -> count
      const result: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (const row of counts) {
        const starValue = row.starReview;
        if (starValue !== null) {
          const star = Number(starValue);
          if (!isNaN(star) && star >= 1 && star <= 5) {
            result[star] = row._count.starReview;
          }
        }
      }

      const total = Object.values(result).reduce((a, b) => a + b, 0);
      return { counts: result, total };
    } catch (error) {
      console.error('Error fetching star counts:', error);
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
