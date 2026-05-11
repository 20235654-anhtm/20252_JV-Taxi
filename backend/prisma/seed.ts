import bcrypt from 'bcryptjs';
import prisma from '../src/config/db';

async function main() {
  console.log('--- Bắt đầu Seed dữ liệu khu vực Bách Khoa (Bản sửa lỗi TS) ---');

  try {
    // 1. Tạm thời tắt kiểm tra khóa ngoại
    await prisma.$executeRawUnsafe('SET session_replication_role = \'replica\';');

    // 2. Xóa dữ liệu cũ
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "payments", "reviews", "rides", "payment_methods", "driver_profiles", "profiles" CASCADE;');
    console.log('Vệ sinh dữ liệu cũ hoàn tất.');

    // 3. Dữ liệu Tài xế (Dùng ID hex)
    const drivers = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: "Nguyễn Văn Nam (Taxi Vios)",
        phone: "0911111111",
        lat: 21.0065, lng: 105.8458, // Cổng Parabol
        car: "TOYOTA VIOS • WHITE • 29A-123.45",
        type: "CAR_4_SEATS",
        rating: 4.9, isOnline: true, isBusy: false,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=face"
      },
      {
        id: '11111111-1111-1111-1111-222222222222',
        name: "Trần Thị Mai (Mazda 3)",
        phone: "0922222222",
        lat: 21.0045, lng: 105.8430, // Thư viện Tạ Quang Bửu
        car: "MAZDA 3 • RED • 30F-555.66",
        type: "CAR_4_SEATS",
        rating: 4.8, isOnline: true, isBusy: false,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=face"
      },
      {
        id: '11111111-1111-1111-1111-333333333333',
        name: "Lê Hoàng Long (Honda SH)",
        phone: "0933333333",
        lat: 21.0055, lng: 105.8420, // Hồ Tiền Phong
        car: "HONDA SH • BLACK • 29G1-999.99",
        type: "MOTORBIKE",
        rating: 4.5, isOnline: true, isBusy: false,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=face"
      }
    ];

    // 4. Dữ liệu Khách hàng
    const customers = [
      { id: '22222222-2222-2222-2222-111111111111', name: "Sinh Viên Bách Khoa", phone: "0988888888", email: "sinhvien@bk.edu.vn", password: "12345678" },
      { id: '22222222-2222-2222-2222-222222222222', name: "Giảng Viên HUST", phone: "0977777777", email: "giangvien@hust.edu.vn", password: "12345678" }
    ];

    for (const c of customers) {
      const passwordHash = await bcrypt.hash(c.password, 10);
      await prisma.$executeRawUnsafe(`INSERT INTO "profiles" ("id", "full_name", "phone", "email", "password_hash", "role", "status") VALUES ('${c.id}'::uuid, '${c.name}', '${c.phone}', '${c.email}', '${passwordHash}', 'CUSTOMER', 'ACTIVE');`);
      await prisma.$executeRawUnsafe(`INSERT INTO "payment_methods" ("id", "user_id", "card_details", "is_default") VALUES (uuid_generate_v4(), '${c.id}'::uuid, 'Thẻ ATM **** 9999', true);`);
    }

    for (const d of drivers) {
      await prisma.$executeRawUnsafe(`INSERT INTO "profiles" ("id", "full_name", "phone", "role", "status") VALUES ('${d.id}'::uuid, '${d.name}', '${d.phone}', 'DRIVER', 'ACTIVE');`);
      await prisma.$executeRawUnsafe(`INSERT INTO "driver_profiles" ("user_id", "average_rating", "is_online", "is_busy", "is_approved", "vehicle_type", "vehicle_infor", "driving_license_infor", "avatar_picture", "current_location") VALUES ('${d.id}'::uuid, ${d.rating}, ${d.isOnline}, ${d.isBusy}, true, '${d.type}', '${d.car}', 'LICENSE-${d.phone}', '${d.avatar}', ST_SetSRID(ST_MakePoint(${d.lng}, ${d.lat}), 4326)::geography);`);
      console.log(`Đã tạo tài xế: ${d.name}`);
    }

    // 5. Lịch sử chuyến đi mẫu
    const sampleRides = [
      {
        id: '33333333-3333-3333-3333-111111111111',
        passenger: customers[0]!.id, driver: drivers[0]!.id,
        start: 'Ký túc xá Bách Khoa', end: 'Times City',
        s_lng: 105.8460, s_lat: 21.0035, e_lng: 105.8675, e_lat: 20.9950,
        fee: 65000, status: 'COMPLETED'
      },
      {
        id: '33333333-3333-3333-3333-222222222222',
        passenger: customers[0]!.id, driver: drivers[1]!.id,
        start: 'Số 1 Đại Cồ Việt', end: 'Vincom Bà Triệu',
        s_lng: 105.8465, s_lat: 21.0105, e_lng: 105.8492, e_lat: 21.0125,
        fee: 30000, status: 'COMPLETED'
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        passenger: customers[1]!.id, driver: drivers[2]!.id,
        start: 'Nhà C1 Bách Khoa', end: 'Ga Hà Nội',
        s_lng: 105.8435, s_lat: 21.0050, e_lng: 105.8405, e_lat: 21.0160,
        fee: 25000, status: 'COMPLETED'
      }
    ];

    for (const r of sampleRides) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "rides" ("id", "passenger_id", "driver_id", "start_address", "end_address", "start_location", "end_location", "match_fee", "status")
        VALUES ('${r.id}'::uuid, '${r.passenger}'::uuid, '${r.driver}'::uuid, '${r.start}', '${r.end}', 
                ST_SetSRID(ST_MakePoint(${r.s_lng}, ${r.s_lat}), 4326)::geography, 
                ST_SetSRID(ST_MakePoint(${r.e_lng}, ${r.e_lat}), 4326)::geography, ${r.fee}, '${r.status}');
      `);
      
      // Thêm đánh giá
      await prisma.$executeRawUnsafe(`INSERT INTO "reviews" ("id", "ride_id", "reviewer_id", "driver_id", "star_review", "comment_review") VALUES (uuid_generate_v4(), '${r.id}'::uuid, '${r.passenger}'::uuid, '${r.driver}'::uuid, 5, 'Dịch vụ tuyệt vời, tài xế rất thân thiện!');`);
    }

    // 6. Bật lại kiểm tra khóa ngoại
    await prisma.$executeRawUnsafe('SET session_replication_role = \'origin\';');

    console.log('--- Seed hoàn tất thành công với đầy đủ lịch sử chuyến đi! ---');
  } catch (error) {
    await prisma.$executeRawUnsafe('SET session_replication_role = \'origin\';');
    console.error('Lỗi khi seed dữ liệu:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
