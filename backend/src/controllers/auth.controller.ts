import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Vui lòng cung cấp email/số điện thoại và mật khẩu.' });
    }

    const profile = await prisma.profile.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });

    if (!profile || !profile.passwordHash) {
      return res.status(401).json({ message: 'Sai email/số điện thoại hoặc mật khẩu.' });
    }

    const passwordMatches = await bcrypt.compare(password, profile.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Sai email/số điện thoại hoặc mật khẩu.' });
    }

    const token = jwt.sign(
      { userId: profile.id, role: profile.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: {
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        role: profile.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, fullName, role } = req.body;

    if (!password || (!email && !phone)) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin đăng ký.' });
    }

    // Kiểm tra tồn tại
    const existingUser = await prisma.profile.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email hoặc số điện thoại đã được sử dụng.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Tạo profile
    const profile = await prisma.profile.create({
      data: {
        email,
        phone,
        passwordHash,
        fullName,
        role: role || 'CUSTOMER',
        status: 'ACTIVE'
      }
    });

    // Nếu là tài xế, tạo thêm bản ghi DriverProfile trống
    if (role === 'DRIVER') {
      await prisma.driverProfile.create({
        data: {
          userId: profile.id,
          drivingLicenseInfor: 'N/A', // Thông tin cơ bản ban đầu
          vehicleInfor: 'N/A'
        }
      });
    }

    const token = jwt.sign(
      { userId: profile.id, role: profile.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        role: profile.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Lỗi server khi đăng ký.' });
  }
};

