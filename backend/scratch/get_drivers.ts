import prisma from '../src/config/db';

async function listDrivers() {
  try {
    const drivers = await prisma.profile.findMany({
      where: {
        role: 'DRIVER'
      },
      include: {
        driverProfile: true
      }
    });
    console.log('--- DANH SÁCH TÀI XẾ TRONG DATABASE ---');
    if (drivers.length === 0) {
      console.log('Không tìm thấy tài xế nào trong database.');
    } else {
      drivers.forEach((d, index) => {
        console.log(`${index + 1}. Họ tên: ${d.fullName}`);
        console.log(`   Email: ${d.email}`);
        console.log(`   Số điện thoại: ${d.phone}`);
        console.log(`   Mã tài xế (ID): ${d.id}`);
        console.log(`   Trạng thái hoạt động: ${d.driverProfile?.isOnline ? 'Online' : 'Offline'}`);
        console.log(`   Bận rộn: ${d.driverProfile?.isBusy ? 'Bận' : 'Sẵn sàng'}`);
        console.log(`   Đã duyệt: ${d.driverProfile?.isApproved ? 'Đã duyệt' : 'Chưa duyệt'}`);
        console.log(`   ------------------------------------------`);
      });
    }
    
    const customers = await prisma.profile.findMany({
      where: {
        role: 'CUSTOMER'
      }
    });
    console.log('\n--- DANH SÁCH KHÁCH HÀNG TRONG DATABASE ---');
    if (customers.length === 0) {
      console.log('Không tìm thấy khách hàng nào.');
    } else {
      customers.forEach((c, index) => {
        console.log(`${index + 1}. Họ tên: ${c.fullName} | Email: ${c.email} | SĐT: ${c.phone}`);
      });
    }
  } catch (error) {
    console.error('Lỗi truy vấn:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listDrivers();
