import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

export const loginPassenger = async (req: Request, res: Response) => {
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
        ],
        role: 'CUSTOMER'
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
