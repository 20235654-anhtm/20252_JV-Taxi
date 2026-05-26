import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { ALL_MOCK_TRIPS } from './RideHistory';
import { MapCard } from '../../components/RideDetail/MapCard';
import { DriverInfoCard } from '../../components/RideDetail/DriverInfoCard';
import { RouteTimelineCard } from '../../components/RideDetail/RouteTimelineCard';
import { TripStatsCard } from '../../components/RideDetail/TripStatsCard';
import { ReceiptCard } from '../../components/RideDetail/ReceiptCard';
import { ReviewCard } from '../../components/RideDetail/ReviewCard';
import type { TripDetailData } from '../../types/TripDetail';
import './Profile.css';

const mockTripDetails: Record<string, TripDetailData> = {
  "trip-1": {
    carModel: "Toyota Crown • 51F-\n888.88",
    driverNameKana: "佐藤 健二",
    duration: "42分",
    distance: "8.4 km",
    paymentMethod: "Business Visa •••• 4242",
    distanceFee: "84,000 VND",
    bookingFee: "15,000 VND",
    total: "99,000 VND",
    rating: 5,
    comment: "とてもスムーズな運転で、荷物も手伝ってくれました！",
    reviewDate: "2023年10月8日",
    endTime: "午前09:12",
    pickupPosition: { lat: 10.7630, lng: 106.6822 }, // Nikko Saigon
    destinationPosition: { lat: 10.8142, lng: 106.6663 }, // TSN Airport
    driverAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji&backgroundColor=d1d5db"
  }
};

const TripDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const baseTrip = ALL_MOCK_TRIPS.find(t => t.id === id) || ALL_MOCK_TRIPS[0];
  const tripDetail = mockTripDetails[id || "trip-1"] || mockTripDetails["trip-1"];

  if (!tripDetail || !baseTrip) {
    return <div className="p-4 text-center">Chuyến đi không tồn tại</div>;
  }

  const handleMessageDriver = () => {
    navigate('/passenger/chat', {
      state: {
        rideId: id,
        driver: {
          name: tripDetail.driverNameKana,
          avatar: tripDetail.driverAvatar
        }
      }
    });
  };

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
            pickupPosition={tripDetail.pickupPosition}
            destinationPosition={tripDetail.destinationPosition}
          />

          {/* 2. Driver Info */}
          <DriverInfoCard 
            driverName={baseTrip.driverName}
            driverAvatar={tripDetail.driverAvatar}
            carModel={tripDetail.carModel}
            driverNameKana={tripDetail.driverNameKana}
            onMessageClick={handleMessageDriver}
          />

          {/* 3. Route Timeline */}
          <RouteTimelineCard 
            startLocationName={baseTrip.startLocationName}
            startLocationAddress={baseTrip.startLocationAddress}
            endLocationName={baseTrip.endLocationName}
            endLocationAddress={baseTrip.endLocationAddress}
            startTime={baseTrip.time}
            endTime={tripDetail.endTime}
          />

          {/* 4. Trip Stats */}
          <TripStatsCard 
            duration={tripDetail.duration}
            distance={tripDetail.distance}
            paymentMethod={tripDetail.paymentMethod}
          />

          {/* 5. Receipt */}
          <ReceiptCard 
            distanceFee={tripDetail.distanceFee}
            bookingFee={tripDetail.bookingFee}
            total={tripDetail.total}
            distanceLabel={`距離料金 (${tripDetail.distance})`}
          />

          {/* 6. Review Section (Heading + Card) */}
          <div className="flex flex-col gap-[16px]">
            <div className="w-full flex justify-between items-center">
            <div className="flex flex-col justify-start items-start pr-[15px]">
              <div className="h-[56px] flex flex-col justify-center text-[#171D17] text-[20px] font-['Plus_Jakarta_Sans',sans-serif] font-[800] leading-[28px] break-words">
                あなたのレビュー
              </div>
            </div>
            <div className="h-[36px] px-[12px] py-[4px] bg-[#E9F0E6] rounded-full flex justify-center items-center">
              <div className="flex flex-col justify-center text-center text-[#3D4A3F] text-[12px] font-['Plus_Jakarta_Sans',sans-serif] font-[500] leading-[16px] break-words">
                {tripDetail.reviewDate}
              </div>
            </div>
          </div>
            <ReviewCard 
              rating={tripDetail.rating}
              comment={tripDetail.comment}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
