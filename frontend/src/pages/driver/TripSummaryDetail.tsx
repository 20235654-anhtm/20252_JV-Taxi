import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import MapSection from '../../components/TripSummaryDetail/MapSection';
import TotalIncomeCard from '../../components/TripSummaryDetail/TotalIncomeCard';
import PassengerInfo from '../../components/TripSummaryDetail/PassengerInfo';
import BillSection from '../../components/TripSummaryDetail/BillSection';
import ButtonAction from '../../components/TripSummaryDetail/ButtonAction';
import type { TripSummaryDetailType } from '../../types/TripSummaryDetail';
import { API_BASE_URL } from '../../config/api';

const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

const TripSummaryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tripDetail, setTripDetail] = useState<TripSummaryDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Đảm bảo luôn cuộn lên đầu trang khi vừa mở ra
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchTripDetail = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) {
          setError('Unauthorized');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/rides/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch ride details');
        const resData = await response.json();

        if (resData.success && resData.data) {
          const ride = resData.data;

          // Tính khoảng cách và thời gian
          const startLat = Number(ride.startLat || 21.0285);
          const startLng = Number(ride.startLng || 105.8542);
          const endLat = Number(ride.endLat || 21.0125);
          const endLng = Number(ride.endLng || 105.8425);
          
          const distance = getDistanceFromLatLonInKm(startLat, startLng, endLat, endLng) || 1.0;
          const duration = Math.round(distance * 2.5) || 5; // Ước lượng 2.5 phút/km

          // Định dạng thời gian
          const dateObj = new Date(ride.createdAt);
          const pickupTimeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
          
          const dropoffDateObj = new Date(dateObj.getTime() + duration * 60000);
          const dropoffTimeStr = `${String(dropoffDateObj.getHours()).padStart(2, '0')}:${String(dropoffDateObj.getMinutes()).padStart(2, '0')}`;

          // Tính toán tiền
          const total = ride.payment?.totalAmount ? Number(ride.payment.totalAmount) : (ride.matchFee ? Number(ride.matchFee) : 0);
          const bookingFee = total > 15000 ? 15000 : 0;
          const distanceFee = total - bookingFee;

          // Rating
          const driverReview = ride.reviews?.find((r: any) => r.driverId === ride.driverId);
          const rating = driverReview?.starReview || 0.0;
          const communicationStar = driverReview?.communicationStar;
          const attitudeStar = driverReview?.attitudeStar;
          const safetyStar = driverReview?.safetyStar;

          // Status mapping
          const statusMap: Record<string, string> = {
            COMPLETED: '完了',
            CANCELLED: 'キャンセル',
            PENDING: '保留中',
            ACCEPTED: '受付済',
            REJECTED: '拒否'
          };

          const getLocDetails = (addr: string) => {
            if (!addr) return '...';
            const parts = addr.split(',');
            return parts[0].trim();
          };

          const mappedDetail: TripSummaryDetailType = {
            id: ride.id,
            distance,
            duration,
            status: statusMap[ride.status] || ride.status,
            totalIncome: total,
            tip: 0,
            rating,
            communicationStar,
            attitudeStar,
            safetyStar,
            passenger: {
              id: ride.passenger?.id || '',
              name: ride.passenger?.fullName || 'Passenger',
              avatarUrl: ride.passenger?.avatar || 'https://avatar.iran.liara.run/public/girl'
            },
            timeline: {
              pickup: { time: pickupTimeStr, location: getLocDetails(ride.startAddress) },
              dropoff: { time: dropoffTimeStr, location: getLocDetails(ride.endAddress) }
            },
            bill: {
              distanceFee,
              bookingFee,
              total
            },
            pickupPosition: { lat: startLat, lng: startLng },
            destinationPosition: { lat: endLat, lng: endLng }
          };

          setTripDetail(mappedDetail);
        } else {
          setError('Ride detail not found');
        }
      } catch (err: any) {
        console.error('Error fetching ride detail:', err);
        setError(err.message || 'Error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTripDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#F4FBF1] min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006D37]"></div>
      </div>
    );
  }

  if (error || !tripDetail) {
    return (
      <div className="bg-[#F4FBF1] min-h-screen flex flex-col justify-center items-center p-4">
        <p className="text-[#3D4A3F] font-bold text-lg mb-4">{error || 'お探しの乗車履歴が見つかりませんでした。'}</p>
        <button 
          onClick={() => navigate('/driver/history')} 
          className="px-6 py-2 bg-[#006D37] text-white rounded-full font-bold"
        >
          戻る
        </button>
      </div>
    );
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
          pickupPosition={tripDetail.pickupPosition}
          destinationPosition={tripDetail.destinationPosition}
        />

        <TotalIncomeCard 
          totalIncome={tripDetail.totalIncome}
          tip={tripDetail.tip}
          rating={tripDetail.rating}
          communicationStar={tripDetail.communicationStar}
          attitudeStar={tripDetail.attitudeStar}
          safetyStar={tripDetail.safetyStar}
        />

        <PassengerInfo 
          passenger={tripDetail.passenger}
          timeline={tripDetail.timeline}
          onClickMessage={() => {
            navigate('/driver/chat', {
              state: {
                rideId: tripDetail.id,
                passengerId: tripDetail.passenger.id,
                passengerName: tripDetail.passenger.name,
                passengerAvatar: tripDetail.passenger.avatarUrl,
                fromHistory: true
              }
            });
          }}
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
