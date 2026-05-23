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
    } catch (e) { }

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
      return res.status(400).json({ message: 'メールアドレスまたは電話番号とパスワードを入力してください。' });
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
      return res.status(401).json({ message: 'メールアドレス/電話番号、またはパスワードが正しくありません。' });
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
      return res.status(401).json({ message: 'メールアドレス/電話番号、またはパスワードが正しくありません。' });
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
        role: profile.role,
        createdAt: profile.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました。しばらくしてからもう一度お試しください。' });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        driverProfile: true,
        paymentMethods: true
      }
    });

    if (!profile) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    // Compute ride stats for CUSTOMER users
    let totalRides = 0;
    let totalSpent = 0;
    if (profile.role === 'CUSTOMER') {
      const completedRides = await prisma.ride.findMany({
        where: {
          passengerId: userId,
          status: 'COMPLETED'
        },
        include: {
          payment: true
        }
      });
      totalRides = completedRides.length;
      totalSpent = completedRides.reduce((sum, ride) => {
        if (ride.payment && ride.payment.status === 'SUCCESS') {
          return sum + Number(ride.payment.totalAmount);
        }
        // If no successful payment record, use matchFee as fallback
        if (ride.matchFee) {
          return sum + Number(ride.matchFee);
        }
        return sum;
      }, 0);
    }

    return res.status(200).json({
      user: {
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        avatar: profile.avatar,
        createdAt: profile.createdAt,
        driverProfile: profile.driverProfile,
        totalRides,
        totalSpent,
        paymentMethods: profile.paymentMethods.map(pm => ({
          id: pm.id,
          cardDetails: pm.cardDetails,
          isDefault: pm.isDefault
        }))
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
      return res.status(400).json({ message: 'すべての必須フィールドを入力してください。' });
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
      return res.status(400).json({ message: 'このメールアドレスまたは電話番号は既に登録されています。' });
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
      return res.status(400).json({ message: signUpError?.message || '登録に失敗しました。' });
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
          } catch (e) { }
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
        role: profile.role,
        createdAt: profile.createdAt
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました。' });
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
        } catch (e) { }
      }
    }

    // Update Profile
    const updateData: any = {};
    if (fullName && fullName !== profile.fullName) {
      updateData.fullName = fullName;
    }
    if (phone && phone !== profile.phone) {
      updateData.phone = phone;
    }
    if (email && email !== profile.email) {
      updateData.email = email;
    }
    // Save avatar for all users (CUSTOMER + DRIVER)
    if (avatarImageUrl) {
      updateData.avatar = avatarImageUrl;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.profile.update({
        where: { id: userId },
        data: updateData
      });
    }

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
        avatar: updatedProfile?.avatar,
        createdAt: updatedProfile?.createdAt,
        driverProfile: updatedProfile?.driverProfile
      }
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: `Lỗi server khi cập nhật thông tin: ${error.message || error}` });
  }
};

export const updatePaymentMethod = async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    const { cardNumber, cardHolder, expiry, cvv } = req.body;

    if (!cardNumber || !cardHolder || !expiry || !cvv) {
      return res.status(400).json({ message: 'すべての必須フィールドを入力してください。' });
    }

    // Since we only need to store one card details or multiple, let's upsert the first one or create new
    const existingCards = await prisma.paymentMethod.findMany({
      where: { userId }
    });

    const cardDetailsString = `${cardNumber}|${cardHolder}|${expiry}|${cvv}`;

    if (existingCards.length > 0) {
      // Update existing
      await prisma.paymentMethod.update({
        where: { id: existingCards[0]!.id },
        data: { cardDetails: cardDetailsString, isDefault: true }
      });
    } else {
      // Create new
      await prisma.paymentMethod.create({
        data: {
          userId,
          cardDetails: cardDetailsString,
          isDefault: true
        }
      });
    }

    return res.status(200).json({ message: 'カードを登録しました' });
  } catch (error) {
    console.error('Update payment method error:', error);
    return res.status(500).json({ message: 'サーバーエラーが発生しました。' });
  }
};
