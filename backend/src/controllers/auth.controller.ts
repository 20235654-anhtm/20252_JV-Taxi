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

export const getMe = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        driverProfile: true
      }
    });

    if (!profile) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    return res.status(200).json({
      user: {
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        driverProfile: profile.driverProfile
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy thông tin.' });
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

    // Nếu là tài xế, tạo thêm bản ghi DriverProfile
    if (role === 'DRIVER') {
      const { vehicleType, plate, year, drivingLicense, jlpt, carType, cccd } = req.body;
      const files = req.files as Express.Multer.File[];
      
      // Lấy path của ảnh xe nếu có
      const carImage = files?.find(f => f.fieldname === 'images')?.filename;
      const carImageUrl = carImage ? `http://localhost:5000/uploads/${carImage}` : null;

      // Lưu chính xác 100% dưới dạng JSON
      const vehicleInforJson = JSON.stringify({
        model: vehicleType || 'BMW',
        plate: plate || 'N/A',
        year: year || '2022',
        image: carImageUrl
      });

      await prisma.driverProfile.create({
        data: {
          userId: profile.id,
          vehicleType: carType || 'Sedan', 
          vehicleInfor: vehicleInforJson,
          drivingLicenseInfor: drivingLicense || 'N/A',
          japaneseCerInfor: jlpt || 'N/A',
          identityCard: cccd || 'N/A',
          avatarPicture: carImageUrl,
          isApproved: false
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

export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { fullName, phone, email, vehicleType, model, plate, year, japaneseCerInfor, drivingLicenseInfor, identityCard } = req.body;
    
    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: { driverProfile: true }
    });

    if (!profile) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    // Handle files if any
    const files = req.files as Express.Multer.File[];
    const avatarFile = files?.find(f => f.fieldname === 'avatar')?.filename;
    const avatarImageUrl = avatarFile ? `http://localhost:5000/uploads/${avatarFile}` : null;

    const carImageFile = files?.find(f => f.fieldname === 'carImage')?.filename;
    const carImageUrl = carImageFile ? `http://localhost:5000/uploads/${carImageFile}` : null;

    // Update Profile
    await prisma.profile.update({
      where: { id: userId },
      data: {
        fullName: fullName || profile.fullName,
        phone: phone || profile.phone,
        email: email || profile.email,
      }
    });

    // Update DriverProfile
    if (profile.role === 'DRIVER') {
      let vehicleInforJson = profile.driverProfile?.vehicleInfor || "";
      if (model || plate || year || carImageUrl) {
        let existingModel = 'BMW';
        let existingPlate = '51A-888.88';
        let existingYear = '2022';
        let existingImage = null;

        if (profile.driverProfile?.vehicleInfor) {
          try {
            const data = JSON.parse(profile.driverProfile.vehicleInfor);
            existingModel = data.model || existingModel;
            existingPlate = data.plate || existingPlate;
            existingYear = data.year || existingYear;
            existingImage = data.image || existingImage;
          } catch (e) {
            // ignore
          }
        }

        vehicleInforJson = JSON.stringify({
          model: model || existingModel,
          plate: plate || existingPlate,
          year: year || existingYear,
          image: carImageUrl || existingImage
        });
      }

      await prisma.driverProfile.update({
        where: { userId },
        data: {
          vehicleType: vehicleType || profile.driverProfile?.vehicleType || undefined,
          japaneseCerInfor: japaneseCerInfor || profile.driverProfile?.japaneseCerInfor || null,
          drivingLicenseInfor: drivingLicenseInfor || profile.driverProfile?.drivingLicenseInfor || "",
          identityCard: identityCard || profile.driverProfile?.identityCard || null,
          vehicleInfor: vehicleInforJson,
          avatarPicture: avatarImageUrl || profile.driverProfile?.avatarPicture || null,
        }
      });
    }


    const updatedProfile = await prisma.profile.findUnique({
      where: { id: userId },
      include: { driverProfile: true }
    });

    return res.status(200).json({
      message: 'Cập nhật profile thành công.',
      user: {
        id: updatedProfile?.id,
        fullName: updatedProfile?.fullName,
        email: updatedProfile?.email,
        phone: updatedProfile?.phone,
        role: updatedProfile?.role,
        driverProfile: updatedProfile?.driverProfile
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin.' });
  }
};


