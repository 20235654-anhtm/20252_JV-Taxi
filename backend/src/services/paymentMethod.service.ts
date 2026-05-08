import prisma from '../config/db';
import { Prisma } from '@prisma/client';

export class PaymentMethodService {
  /**
   * Tạo phương thức thanh toán mới
   */
  async createPaymentMethod(data: Prisma.PaymentMethodCreateInput) {
    try {
      // Nếu user tạo phương thức mặc định, có thể cần cập nhật các phương thức khác về false
      if (data.isDefault && data.profile?.connect?.id) {
        await prisma.paymentMethod.updateMany({
          where: { userId: data.profile.connect.id },
          data: { isDefault: false }
        });
      }

      return await prisma.paymentMethod.create({
        data,
      });
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin phương thức thanh toán theo ID
   */
  async getPaymentMethodById(id: string) {
    try {
      return await prisma.paymentMethod.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Error fetching payment method:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách phương thức thanh toán của một người dùng
   */
  async getPaymentMethodsByUserId(userId: string) {
    try {
      return await prisma.paymentMethod.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error('Error fetching payment methods by user:', error);
      throw error;
    }
  }

  /**
   * Cập nhật thông tin phương thức thanh toán
   */
  async updatePaymentMethod(id: string, data: Prisma.PaymentMethodUpdateInput) {
    try {
      return await prisma.paymentMethod.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  /**
   * Thiết lập phương thức thanh toán làm mặc định
   */
  async setAsDefault(id: string, userId: string) {
    try {
      // Reset tất cả của user này về false
      await prisma.paymentMethod.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      // Cài cái này làm true
      return await prisma.paymentMethod.update({
        where: { id },
        data: { isDefault: true },
      });
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }

  /**
   * Xóa phương thức thanh toán
   */
  async deletePaymentMethod(id: string) {
    try {
      return await prisma.paymentMethod.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }
}

export const paymentMethodService = new PaymentMethodService();
