import prisma from '../src/config/db';

async function main() {
  console.log('Seed starting...');

  try {
    // Disable FK checks temporarily
    await prisma.$executeRawUnsafe('SET session_replication_role = \'replica\';');

    // 1. Clear existing data
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "driver_profiles" CASCADE;');
    await prisma.$executeRawUnsafe('DELETE FROM "profiles" WHERE "role" = \'DRIVER\';');

    console.log('Cleaned up old driver data.');

    // Center point: Ga Minh Khai, Hanoi (approx 21.0543, 105.7591)
    const drivers = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: "Nguyen Van A (Sedan - Near Ga Minh Khai)",
        phone: "0911111111",
        lat: 21.055, 
        lng: 105.761, 
        car: "TOYOTA VIOS • WHITE",
        type: "Sedan",
        rating: 4.9,
        isOnline: true,
        isBusy: false,
        isApproved: true,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=face"
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: "Le Thi B (SUV - Medium Dist)",
        phone: "0922222222",
        lat: 21.060, 
        lng: 105.770, 
        car: "MAZDA CX-5 • RED",
        type: "SUV",
        rating: 4.7,
        isOnline: true,
        isBusy: false,
        isApproved: true,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=face"
      },
      {
        id: '00000000-0000-0000-0000-000000000003',
        name: "Tran Van C (Sedan - 3km Boundary)",
        phone: "0933333333",
        lat: 21.075, 
        lng: 105.775, 
        car: "HONDA CITY • BLACK",
        type: "Sedan",
        rating: 4.5,
        isOnline: true,
        isBusy: false,
        isApproved: true,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&crop=face"
      },
      {
        id: '00000000-0000-0000-0000-000000000004',
        name: "Pham Van D (Outside 3km)",
        phone: "0944444444",
        lat: 21.100, 
        lng: 105.800, 
        car: "VINFAST VF8 • BLUE",
        type: "SUV",
        rating: 5.0,
        isOnline: true,
        isBusy: false,
        isApproved: true,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face"
      },
      {
        id: '00000000-0000-0000-0000-000000000005',
        name: "Hoang Van E (Offline Near Station)",
        phone: "0955555555",
        lat: 21.053, 
        lng: 105.758, 
        car: "KIA MORNING • SILVER",
        type: "Sedan",
        rating: 4.2,
        isOnline: false,
        isBusy: false,
        isApproved: true,
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=face"
      },
      {
        id: '00000000-0000-0000-0000-000000000006',
        name: "Ngo Van F (Busy Near Station)",
        phone: "0966666666",
        lat: 21.056, 
        lng: 105.762, 
        car: "HYUNDAI ACCENT • BLUE",
        type: "Sedan",
        rating: 4.6,
        isOnline: true,
        isBusy: true,
        isApproved: true,
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=160&h=160&fit=crop&crop=face"
      }
    ];

    for (const d of drivers) {
      // Insert profile using raw SQL
      await prisma.$executeRawUnsafe(`
        INSERT INTO "profiles" ("id", "full_name", "phone", "role", "status")
        VALUES ('${d.id}'::uuid, '${d.name}', '${d.phone}', 'DRIVER', 'ACTIVE')
        ON CONFLICT ("id") DO UPDATE SET "full_name" = EXCLUDED."full_name";
      `);

      await prisma.$executeRawUnsafe(`
        INSERT INTO "driver_profiles" 
        ("user_id", "average_rating", "is_online", "is_busy", "is_approved", "vehicle_type", "vehicle_infor", "driving_license_infor", "avatar_picture", "current_location")
        VALUES (
          '${d.id}'::uuid, 
          ${d.rating}, 
          ${d.isOnline}, 
          ${d.isBusy}, 
          ${d.isApproved}, 
          '${d.type}', 
          '${d.car}', 
          'LICENSE-${d.phone}',
          '${d.avatar}',
          ST_SetSRID(ST_MakePoint(${d.lng}, ${d.lat}), 4326)::geography
        )
        ON CONFLICT ("user_id") DO NOTHING;
      `);
      
      console.log(`Created driver: ${d.name}`);
    }

    // Re-enable FK checks
    await prisma.$executeRawUnsafe('SET session_replication_role = \'origin\';');

    console.log('Seed completed successfully!');
  } catch (error) {
    await prisma.$executeRawUnsafe('SET session_replication_role = \'origin\';');
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
