import React, { useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import MapSection from '../../components/TripSummaryDetail/MapSection';
import TotalIncomeCard from '../../components/TripSummaryDetail/TotalIncomeCard';
import PassengerInfo from '../../components/TripSummaryDetail/PassengerInfo';
import BillSection from '../../components/TripSummaryDetail/BillSection';
import ButtonAction from '../../components/TripSummaryDetail/ButtonAction';
import type { TripSummaryDetailType } from '../../types/TripSummaryDetail';

// MOCK DATA SUPPLEMENTING TripHistory
const mockDetailedTrips: TripSummaryDetailType[] = [
  {
    id: '1',
    distance: 8.4,
    duration: 24,
    status: '完了',
    totalIncome: 142500,
    tip: 15000,
    rating: 5.0,
    passenger: {
      name: 'Elena Rodriguez',
      avatarUrl: 'https://placehold.co/56x56'
    },
    timeline: {
      pickup: { time: '14:20', location: 'サンワ・タワー (1区)' },
      dropoff: { time: '14:44', location: 'タンソンニャット国際空港' }
    },
    bill: {
      distanceFee: 84000,
      bookingFee: 15000,
      total: 127500
    }
  },
  {
    id: '2',
    distance: 5.2,
    duration: 18,
    status: '完了',
    totalIncome: 82000,
    tip: 0,
    rating: 4.8,
    passenger: {
      name: 'Michael Chen',
      avatarUrl: 'https://placehold.co/56x56?text=M'
    },
    timeline: {
      pickup: { time: '11:05', location: 'クレセント・モール (7区)' },
      dropoff: { time: '11:23', location: 'レタントン通り (1区)' }
    },
    bill: {
      distanceFee: 52000,
      bookingFee: 15000,
      total: 82000
    }
  }
];

const TripSummaryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Đảm bảo luôn cuộn lên đầu trang khi vừa mở ra
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Tìm kiếm chi tiết chuyến đi dựa trên id
  const tripDetail = useMemo(() => {
    return mockDetailedTrips.find(t => t.id === id) || mockDetailedTrips[0];
  }, [id]);

  if (!tripDetail) {
    return <div className="min-h-screen bg-[#F4FBF1] p-4">Loading...</div>;
  }

  return (
    <div className="bg-[#F4FBF1] min-h-screen font-['Plus_Jakarta_Sans'] flex flex-col">
      <Header
        variant="driver"
        title="トリップ概要"
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        hideBrandName={true}
      />

      <div className="flex-1 px-4 pt-[20px] pb-[40px] flex flex-col gap-6" style={{marginTop: '70px'}}>
        <MapSection 
          distance={tripDetail.distance}
          duration={tripDetail.duration}
          status={tripDetail.status}
        />

        <TotalIncomeCard 
          totalIncome={tripDetail.totalIncome}
          tip={tripDetail.tip}
          rating={tripDetail.rating}
        />

        <PassengerInfo 
          passenger={tripDetail.passenger}
          timeline={tripDetail.timeline}
        />

        <BillSection 
          distance={tripDetail.distance}
          distanceFee={tripDetail.bill.distanceFee}
          bookingFee={tripDetail.bill.bookingFee}
          total={tripDetail.bill.total}
        />

        <ButtonAction onClick={() => navigate(-1)} />
      </div>
    </div>
  );
};

export default TripSummaryDetail;
