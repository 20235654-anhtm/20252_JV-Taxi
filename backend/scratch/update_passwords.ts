import prisma from '../src/config/db';
import bcrypt from 'bcryptjs';

async function updatePasswords() {
  try {
    const newPassword = '12345678';
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu cho tài xế Cao Duy Thế Anh
    const driver1 = await prisma.profile.updateMany({
      where: { email: 'elfaria2809@gmail.com' },
      data: { passwordHash }
    });

    // Cập nhật mật khẩu cho tài xế maichi
    const driver2 = await prisma.profile.updateMany({
      where: { email: 'maichi@gmail.com' },
      data: { passwordHash }
    });
    
    // Cập nhật luôn cho khách hàng hihi@gmail.com
    const customer = await prisma.profile.updateMany({
      where: { email: 'hihi@gmail.com' },
      data: { passwordHash }
    });

    console.log('Cập nhật mật khẩu thành công cho các tài khoản test!');
    console.log('Mật khẩu mới là: 12345678');
  } catch (error) {
    console.error('Lỗi khi cập nhật mật khẩu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePasswords();
