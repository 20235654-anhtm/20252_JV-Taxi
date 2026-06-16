import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { MapCard } from '../../components/RideDetail/MapCard';
import { DriverInfoCard } from '../../components/RideDetail/DriverInfoCard';
import { RouteTimelineCard } from '../../components/RideDetail/RouteTimelineCard';
import { TripStatsCard } from '../../components/RideDetail/TripStatsCard';
import { ReceiptCard } from '../../components/RideDetail/ReceiptCard';
import { ReviewCard } from '../../components/RideDetail/ReviewCard';
import { API_BASE_URL } from '../../config/api';
import { removeVietnameseTones } from '../../utils/stringUtils';
import './Profile.css';

const TripDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRideDetail = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/rides/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch ride details');
        const resData = await response.json();
        if (resData.success) {
          setRide(resData.data);
        }
      } catch (error) {
        console.error('Error fetching ride detail:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRideDetail();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="pp-container bg-[#f4fbf1] relative min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006D37]"></div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="pp-container bg-[#f4fbf1] relative min-h-screen flex flex-col">
        <Header 
          showBackButton={true} 
          hideBrandName={true} 
          title="履歴" 
          hideLanguageToggle={true}
          onBackClick={() => navigate(-1)}
        />
        <div className="flex-1 flex items-center justify-center p-4 text-[#3D4A3F] text-[16px]">
          乗車履歴が見つかりません。
        </div>
      </div>
    );
  }

  // Helper mappings
  const getLocDetails = (addr: string) => {
    if (!addr) return { name: '...', address: '...' };
    addr = removeVietnameseTones(addr);
    const parts = addr.split(',');
    if (parts.length > 1) {
      return {
        name: parts[0].trim(),
        address: parts.slice(1).join(',').trim()
      };
    }
    return { name: addr, address: addr };
  };

  const getCarModel = (info: string) => {
    if (!info) return '...';
    try {
      const parsed = JSON.parse(info);
      const model = parsed.model || parsed.brand || '';
      const plate = parsed.plate || parsed.plateNumber || '';
      if (model && plate) return `${model} • ${plate}`;
      return model || info;
    } catch (e) {
      return info;
    }
  };

  const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const startLoc = getLocDetails(ride.startAddress);
  const endLoc = getLocDetails(ride.endAddress);

  // Time format
  const dateObj = new Date(ride.createdAt);
  const hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? '午後' : '午前';
  const displayHours = hours % 12 || 12;
  const startTime = `${ampm}${String(displayHours).padStart(2, '0')}:${minutes}`;

  // Estimate end time (add 25 mins)
  const endDateObj = new Date(dateObj.getTime() + 25 * 60 * 1000);
  const endHours = endDateObj.getHours();
  const endMinutes = String(endDateObj.getMinutes()).padStart(2, '0');
  const endAmpm = endHours >= 12 ? '午後' : '午前';
  const endDisplayHours = endHours % 12 || 12;
  const endTime = `${endAmpm}${String(endDisplayHours).padStart(2, '0')}:${endMinutes}`;

  const distanceVal = getDistanceInKm(ride.startLat, ride.startLng, ride.endLat, ride.endLng);
  const distanceStr = distanceVal > 0 ? `${distanceVal.toFixed(1)} km` : '...';
  const durationMinutes = Math.round(distanceVal * 2.5) || 10;
  const durationStr = `${durationMinutes}分`;

  const paymentMethod = ride.payment?.paymentType === 'CARD' ? 'クレジットカード' : '現金';
  const totalAmount = Number(ride.payment?.totalAmount || ride.matchFee || 0);
  const totalStr = `₫${totalAmount.toLocaleString('vi-VN')}`;
  const bookingFeeVal = 10000;
  const bookingFeeStr = `₫${bookingFeeVal.toLocaleString('vi-VN')}`;
  const distanceFeeStr = `₫${Math.max(0, totalAmount - bookingFeeVal).toLocaleString('vi-VN')}`;

  // Review
  const myReview = ride.reviews?.find((r: any) => r.reviewerId === ride.passengerId);
  const rating = myReview?.starReview || 0;
  const comment = myReview?.commentReview || '';
  const reviewDate = myReview?.createdAt 
    ? (() => {
        const d = new Date(myReview.createdAt);
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
      })()
    : '';

  const pickupPosition = ride.startLat && ride.startLng ? { lat: Number(ride.startLat), lng: Number(ride.startLng) } : { lat: 10.7630, lng: 106.6822 };
  const destinationPosition = ride.endLat && ride.endLng ? { lat: Number(ride.endLat), lng: Number(ride.endLng) } : { lat: 10.8142, lng: 106.6663 };
  const driverAvatar = ride.driver?.driverProfile?.avatarPicture || ride.driver?.avatar || 'https://avatar.iran.liara.run/public/boy';
  const carModel = getCarModel(ride.driver?.driverProfile?.vehicleInfor);

  const handleMessageDriver = () => {
    navigate('/passenger/chat', {
      state: {
        rideId: id,
        driver: {
          name: ride.driver?.fullName || '...',
          avatar: driverAvatar
        },
        from: 'history'
      }
    });
  };

  // Mapped status
  const statusMap: Record<string, string> = {
    PENDING: '保留中',
    ACCEPTED: '受付済',
    REJECTED: '拒否',
    COMPLETED: '完了',
    CANCELLED: 'キャンセル済',
  };
  const mappedStatus = statusMap[ride.status] || ride.status;

  return (
    <div className="pp-container bg-[#f4fbf1] relative min-h-screen">
      <Header 
        showBackButton={true} 
        hideBrandName={true} 
        title="履歴" 
        hideLanguageToggle={true}
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pt-[100px] pb-[60px] px-[24px] w-full">
        <div className="max-w-[430px] mx-auto flex flex-col gap-[24px]">
          {/* 1. Map */}
          <MapCard 
            pickupPosition={pickupPosition}
            destinationPosition={destinationPosition}
            status={mappedStatus}
          />

          {/* 2. Driver Info */}
          <DriverInfoCard 
            driverName={ride.driver?.fullName || '未定'}
            driverAvatar={driverAvatar}
            carModel={carModel}
            driverNameKana={ride.driver?.fullName || '...'}
            onMessageClick={handleMessageDriver}
          />

          {/* 3. Route Timeline */}
          <RouteTimelineCard 
            startLocationName={startLoc.name}
            startLocationAddress={startLoc.address}
            endLocationName={endLoc.name}
            endLocationAddress={endLoc.address}
            startTime={startTime}
            endTime={endTime}
          />

          {/* 4. Trip Stats */}
          <TripStatsCard 
            duration={durationStr}
            distance={distanceStr}
            paymentMethod={paymentMethod}
          />

          {/* 5. Receipt */}
          <ReceiptCard 
            distanceFee={distanceFeeStr}
            bookingFee={bookingFeeStr}
            total={totalStr}
            distanceLabel={`距離料金 (${distanceStr})`}
          />

          {/* 6. Review Section (Heading + Card) */}
          {rating > 0 && (
            <div className="flex flex-col gap-[16px]">
              <div className="w-full flex justify-between items-center">
                <div className="flex flex-col justify-start items-start pr-[15px]">
                  <div className="h-[56px] flex flex-col justify-center text-[#171D17] text-[20px] font-['Plus_Jakarta_Sans',sans-serif] font-[800] leading-[28px] break-words">
                    あなたのレビュー
                  </div>
                </div>
                {reviewDate && (
                  <div className="h-[36px] px-[12px] py-[4px] bg-[#E9F0E6] rounded-full flex justify-center items-center">
                    <div className="flex flex-col justify-center text-center text-[#3D4A3F] text-[12px] font-['Plus_Jakarta_Sans',sans-serif] font-[500] leading-[16px] break-words">
                      {reviewDate}
                    </div>
                  </div>
                )}
              </div>
              <ReviewCard 
                rating={rating}
                comment={comment}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
