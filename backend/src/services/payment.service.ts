import prisma from '../config/db';
import { Prisma, PaymentStatus } from '@prisma/client';

export class PaymentService {
  /**
   * Tạo giao dịch thanh toán mới
   */
  async createPayment(data: Prisma.PaymentCreateInput) {
    try {
      return await prisma.payment.create({
        data,
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết thanh toán theo ID
   */
  async getPaymentById(id: string) {
    try {
      return await prisma.payment.findUnique({
        where: { id },
        include: {
          ride: true,
          paymentMethod: true,
        }
      });
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết thanh toán theo Ride ID
   */
  async getPaymentByRideId(rideId: string) {
    try {
      return await prisma.payment.findUnique({
        where: { rideId },
      });
    } catch (error) {
      console.error('Error fetching payment by ride id:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái thanh toán
   */
  async updatePaymentStatus(id: string, status: PaymentStatus) {
    try {
      return await prisma.payment.update({
        where: { id },
        data: { status },
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * Xóa thanh toán (Thường không khuyến khích trong thực tế)
   */
  async deletePayment(id: string) {
    try {
      return await prisma.payment.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
