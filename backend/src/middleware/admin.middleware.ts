import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // authMiddleware will verify token and populate req.user first
  if (!req.user) {
    return res.status(401).json({ message: 'Không có quyền truy cập. Vui lòng đăng nhập.' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Quyền truy cập bị từ chối. Chỉ dành cho quản trị viên (Admin).' });
  }

  next();
};
