import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { supabase, supabaseAdmin } from '../config/supabase';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const uploadToSupabase = async (file: Express.Multer.File, folder: string): Promise<string | null> => {
  try {
    const fileBuffer = fs.readFileSync(file.path);
    const fileExt = path.extname(file.originalname) || '.jpg';
    const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      console.error(`Supabase Storage upload error for ${file.originalname}:`, error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (e) {}

    return urlData.publicUrl;
  } catch (err) {
    console.error(`Error uploading file ${file.originalname} to Supabase:`, err);
    return null;
  }
};


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

    if (!profile) {
      return res.status(401).json({ message: 'Sai email/số điện thoại hoặc mật khẩu.' });
    }

    let isAuthenticated = false;

    // 1. Try to sign in via Supabase Auth
    if (profile.email) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password
      });

      if (!signInError && signInData.user) {
        isAuthenticated = true;
      }
    }

    // 2. Fallback to legacy bcrypt password hash verification
    if (!isAuthenticated && profile.passwordHash) {
      const passwordMatches = await bcrypt.compare(password, profile.passwordHash);
      if (passwordMatches) {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated) {
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

    // 1. Sign up user via Supabase Auth (using service_role key to bypass signup restrictions if available)
    let signUpData;
    let signUpError;

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: email || undefined,
        phone: !email && phone ? phone : undefined,
        password,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          fullName,
          phone,
          role: role || 'CUSTOMER'
        }
      });
      signUpData = data;
      signUpError = error;
    } else {
      const { data, error } = await supabase.auth.signUp({
        email: email || undefined,
        phone: !email && phone ? phone : undefined,
        password,
        options: {
          data: {
            fullName,
            phone,
            role: role || 'CUSTOMER'
          }
        }
      });
      signUpData = data;
      signUpError = error;
    }

    if (signUpError || !signUpData.user) {
      return res.status(400).json({ message: signUpError?.message || 'Đăng ký thất bại qua Supabase.' });
    }

    const userId = signUpData.user.id;
    const passwordHash = await bcrypt.hash(password, 10);

    // 2. Upsert profile into public.profiles (either updating the trigger-created one or creating a new one)
    const profile = await prisma.profile.upsert({
      where: { id: userId },
      update: {
        passwordHash,
        fullName: fullName || undefined,
        phone: phone || undefined,
        email: email || undefined,
        role: (role as any) || undefined
      },
      create: {
        id: userId,
        email,
        phone,
        passwordHash,
        fullName,
        role: (role as any) || 'CUSTOMER',
        status: 'ACTIVE'
      }
    });

    // Nếu là tài xế, tạo thêm bản ghi DriverProfile
    if (role === 'DRIVER') {
      const { vehicleType, plate, year, drivingLicense, jlpt, carType, cccd } = req.body;
      const files = req.files as Express.Multer.File[];
      
      const carImageFile = files?.find(f => f.fieldname === 'images');
      let carImageUrl = null;
      if (carImageFile) {
        carImageUrl = await uploadToSupabase(carImageFile, 'cars');
      }

      const docFiles = files?.filter(f => f.fieldname === 'documents');
      const docUrls: string[] = [];
      if (docFiles && docFiles.length > 0) {
        for (const docFile of docFiles) {
          const docUrl = await uploadToSupabase(docFile, 'documents');
          if (docUrl) docUrls.push(docUrl);
        }
      }

      // Lưu chính xác 100% dưới dạng JSON
      const vehicleInforJson = JSON.stringify({
        model: vehicleType || 'BMW',
        plate: plate || 'N/A',
        year: year || '2022',
        image: carImageUrl,
        documents: docUrls
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

      // Clean up any remaining files in case
      if (files) {
        for (const file of files) {
          try {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (e) {}
        }
      }
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
    
    const avatarFile = files?.find(f => f.fieldname === 'avatar');
    let avatarImageUrl = null;
    if (avatarFile) {
      avatarImageUrl = await uploadToSupabase(avatarFile, 'avatars');
    }

    const carImageFile = files?.find(f => f.fieldname === 'carImage');
    let carImageUrl = null;
    if (carImageFile) {
      carImageUrl = await uploadToSupabase(carImageFile, 'cars');
    }

    // Clean up any remaining files in case
    if (files) {
      for (const file of files) {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (e) {}
      }
    }

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


