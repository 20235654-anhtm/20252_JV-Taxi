import { Role, RideStatus, ProfileStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../src/config/db';

// Helper to generate a random date between two dates
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper for Japanese names
const jpLastNames = ['佐藤', '鈴木', '高橋', '田中', '渡辺', '伊藤', '山本', '中村', '小林', '加藤'];
const jpFirstNames = ['健太', '大樹', '翔太', 'さくら', '結衣', '陽菜', '直樹', '太郎', '一郎', '美咲'];
const getJpName = () => `${jpLastNames[Math.floor(Math.random() * jpLastNames.length)]} ${jpFirstNames[Math.floor(Math.random() * jpFirstNames.length)]}`;

// Helper for Vietnamese driver names
const vnNames = [
  'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Minh Đức', 'Hoàng Quốc Ân',
  'Đặng Thu Hà', 'Bùi Văn Tiến', 'Đỗ Thị Mai', 'Hồ Quang Hải', 'Ngô Thanh Tùng',
  'Dương Tuấn Anh', 'Lý Hải Đăng', 'Vũ Hồng Phong', 'Phan Hữu Dũng', 'Vương Đình Đạt',
  'Trịnh Xuân Lộc', 'Đinh Trọng Thủy', 'Đoàn Văn Hậu', 'Trương Tuấn Khanh', 'Nguyễn Tiến Minh'
];
const getVnName = () => vnNames[Math.floor(Math.random() * vnNames.length)]!;

// Japanese positive review comments
const positiveReviews = [
  'とても親切な運転手さんでした。',
  '運転が丁寧で安心して乗れました。',
  '車内が清潔で快適でした。',
  '時間通りに到着して助かりました。',
  '日本語でのコミュニケーションがスムーズで助かりました！',
  '素晴らしいサービスです。',
  'また利用したいと思います。',
  '道に詳しくてスムーズでした。',
  '荷物を運んでくれて助かりました。'
];

async function main() {
  console.log('Starting seed...');

  // 1. CLEAR EXISTING DATA
  console.log('Clearing old data...');
  await prisma.message.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.ride.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.driverProfile.deleteMany();
  await prisma.profile.deleteMany();
  // Note: We don't delete PriceRule

  const passwordHash = await bcrypt.hash('123456', 10);

  // 2. CREATE ADMIN
  console.log('Creating admin...');
  await prisma.profile.create({
    data: {
      email: 'admin@jvtaxi.com',
      phone: '0000000000',
      passwordHash,
      fullName: 'System Admin',
      role: Role.ADMIN,
      status: ProfileStatus.ACTIVE
    }
  });

  // 3. CREATE PASSENGERS (50)
  console.log('Creating 50 passengers...');
  const passengers = [];
  for (let i = 0; i < 50; i++) {
    const pass = await prisma.profile.create({
      data: {
        email: `passenger${i}@example.com`,
        phone: `090100${i.toString().padStart(4, '0')}`,
        passwordHash,
        fullName: getJpName(),
        avatar: `https://avatar.iran.liara.run/public/${i % 50}`,
        role: Role.CUSTOMER,
        status: ProfileStatus.ACTIVE,
        paymentMethods: {
          create: {
            cardDetails: `**** **** **** ${1000 + i}`
          }
        }
      }
    });
    passengers.push(pass);
  }

  // 4. CREATE DRIVERS (30)
  console.log('Creating 30 drivers...');
  const drivers = [];
  for (let i = 0; i < 30; i++) {
    const driver = await prisma.profile.create({
      data: {
        email: `driver${i}@example.com`,
        phone: `090200${i.toString().padStart(4, '0')}`,
        passwordHash,
        fullName: getVnName(),
        avatar: `https://avatar.iran.liara.run/public/${50 + i}`,
        role: Role.DRIVER,
        status: ProfileStatus.ACTIVE,
        driverProfile: {
          create: {
            isApproved: true,
            vehicleType: '4_SEAT',
            japaneseCerInfor: i % 3 === 0 ? 'N3' : i % 3 === 1 ? 'N4' : 'N2',
            drivingLicenseInfor: 'Valid License',
            vehicleInfor: `Toyota Vios 29A-${10000 + i}`,
            avatarPicture: `https://avatar.iran.liara.run/public/${50 + i}`
          }
        }
      }
    });
    drivers.push(driver);
  }

  // 4.5 CREATE PENDING DRIVERS (5)
  console.log('Creating 5 pending drivers...');
  const pendingDrivers = [];
  for (let i = 0; i < 5; i++) {
    const driver = await prisma.profile.create({
      data: {
        email: `pendingdriver${i}@example.com`,
        phone: `090400${i.toString().padStart(4, '0')}`,
        passwordHash,
        fullName: getVnName(),
        avatar: `https://avatar.iran.liara.run/public/${80 + i}`,
        role: Role.DRIVER,
        status: ProfileStatus.ACTIVE,
        driverProfile: {
          create: {
            isApproved: false,
            vehicleType: '4_SEAT',
            japaneseCerInfor: 'N3',
            drivingLicenseInfor: 'Pending License Check',
            vehicleInfor: `Honda City 30H-${20000 + i}`,
            avatarPicture: `https://avatar.iran.liara.run/public/${80 + i}`
          }
        }
      }
    });
    pendingDrivers.push(driver);
  }

  // 5. CREATE DEMO ACCOUNTS
  console.log('Creating Demo Driver & Passenger...');

  const demoDriver = await prisma.profile.create({
    data: {
      email: 'demodriver@jvtaxi.com',
      phone: '0909999999',
      passwordHash,
      fullName: 'VIP Driver (Demo)',
      avatar: 'https://avatar.iran.liara.run/public/boy',
      role: Role.DRIVER,
      status: ProfileStatus.ACTIVE,
      driverProfile: {
        create: {
          isApproved: true,
          vehicleType: '7_SEAT',
          japaneseCerInfor: 'N1', // Highest JLPT
          drivingLicenseInfor: 'Valid License VIP',
          vehicleInfor: 'Toyota Innova 30G-99999',
          avatarPicture: 'https://avatar.iran.liara.run/public/boy'
        }
      }
    }
  });

  const demoPassenger = await prisma.profile.create({
    data: {
      email: 'demopassenger@jvtaxi.com',
      phone: '0808888888',
      passwordHash,
      fullName: 'VIP Passenger (Demo)',
      avatar: 'https://avatar.iran.liara.run/public/girl',
      role: Role.CUSTOMER,
      status: ProfileStatus.ACTIVE,
      paymentMethods: {
        create: {
          cardDetails: '**** **** **** 8888'
        }
      }
    }
  });

  // 6. SEED RIDES & REVIEWS FOR NORMAL DRIVERS (20 rides each)
  console.log('Seeding rides and reviews for normal drivers...');
  const startDate = new Date('2026-05-15T00:00:00Z');
  const endDate = new Date('2026-06-15T00:00:00Z'); // "Today"

  // Helpers for locations around Hanoi
  const hanoiLocations = [
    { name: 'Hoàn Kiếm, Hà Nội', lat: 21.0285, lng: 105.8542 },
    { name: 'Ba Đình, Hà Nội', lat: 21.0362, lng: 105.8335 },
    { name: 'Cầu Giấy, Hà Nội', lat: 21.0315, lng: 105.7946 },
    { name: 'Đống Đa, Hà Nội', lat: 21.0180, lng: 105.8242 },
    { name: 'Hai Bà Trưng, Hà Nội', lat: 21.0084, lng: 105.8517 },
    { name: 'Thanh Xuân, Hà Nội', lat: 20.9937, lng: 105.8055 },
    { name: 'Hoàng Mai, Hà Nội', lat: 20.9754, lng: 105.8427 },
    { name: 'Long Biên, Hà Nội', lat: 21.0423, lng: 105.8926 },
    { name: 'Hà Đông, Hà Nội', lat: 20.9701, lng: 105.7725 },
    { name: 'Tây Hồ, Hà Nội', lat: 21.0664, lng: 105.8252 },
  ];

  for (const driver of drivers) {
    let totalStar = 0, commStar = 0, attStar = 0, safStar = 0;

    for (let i = 0; i < 20; i++) {
      const passenger = passengers[Math.floor(Math.random() * passengers.length)]!;
      const rideDate = randomDate(startDate, endDate);

      const startLoc = hanoiLocations[Math.floor(Math.random() * hanoiLocations.length)]!;
      let endLoc = hanoiLocations[Math.floor(Math.random() * hanoiLocations.length)]!;
      while (endLoc.name === startLoc.name) {
        endLoc = hanoiLocations[Math.floor(Math.random() * hanoiLocations.length)]!;
      }

      const sLat = startLoc.lat + (Math.random() - 0.5) * 0.05;
      const sLng = startLoc.lng + (Math.random() - 0.5) * 0.05;
      const eLat = endLoc.lat + (Math.random() - 0.5) * 0.05;
      const eLng = endLoc.lng + (Math.random() - 0.5) * 0.05;

      // Create Ride via raw to inject postgis
      const rideId = crypto.randomUUID();
      await prisma.$executeRaw`
        INSERT INTO "rides" ("id", "passenger_id", "driver_id", "start_address", "end_address", "start_location", "end_location", "match_fee", "match_type", "vehicle_type_requested", "status", "created_at")
        VALUES (
          ${rideId}::uuid, 
          ${passenger.id}::uuid, 
          ${driver.id}::uuid, 
          ${startLoc.name}, 
          ${endLoc.name}, 
          ST_SetSRID(ST_MakePoint(${sLng}, ${sLat}), 4326), 
          ST_SetSRID(ST_MakePoint(${eLng}, ${eLat}), 4326), 
          ${Math.floor(Math.random() * 100000) + 50000}, 
          'STANDARD', 
          '4_SEAT', 
          'COMPLETED',
          ${rideDate}
        )
      `;

      // Payment
      await prisma.payment.create({
        data: {
          rideId,
          totalAmount: Math.floor(Math.random() * 100000) + 50000,
          paymentType: 'CREDIT_CARD',
          status: 'SUCCESS',
          createdAt: rideDate
        }
      });

      // Review (mostly 4-5 stars)
      const isPerfect = Math.random() > 0.3;
      const s1 = isPerfect ? 5 : 4;
      const s2 = isPerfect ? 5 : (Math.random() > 0.5 ? 4 : 3);
      const s3 = isPerfect ? 5 : 4;
      const overall = Math.round((s1 + s2 + s3) / 3);

      totalStar += overall;
      commStar += s1;
      attStar += s2;
      safStar += s3;

      await prisma.review.create({
        data: {
          rideId,
          reviewerId: passenger.id,
          driverId: driver.id,
          starReview: overall,
          communicationStar: s1,
          attitudeStar: s2,
          safetyStar: s3,
          commentReview: positiveReviews[Math.floor(Math.random() * positiveReviews.length)] || '',
          createdAt: new Date(rideDate.getTime() + 600000) // 10 mins later
        }
      });
    }

    // Update driver averages
    await prisma.driverProfile.update({
      where: { userId: driver.id },
      data: {
        averageRating: totalStar / 20,
        communicationAverage: commStar / 20,
        attitudeAverage: attStar / 20,
        safetyAverage: safStar / 20,
      }
    });
  }

  // 7. SEED RIDES FOR DEMO ACCOUNTS
  console.log('Seeding rides and reviews for Demo Driver...');

  let totalStarD = 0, commStarD = 0, attStarD = 0, safStarD = 0;
  const demoRideCount = 50;

  for (let i = 0; i < demoRideCount; i++) {
    // 10 rides are with demoPassenger, rest with random passengers
    const passenger = i < 10 ? demoPassenger : passengers[Math.floor(Math.random() * passengers.length)]!;
    const rideDate = randomDate(startDate, endDate);

    const startLoc = hanoiLocations[Math.floor(Math.random() * hanoiLocations.length)]!;
    let endLoc = hanoiLocations[Math.floor(Math.random() * hanoiLocations.length)]!;
    while (endLoc.name === startLoc.name) {
      endLoc = hanoiLocations[Math.floor(Math.random() * hanoiLocations.length)]!;
    }

    const sLat = startLoc.lat + (Math.random() - 0.5) * 0.05;
    const sLng = startLoc.lng + (Math.random() - 0.5) * 0.05;
    const eLat = endLoc.lat + (Math.random() - 0.5) * 0.05;
    const eLng = endLoc.lng + (Math.random() - 0.5) * 0.05;

    const rideId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "rides" ("id", "passenger_id", "driver_id", "start_address", "end_address", "start_location", "end_location", "match_fee", "match_type", "vehicle_type_requested", "status", "created_at")
      VALUES (
        ${rideId}::uuid, 
        ${passenger.id}::uuid, 
        ${demoDriver.id}::uuid, 
        ${startLoc.name}, 
        ${endLoc.name}, 
        ST_SetSRID(ST_MakePoint(${sLng}, ${sLat}), 4326), 
        ST_SetSRID(ST_MakePoint(${eLng}, ${eLat}), 4326), 
        ${Math.floor(Math.random() * 200000) + 50000}, 
        'STANDARD', 
        '7_SEAT', 
        'COMPLETED',
        ${rideDate}
      )
    `;

    await prisma.payment.create({
      data: {
        rideId,
        totalAmount: Math.floor(Math.random() * 200000) + 50000,
        paymentType: 'CREDIT_CARD',
        status: 'SUCCESS',
        createdAt: rideDate
      }
    });

    let overall, s1, s2, s3, comment;

    // The ONE funny bad review (at i == 15)
    if (i === 15) {
      s1 = 1; s2 = 2; s3 = 2;
      overall = 2;
      comment = '今日は気分が悪いので低評価にします。運転手さんに問題はありません。'; // "I'm in a bad mood today, so I'll give a low rating. There's no problem with the driver."
    } else {
      s1 = 5; s2 = 5; s3 = 5;
      overall = 5;
      comment = positiveReviews[Math.floor(Math.random() * positiveReviews.length)] || '';
    }

    totalStarD += overall;
    commStarD += s1;
    attStarD += s2;
    safStarD += s3;

    await prisma.review.create({
      data: {
        rideId,
        reviewerId: passenger.id,
        driverId: demoDriver.id,
        starReview: overall,
        communicationStar: s1,
        attitudeStar: s2,
        safetyStar: s3,
        commentReview: comment,
        createdAt: new Date(rideDate.getTime() + 600000)
      }
    });
  }

  // Update demo driver averages
  await prisma.driverProfile.update({
    where: { userId: demoDriver.id },
    data: {
      averageRating: totalStarD / demoRideCount,
      communicationAverage: commStarD / demoRideCount,
      attitudeAverage: attStarD / demoRideCount,
      safetyAverage: safStarD / demoRideCount,
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
