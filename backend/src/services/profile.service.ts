import prisma from '../config/db';
import { Prisma } from '@prisma/client';

export class ProfileService {
  /**
   * Tạo một profile mới
   */
  async createProfile(data: Prisma.ProfileCreateInput) {
    try {
      const profile = await prisma.profile.create({
        data,
      });
      return profile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin profile theo ID
   */
  async getProfileById(id: string) {
    try {
      const profile = await prisma.profile.findUnique({
        where: { id },
        include: {
          driverProfile: true, // Lấy luôn thông tin tài xế nếu có
          paymentMethods: true,
        },
      });
      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin profile
   */
  async updateProfile(id: string, data: Prisma.ProfileUpdateInput) {
    try {
      const profile = await prisma.profile.update({
        where: { id },
        data,
      });
      return profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Xóa profile
   */
  async deleteProfile(id: string) {
    try {
      const profile = await prisma.profile.delete({
        where: { id },
      });
      return profile;
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách profiles (có phân trang)
   */
  async getProfiles(skip: number = 0, take: number = 10) {
    try {
      const profiles = await prisma.profile.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      });
      return profiles;
    } catch (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }
  }
}

export const profileService = new ProfileService();
