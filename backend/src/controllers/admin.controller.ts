import { Request, Response } from 'express';
import prisma from '../config/db';

/**
 * Lấy danh sách tất cả người dùng kèm bộ lọc và phân trang
 * GET /api/admin/users
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const role = req.query.role as string;
    const status = req.query.status as string;
    const search = req.query.search as string;

    // Xây dựng điều kiện lọc (where clause)
    const whereClause: any = {};

    if (role) {
      whereClause.role = role;
    }

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Đếm tổng số bản ghi phù hợp
    const totalItems = await prisma.profile.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / limit);

    // Lấy danh sách người dùng phân trang
    const users = await prisma.profile.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
        driverProfile: {
          select: {
            vehicleType: true,
            vehicleInfor: true,
            isApproved: true,
            isOnline: true,
            isBusy: true,
            averageRating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    return res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        limit,
        totalPages,
        totalItems
      }
    });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách user:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi hệ thống khi lấy danh sách người dùng.',
      error: error.message
    });
  }
};

/**
 * Khóa tài khoản người dùng/tài xế (Block User)
 * POST /api/admin/users/:id/block
 */
export const blockUser = async (req: any, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const adminId = req.user?.userId;

    if (targetUserId === adminId) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể tự khóa tài khoản Admin của chính mình!'
      });
    }

    // Kiểm tra xem user cần block có tồn tại không
    const user = await prisma.profile.findUnique({
      where: { id: targetUserId },
      include: { driverProfile: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng trong hệ thống.'
      });
    }

    if (user.status === 'BANNED') {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản này hiện tại đã bị khóa (BANNED) sẵn từ trước.'
      });
    }

    // Tiến hành khóa tài khoản
    await prisma.$transaction(async (tx) => {
      // 1. Cập nhật status của Profile thành BANNED
      await tx.profile.update({
        where: { id: targetUserId },
        data: { status: 'BANNED' }
      });

      // 2. Nếu là Tài xế (DRIVER), tắt trạng thái online và busy
      if (user.role === 'DRIVER' && user.driverProfile) {
        await tx.driverProfile.update({
          where: { userId: targetUserId },
          data: {
            isOnline: false,
            isBusy: false
          }
        });
      }
    });

    // 3. Gửi tín hiệu Websocket để ngắt kết nối hoặc ép buộc Client đăng xuất ngay lập tức
    try {
      const { io: wsIo, userSocketMap: wsUserSocketMap } = require('../index');
      if (wsUserSocketMap && wsIo) {
        const socketId = wsUserSocketMap.get(targetUserId);
        if (socketId) {
          console.log(`🔌 Banning active user: Sending force logout to socketId=${socketId}`);
          wsIo.to(socketId).emit('banned', {
            message: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên hệ thống. Bạn sẽ được đăng xuất tự động.'
          });
        }
      }
    } catch (wsErr) {
      console.warn('Không thể gửi thông báo Websocket cho user bị block:', wsErr);
    }

    return res.status(200).json({
      success: true,
      message: `Khóa tài khoản thành công cho người dùng: ${user.fullName || user.email || user.phone}`
    });
  } catch (error: any) {
    console.error('Lỗi khi khóa tài khoản:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi hệ thống khi thực hiện khóa tài khoản.',
      error: error.message
    });
  }
};

/**
 * Mở khóa tài khoản người dùng/tài xế (Unblock User)
 * POST /api/admin/users/:id/unblock
 */
export const unblockUser = async (req: any, res: Response) => {
  try {
    const targetUserId = req.params.id;

    // Kiểm tra xem user có tồn tại không
    const user = await prisma.profile.findUnique({
      where: { id: targetUserId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng trong hệ thống.'
      });
    }

    if (user.status !== 'BANNED') {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản này đang không ở trạng thái bị khóa (BANNED).'
      });
    }

    // Cập nhật trạng thái Profile thành ACTIVE
    await prisma.profile.update({
      where: { id: targetUserId },
      data: { status: 'ACTIVE' }
    });

    return res.status(200).json({
      success: true,
      message: `Mở khóa tài khoản thành công cho người dùng: ${user.fullName || user.email || user.phone}`
    });
  } catch (error: any) {
    console.error('Lỗi khi mở khóa tài khoản:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi hệ thống khi mở khóa tài khoản.',
      error: error.message
    });
  }
};

/**
 * Lấy danh sách tài xế đang chờ phê duyệt (isApproved = false hoặc null)
 * GET /api/admin/drivers/pending
 */
export const getPendingDrivers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    // Xây dựng điều kiện lọc
    const whereClause: any = {
      role: 'DRIVER',
      driverProfile: {
        isApproved: false
      }
    };

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Đếm tổng số tài xế chờ duyệt
    const totalItems = await prisma.profile.count({ where: whereClause });
    const totalPages = Math.ceil(totalItems / limit);

    // Lấy danh sách tài xế chờ duyệt kèm hồ sơ
    const pendingDrivers = await prisma.profile.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        status: true,
        createdAt: true,
        driverProfile: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    return res.status(200).json({
      success: true,
      data: pendingDrivers,
      pagination: {
        currentPage: page,
        limit,
        totalPages,
        totalItems
      }
    });
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách tài xế chờ duyệt:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi hệ thống khi lấy danh sách tài xế chờ duyệt.',
      error: error.message
    });
  }
};

/**
 * Phê duyệt hồ sơ tài xế (Approve Driver)
 * POST /api/admin/drivers/:id/approve
 */
export const approveDriver = async (req: Request, res: Response) => {
  try {
    const driverId = req.params.id as string;

    // Kiểm tra tài xế có tồn tại không
    const user: any = await prisma.profile.findUnique({
      where: { id: driverId },
      include: { driverProfile: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng trong hệ thống.'
      });
    }

    if (user.role !== 'DRIVER' || !user.driverProfile) {
      return res.status(400).json({
        success: false,
        message: 'Người dùng này không phải là Tài xế hoặc không có Hồ sơ tài xế.'
      });
    }

    if (user.driverProfile.isApproved === true) {
      return res.status(400).json({
        success: false,
        message: 'Tài xế này đã được phê duyệt từ trước.'
      });
    }

    // Cập nhật trạng thái phê duyệt và xóa lý do từ chối cũ nếu có
    await prisma.driverProfile.update({
      where: { userId: driverId },
      data: {
        isApproved: true,
        rejectionReason: null
      }
    });

    return res.status(200).json({
      success: true,
      message: `Phê duyệt tài xế thành công cho: ${user.fullName || user.email || user.phone}`
    });
  } catch (error: any) {
    console.error('Lỗi khi phê duyệt tài xế:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi hệ thống khi phê duyệt tài xế.',
      error: error.message
    });
  }
};

/**
 * Từ chối phê duyệt hồ sơ tài xế (Reject Driver)
 * POST /api/admin/drivers/:id/reject
 */
export const rejectDriver = async (req: Request, res: Response) => {
  try {
    const driverId = req.params.id as string;
    const { reason } = req.body;

    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp lý do từ chối phê duyệt tài xế.'
      });
    }

    // Kiểm tra tài xế có tồn tại không
    const user: any = await prisma.profile.findUnique({
      where: { id: driverId },
      include: { driverProfile: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng trong hệ thống.'
      });
    }

    if (user.role !== 'DRIVER' || !user.driverProfile) {
      return res.status(400).json({
        success: false,
        message: 'Người dùng này không phải là Tài xế hoặc không có Hồ sơ tài xế.'
      });
    }

    // Cập nhật trạng thái phê duyệt là false và ghi lý do từ chối
    await prisma.driverProfile.update({
      where: { userId: driverId },
      data: {
        isApproved: false,
        rejectionReason: reason as string
      }
    });

    return res.status(200).json({
      success: true,
      message: `Từ chối phê duyệt tài xế thành công cho: ${user.fullName || user.email || user.phone}. Lý do: ${reason}`
    });
  } catch (error: any) {
    console.error('Lỗi khi từ chối tài xế:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi hệ thống khi từ chối phê duyệt tài xế.',
      error: error.message
    });
  }
};
