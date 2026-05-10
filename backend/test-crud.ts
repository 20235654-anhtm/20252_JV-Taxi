import prisma from './src/config/db';
import { driverProfileService } from './src/services/driverProfile.service';
import { rideService } from './src/services/ride.service';
import { reviewService } from './src/services/review.service';

// IDs của 2 test users đã tạo sẵn trong Supabase (chạy sql/seed-test-users.sql trước)
const RIDER_ID  = '11111111-1111-1111-1111-111111111111';
const DRIVER_ID = '22222222-2222-2222-2222-222222222222';

async function testCRUD() {
  console.log('=== BẮT ĐẦU TEST CRUD ===\n');
  let rideId   = '';
  let reviewId = '';

  try {
    // 1. Kiểm tra profiles đã tồn tại chưa (trigger tự tạo)
    console.log('[1] Kiểm tra profiles test users...');
    const profiles = await prisma.$queryRaw<{ id: string; role: string }[]>`
      SELECT id, role FROM profiles
      WHERE id IN (${RIDER_ID}::uuid, ${DRIVER_ID}::uuid)
    `;
    if (profiles.length < 2) {
      throw new Error(
        '❌ Chưa tìm thấy đủ 2 profiles. Hãy chạy sql/seed-test-users.sql trong Supabase trước!'
      );
    }
    console.log(`✅ Tìm thấy ${profiles.length} profiles.`);

    // 2. Cập nhật thông tin profile (READ + UPDATE)
    console.log('\n[2] Cập nhật thông tin profiles...');
    await prisma.$executeRaw`
      UPDATE profiles SET phone = '+84902000001', full_name = 'Khách Hàng Test'
      WHERE id = ${RIDER_ID}::uuid
    `;
    await prisma.$executeRaw`
      UPDATE profiles SET phone = '+84902000002', full_name = 'Tài Xế Test', role = 'DRIVER'
      WHERE id = ${DRIVER_ID}::uuid
    `;
    console.log('✅ Cập nhật profiles thành công.');

    // 3. Tạo DriverProfile (CREATE)
    console.log('\n[3] Tạo DriverProfile...');
    // Xoá nếu đã tồn tại từ lần test trước
    await driverProfileService.deleteDriverProfile(DRIVER_ID).catch(() => {});
    const driverProfile = await driverProfileService.createDriverProfile({
      userId: DRIVER_ID,
      drivingLicenseInfor: 'B2-123456',
      vehicleInfor: 'Toyota Vios - 29A 123.45',
      vehicleType: '4_SEATS',
      lng: 105.8,
      lat: 21.0,
    });
    const dpUserId = (driverProfile as any).user_id ?? driverProfile.userId;
    console.log('✅ DriverProfile tạo thành công. userId:', dpUserId);

    // 4. Lấy DriverProfile (READ)
    console.log('\n[4] Lấy DriverProfile theo ID...');
    const fetched = await driverProfileService.getDriverProfileById(DRIVER_ID);
    console.log('✅ vehicleType:', fetched?.vehicleType, '| isOnline:', fetched?.isOnline);

    // 5. Cập nhật DriverProfile (UPDATE)
    console.log('\n[5] Cập nhật DriverProfile (isOnline = true)...');
    await driverProfileService.updateDriverProfile(DRIVER_ID, { isOnline: true });
    const afterUpdate = await driverProfileService.getDriverProfileById(DRIVER_ID);
    console.log('✅ isOnline sau update:', afterUpdate?.isOnline);

    // 6. Tạo Ride (CREATE)
    console.log('\n[6] Tạo Ride...');
    const ride = await rideService.createRide({
      passengerId: RIDER_ID,
      driverId:    DRIVER_ID,
      startAddress: '1 Đại Cồ Việt, Hà Nội',
      endAddress:   '12 Láng Hạ, Hà Nội',
      startLng: 105.85, startLat: 21.03,
      endLng:   105.81, endLat:   21.02,
      matchFee: 45000,
      matchType: 'AUTO',
    });
    rideId = ride.id;
    console.log('✅ Ride tạo thành công. ID:', rideId);

    // 7. Lấy Ride theo ID (READ)
    console.log('\n[7] Lấy Ride theo ID...');
    const fetchedRide = await rideService.getRideById(rideId);
    console.log('✅ Status:', fetchedRide?.status, '| matchFee:', fetchedRide?.matchFee?.toString());

    // 8. Cập nhật Ride status (UPDATE)
    console.log('\n[8] Cập nhật Ride status → ACCEPTED...');
    const updatedRide = await rideService.updateRideStatus(rideId, 'ACCEPTED');
    console.log('✅ Status mới:', updatedRide.status);

    // 9. Lấy danh sách Ride của Passenger (READ LIST)
    console.log('\n[9] Lấy danh sách Ride của Passenger...');
    const ridesByPassenger = await rideService.getRidesByPassenger(RIDER_ID);
    console.log('✅ Số rides:', ridesByPassenger.length);

    // 10. Tìm tài xế gần đó (GEO QUERY)
    console.log('\n[10] Tìm tài xế gần điểm (105.8, 21.0) trong bán kính 5km...');
    const nearbyDrivers = await driverProfileService.findNearbyDrivers(105.8, 21.0, 5000);
    console.log('✅ Số tài xế gần đó:', nearbyDrivers.length);

    // 11. Tạo Review (CREATE)
    console.log('\n[11] Tạo Review...');
    const review = await reviewService.createReview({
      ride:     { connect: { id: rideId } },
      reviewer: { connect: { id: RIDER_ID } },
      driver:   { connect: { id: DRIVER_ID } },
      starReview:    5,
      commentReview: 'Tài xế rất thân thiện và đúng giờ!',
    });
    reviewId = review.id;
    console.log('✅ Review tạo thành công. starReview:', review.starReview);

    // 12. Lấy Reviews của Driver (READ LIST)
    console.log('\n[12] Lấy danh sách Review của Driver...');
    const reviews = await reviewService.getReviewsByDriverId(DRIVER_ID);
    console.log('✅ Số reviews:', reviews.length);

    // 13. Kiểm tra averageRating đã tự cập nhật chưa
    console.log('\n[13] Kiểm tra averageRating của Driver...');
    const driverAfterReview = await driverProfileService.getDriverProfileById(DRIVER_ID);
    console.log('✅ averageRating:', driverAfterReview?.averageRating?.toString());

    console.log('\n✅✅✅ TẤT CẢ CRUD HOẠT ĐỘNG TRƠN TRU ✅✅✅');

  } catch (error) {
    console.error('\n❌ LỖI:', error instanceof Error ? error.message : error);
  } finally {
    // Dọn dẹp data test (giữ lại profiles và auth users)
    console.log('\n--- Dọn dẹp data test ---');
    try {
      if (reviewId) {
        await reviewService.deleteReview(reviewId);
        console.log('✅ Xoá Review.');
      }
      if (rideId) {
        await rideService.deleteRide(rideId);
        console.log('✅ Xoá Ride.');
      }
      await driverProfileService.deleteDriverProfile(DRIVER_ID).catch(() => {});
      console.log('✅ Xoá DriverProfile.');

      // Reset profile info
      await prisma.$executeRaw`
        UPDATE profiles SET phone = NULL, full_name = NULL, role = 'CUSTOMER'
        WHERE id IN (${RIDER_ID}::uuid, ${DRIVER_ID}::uuid)
      `;
      console.log('✅ Reset profiles về trạng thái ban đầu.');
    } catch (cleanupErr) {
      console.error('Lỗi khi dọn dẹp:', cleanupErr);
    }
    await prisma.$disconnect();
    console.log('--- Hoàn tất ---');
  }
}

testCRUD();
