import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
import prisma from '../src/config/db';

async function main() {
  console.log('--- Bắt đầu Seed/Update dữ liệu (Cơ chế Upsert) ---');

  try {
    // 1. Tạm thời tắt kiểm tra khóa ngoại (để đảm bảo tính nhất quán khi cập nhật)
    await prisma.$executeRawUnsafe('SET session_replication_role = \'replica\';');

    // 2. Dữ liệu Tài xế
    const drivers = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: "Nguyễn Văn Nam",
        phone: "0911111111", email: "nam.driver@jvtaxi.vn", password: "12345678",
        lat: 21.0065, lng: 105.8458,
        car: "TOYOTA VIOS • WHITE • 29A-123.45",
        type: "CAR_4_SEATS",
        rating: 4.9, isOnline: true, isBusy: false,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=face"
      },
      {
        id: '11111111-1111-1111-1111-222222222222',
        name: "Trần Thị Mai",
        phone: "0922222222", email: "mai.driver@jvtaxi.vn", password: "12345678",
        lat: 21.0045, lng: 105.8430,
        car: "MAZDA 3 • RED • 30F-555.66",
        type: "CAR_4_SEATS",
        rating: 4.8, isOnline: true, isBusy: false,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=face"
      },
      {
        id: '11111111-1111-1111-1111-333333333333',
        name: "Lê Hoàng Long",
        phone: "0933333333", email: "long.driver@jvtaxi.vn", password: "12345678",
        lat: 21.0055, lng: 105.8420,
        car: "HONDA SH • BLACK • 29G1-999.99",
        type: "MOTORBIKE",
        rating: 4.5, isOnline: true, isBusy: false,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=face"
      },
      {
        id: '11111111-1111-1111-1111-444444444444',
        name: "Phạm Minh Đức",
        phone: "0944444444", email: "duc.driver@jvtaxi.vn", password: "12345678",
        lat: 21.0588, lng: 105.7485,
        car: "VINFAST VF8 • BLUE • 30H-888.88",
        type: "CAR_4_SEATS",
        rating: 4.9, isOnline: true, isBusy: false,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face"
      }
    ];

    // 3. Dữ liệu Khách hàng
    const customers = [
      { id: '22222222-2222-2222-2222-111111111111', name: "Sinh Viên Bách Khoa", phone: "0988888888", email: "sinhvien@bk.edu.vn", password: "12345678" },
      { id: '22222222-2222-2222-2222-222222222222', name: "Giảng Viên HUST", phone: "0977777777", email: "giangvien@hust.edu.vn", password: "12345678" }
    ];

    // Upsert Profiles Khách hàng
    for (const c of customers) {
      const hashedPassword = await bcrypt.hash(c.password, SALT_ROUNDS);
      await prisma.$executeRawUnsafe(`
        INSERT INTO "profiles" ("id", "full_name", "phone", "email", "password_hash", "role", "status") 
        VALUES ('${c.id}'::uuid, '${c.name}', '${c.phone}', '${c.email}', '${hashedPassword}', 'CUSTOMER', 'ACTIVE')
        ON CONFLICT (id) DO UPDATE SET "full_name" = EXCLUDED."full_name", "phone" = EXCLUDED."phone", "email" = EXCLUDED."email", "password_hash" = EXCLUDED."password_hash";
      `);
      
      // Chèn phương thức thanh toán nếu chưa có
      await prisma.$executeRawUnsafe(`
        INSERT INTO "payment_methods" ("id", "user_id", "card_details", "is_default") 
        VALUES (uuid_generate_v4(), '${c.id}'::uuid, 'Thẻ ATM **** 9999', true)
        ON CONFLICT DO NOTHING;
      `);
      console.log(`Đã cập nhật/tạo khách hàng: ${c.name}`);
    }

    // Upsert Profiles & DriverProfiles Tài xế
    for (const d of drivers) {
      const hashedPassword = await bcrypt.hash(d.password, SALT_ROUNDS);
      await prisma.$executeRawUnsafe(`
        INSERT INTO "profiles" ("id", "full_name", "phone", "email", "password_hash", "role", "status") 
        VALUES ('${d.id}'::uuid, '${d.name}', '${d.phone}', '${d.email}', '${hashedPassword}', 'DRIVER', 'ACTIVE')
        ON CONFLICT (id) DO UPDATE SET "full_name" = EXCLUDED."full_name", "phone" = EXCLUDED."phone", "email" = EXCLUDED."email", "password_hash" = EXCLUDED."password_hash";
      `);

      await prisma.$executeRawUnsafe(`
        INSERT INTO "driver_profiles" ("user_id", "average_rating", "is_online", "is_busy", "is_approved", "vehicle_type", "vehicle_infor", "driving_license_infor", "avatar_picture", "current_location") 
        VALUES ('${d.id}'::uuid, ${d.rating}, ${d.isOnline}, ${d.isBusy}, true, '${d.type}', '${d.car}', 'LICENSE-${d.phone}', '${d.avatar}', ST_SetSRID(ST_MakePoint(${d.lng}, ${d.lat}), 4326)::geography)
        ON CONFLICT (user_id) DO UPDATE SET 
          "average_rating" = EXCLUDED."average_rating",
          "is_online" = EXCLUDED."is_online",
          "vehicle_infor" = EXCLUDED."vehicle_infor",
          "current_location" = EXCLUDED."current_location";
      `);
      console.log(`Đã cập nhật/tạo tài xế: ${d.name}`);
    }

    // 5. Seed completed rides & payments for driver Nam to show in chart
    console.log('--- Bắt đầu seed lịch sử chuyến đi cho tài xế Nam ---');
    
    // Clear old data first
    await prisma.$executeRawUnsafe(`
      DELETE FROM "payments" WHERE "ride_id" IN (SELECT "id" FROM "rides" WHERE "driver_id" = '11111111-1111-1111-1111-111111111111'::uuid);
    `);
    await prisma.$executeRawUnsafe(`
      DELETE FROM "rides" WHERE "driver_id" = '11111111-1111-1111-1111-111111111111'::uuid;
    `);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentDayNum = now.getDay();
    const distanceToMonday = currentDayNum === 0 ? -6 : 1 - currentDayNum;
    const monday = new Date(today.getTime() + distanceToMonday * 24 * 60 * 60 * 1000);

    const tripsToSeed = [
      { dayOffset: 0, amount: 150000, startAddr: "Hanoi Opera House", endAddr: "Bach Khoa University" },
      { dayOffset: 1, amount: 250000, startAddr: "Hoan Kiem Lake", endAddr: "Noi Bai Airport" },
      { dayOffset: 1, amount: 150000, startAddr: "Vinhomes Ocean Park", endAddr: "Times City" },
      { dayOffset: 2, amount: 100000, startAddr: "Lotte Center", endAddr: "West Lake" },
      { dayOffset: 3, amount: 350000, startAddr: "Aeon Mall Long Bien", endAddr: "Royal City" },
      { dayOffset: 3, amount: 150000, startAddr: "Keangnam Landmark", endAddr: "National Convention Center" },
      { dayOffset: 4, amount: 450000, startAddr: "Ba Dinh Square", endAddr: "Noi Bai Airport" },
      { dayOffset: 4, amount: 1000000, startAddr: "Hanoi Station", endAddr: "Haiphong Highway" },
      { dayOffset: 5, amount: 200000, startAddr: "My Dinh Stadium", endAddr: "Hoang Mai" },
      { dayOffset: 6, amount: 250000, startAddr: "West Lake", endAddr: "Dong Da" }
    ];

    for (const trip of tripsToSeed) {
      const tripDate = new Date(monday.getTime() + trip.dayOffset * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000);
      const isoDate = tripDate.toISOString();

      await prisma.$executeRawUnsafe(`
        DO $$
        DECLARE
          v_ride_id uuid := gen_random_uuid();
        BEGIN
          INSERT INTO "rides" (
            "id", "passenger_id", "driver_id", "start_address", "end_address",
            "start_location", "end_location", "match_fee", "match_type", "vehicle_type_requested", "status", "created_at"
          ) VALUES (
            v_ride_id,
            '22222222-2222-2222-2222-111111111111'::uuid,
            '11111111-1111-1111-1111-111111111111'::uuid,
            '${trip.startAddr}',
            '${trip.endAddr}',
            ST_SetSRID(ST_MakePoint(105.8458, 21.0065), 4326)::geography,
            ST_SetSRID(ST_MakePoint(105.8430, 21.0045), 4326)::geography,
            ${trip.amount},
            'CAR',
            'Sedan',
            'COMPLETED',
            '${isoDate}'::timestamp
          );

          INSERT INTO "payments" (
            "id", "ride_id", "total_amount", "payment_type", "status", "created_at"
          ) VALUES (
            gen_random_uuid(),
            v_ride_id,
            ${trip.amount},
            'CARD',
            'SUCCESS',
            '${isoDate}'::timestamp
          );
        END $$;
      `);
    }

    console.log(`Đã seed thành công ${tripsToSeed.length} chuyến đi mẫu cho tài xế Nam!`);

    // 4. Bật lại kiểm tra khóa ngoại
    await prisma.$executeRawUnsafe('SET session_replication_role = \'origin\';');
    console.log('--- Seed hoàn tất (Dữ liệu cũ được giữ lại và cập nhật)! ---');

  } catch (error) {
    await prisma.$executeRawUnsafe('SET session_replication_role = \'origin\';');
    console.error('Lỗi khi seed dữ liệu:', error);
    throw error;
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
