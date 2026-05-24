import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Phone, 
  CheckCircle, 
  CornerUpRight, 
  Flag, 
  MapPin, 
  Navigation, 
  Plus, 
  Minus, 
  Compass,
  Play
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/features/MapView';
import { useGeolocation } from '../../hooks/useGeolocation';
import { showToast } from '../../components/ui/Toast';
import { API_BASE_URL } from '../../config/api';
import { socketService } from '../../services/socketService';

// Outline Icons we designed
import IconCall from '../../assets/IconCall.svg';
import IconMess from '../../assets/IconMess.svg';
import IconClock from '../../assets/IconClock.svg';

type TripPhase = 'picking_up' | 'arrived' | 'in_trip';

const DriverInTrip: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { position, error } = useGeolocation();
  const [tripPhase, setTripPhase] = useState<TripPhase>('picking_up');
  const [isCompleting, setIsCompleting] = useState(false);
  const [recenterKey, setRecenterKey] = useState(0);

  // Retrieve active ride data from state or sessionStorage with mock fallbacks matching the mockup
  const rideId = location.state?.rideId || sessionStorage.getItem('active_ride_id') || 'mock-ride-id';
  const passengerName = location.state?.passengerName || sessionStorage.getItem('active_passenger_name') || '田中 亜希子';
  const passengerAvatar = location.state?.passengerAvatar || sessionStorage.getItem('active_passenger_avatar') || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop';
  
  const pickupLocation = location.state?.pickupLocation || sessionStorage.getItem('active_pickup_location') || '高島屋サイゴン（1区）';
  const destinationLocation = location.state?.destinationLocation || sessionStorage.getItem('active_destination_location') || 'タンソンニャット空港第2ターミナル';
  const distanceToPickup = location.state?.distanceToPickup || sessionStorage.getItem('active_distance_to_pickup') || '1.2 km';
  const duration = location.state?.duration || sessionStorage.getItem('active_duration') || '3分';
  const fare = location.state?.estimatedFare || sessionStorage.getItem('active_fare') || '145k VND';

  // Recenter map automatically when position updates
  useEffect(() => {
    if (position) {
      setRecenterKey(prev => prev + 1);
    }
  }, [position]);

  const handleChat = () => {
    navigate('/driver/chat', {
      state: {
        rideId,
        passengerName,
        passengerAvatar
      }
    });
  };

  const handleCall = () => {
    navigate('/driver/call-passenger', {
      state: {
        rideId,
        passengerName,
        passengerAvatar
      }
    });
  };

  // State transitions
  const handleArrived = () => {
    // Transition locally
    setTripPhase('in_trip');
    showToast('目的地へ向けて乗車を開始しました。', 'success');

    // Emit socket event to automatically redirect the passenger!
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (userStr && rideId) {
      const user = JSON.parse(userStr);
      socketService.joinChat(rideId);
      socketService.sendMessage({
        rideId,
        senderId: user.id,
        text: 'DRIVER_ARRIVED'
      });
      console.log("📡 [DriverInTrip] Emitted DRIVER_ARRIVED socket message to passenger!");
    }
  };

  const handleStartTrip = () => {
    setTripPhase('in_trip');
    showToast('目的地へ向けて乗車を開始しました。', 'success');
  };

  const handleCompleteTrip = async () => {
    if (rideId === 'mock-ride-id') {
      showToast('乗車が正常に完了しました！ (DEMO)', 'success');
      sessionStorage.clear();
      navigate('/driver');
      return;
    }

    setIsCompleting(true);
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/rides/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rideId })
      });
      const data = await response.json();
      if (data.success) {
        showToast('乗車が正常に完了しました！', 'success');
        sessionStorage.removeItem('active_ride_id');
        sessionStorage.removeItem('active_passenger_name');
        sessionStorage.removeItem('active_passenger_avatar');
        sessionStorage.removeItem('active_pickup_location');
        sessionStorage.removeItem('active_destination_location');
        sessionStorage.removeItem('active_distance_to_pickup');
        sessionStorage.removeItem('active_duration');
        sessionStorage.removeItem('active_fare');
        sessionStorage.removeItem('active_payment_method');
        navigate('/driver');
      } else {
        showToast(data.message || '乗車完了処理中にエラーが発生しました。', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('システムエラーが発生しました。', 'error');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F4FBF1] flex flex-col items-center">
      <div className="w-full max-w-[390px] h-full flex flex-col relative bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <Header
          variant="driver"
          showBackButton={true}
          onBackClick={() => navigate('/driver')}
          title={
            tripPhase === 'picking_up' 
              ? 'お迎え中' 
              : tripPhase === 'arrived' 
              ? '到着完了' 
              : '乗車中'
          }
          hideBrandName={true}
          hideLanguageToggle={true}
        />

        {/* Map Background */}
        <div className="flex-1 w-full relative z-0">
          <MapView
            position={position}
            zoom={15}
            recenterKey={recenterKey}
            hasBottomNav={false}
          />

          {/* Floating Navigation Instructions Box (Top overlay) */}
          <div className="absolute top-[80px] left-4 right-4 z-[1000] bg-white rounded-[24px] p-4 flex gap-4 items-center shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
            <div className="w-14 h-14 bg-[#006D37] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-md">
              <CornerUpRight className="text-white w-6 h-6" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5 w-full">
                <span className="text-[#171D17] text-2xl font-black leading-tight tracking-tight">
                  {tripPhase === 'picking_up' 
                    ? '400' 
                    : tripPhase === 'arrived' 
                    ? '0' 
                    : '5.4'
                  }
                </span>
                <span className="text-[#171D17] text-sm font-extrabold">
                  {tripPhase === 'in_trip' ? 'km' : 'm'}
                </span>
                <span className="text-[#006D37] text-xs font-bold pl-2 truncate">
                  {tripPhase === 'picking_up' 
                    ? '次の曲がり角' 
                    : tripPhase === 'arrived' 
                    ? '乗車位置に到着' 
                    : '目的地まで'
                  }
                </span>
              </div>
              <span className="text-[#3D4A3F] text-sm font-medium truncate w-full mt-0.5">
                {tripPhase === 'picking_up' 
                  ? '明治通りを右折' 
                  : tripPhase === 'arrived' 
                  ? '乗客の乗車をお待ちください' 
                  : 'タンソンニャット空港へ向かいます'
                }
              </span>
            </div>
          </div>

          {/* Map Controls (Floating Right) */}
          <div className="absolute right-4 top-[184px] z-[1000] flex flex-col gap-3">
            <button 
              onClick={() => setRecenterKey(prev => prev + 1)}
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:bg-[#F4FBF1] transition-colors"
              aria-label="Recenter"
            >
              <Compass className="text-[#3D4A3F] w-5 h-5" />
            </button>
            <button 
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:bg-[#F4FBF1] transition-colors"
              aria-label="Zoom In"
            >
              <Plus className="text-[#3D4A3F] w-5 h-5" strokeWidth={2.5} />
            </button>
            <button 
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:bg-[#F4FBF1] transition-colors"
              aria-label="Zoom Out"
            >
              <Minus className="text-[#3D4A3F] w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Bottom Sheet / Panel */}
        <div className="relative w-full bg-white rounded-t-[32px] shadow-[0_-12px_40px_rgba(0,0,0,0.08)] p-6 z-[1001] flex flex-col gap-6">
          {/* Drag Handle */}
          <div className="w-10 h-1 bg-[#E5E9E5] rounded-full mx-auto" />

          {/* Sibling Layout: Passenger Info Card (Left) & Actions Stack (Right) */}
          <div className="w-full flex gap-4 items-stretch">
            {/* Left Block: Passenger Info Card */}
            <div className="flex-1 bg-[#EFF6EC] rounded-[24px] p-4 flex gap-4 items-center min-w-0">
              <img 
                className="w-14 h-14 rounded-2xl object-cover shadow-sm flex-shrink-0" 
                src={passengerAvatar} 
                alt={passengerName} 
              />
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-[#3D4A3F]/70 text-xs font-semibold uppercase tracking-wider mb-0.5">
                  現在の乗客
                </span>
                <span className="text-[#171D17] text-xl font-black leading-tight truncate w-full">
                  {passengerName}
                </span>
              </div>
            </div>

            {/* Right Block: Capsule Vertically Stacked Call & Chat buttons */}
            <div className="flex flex-col gap-2.5 justify-between">
              <button 
                onClick={handleChat}
                className="w-14 h-11 bg-[#EFF6EC] rounded-full flex justify-center items-center hover:bg-[#e4ede1] transition-colors flex-shrink-0"
              >
                <img src={IconMess} alt="Chat" className="w-[18px] h-[18px] object-contain" />
              </button>
              <button 
                onClick={handleCall}
                className="w-14 h-11 bg-[#EFF6EC] rounded-full flex justify-center items-center hover:bg-[#e4ede1] transition-colors flex-shrink-0"
              >
                <img src={IconCall} alt="Call" className="w-[18px] h-[18px] object-contain" />
              </button>
            </div>
          </div>

          {/* Ride Details / Pickup location */}
          <div className="w-full flex items-center justify-between gap-4 mt-1 border-t border-[#F0F4F0] pt-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="pt-1 flex-shrink-0">
                {tripPhase === 'in_trip' ? (
                  <MapPin className="text-[#865300] w-5 h-5" strokeWidth={2.5} />
                ) : (
                  <Flag className="text-[#006D37] w-5 h-5" strokeWidth={2.5} />
                )}
              </div>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-[#3D4A3F]/50 text-[10px] uppercase font-bold tracking-wider mb-0.5">
                  {tripPhase === 'in_trip' ? '降車位置' : '乗車位置'}
                </span>
                <span className="w-full text-[#171D17] text-[15px] font-black leading-tight truncate">
                  {tripPhase === 'in_trip' ? destinationLocation : pickupLocation}
                </span>
              </div>
            </div>

            {/* Time / Distance Indicator */}
            <div className="flex flex-col items-end flex-shrink-0">
              <span className="text-[#171D17] text-lg font-black leading-none">
                {tripPhase === 'picking_up' 
                  ? duration 
                  : tripPhase === 'arrived' 
                  ? '待ち中' 
                  : '20分'
                }
              </span>
              <span className="text-[#006D37] text-xs font-bold mt-1">
                {tripPhase === 'in_trip' ? '5.4 km' : distanceToPickup}
              </span>
            </div>
          </div>

          {/* Dynamic Action Button */}
          {tripPhase === 'picking_up' && (
            <button 
              onClick={handleArrived}
              className="w-full bg-[#006D37] hover:bg-[#005c2e] text-white py-[1.125rem] rounded-[24px] flex justify-center items-center gap-2 font-black text-lg shadow-[0_8px_24px_rgba(0,109,55,0.22)] transition-all"
            >
              <span>到着しました</span>
              <CheckCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
            </button>
          )}

          {tripPhase === 'arrived' && (
            <button 
              onClick={handleStartTrip}
              className="w-full bg-[#FEA520] hover:bg-[#e0911b] text-[#2B1700] py-[1.125rem] rounded-[24px] flex justify-center items-center gap-2 font-black text-lg shadow-[0_8px_24px_rgba(254,165,32,0.22)] transition-all"
            >
              <span>乗車を開始する</span>
              <Play className="w-5 h-5 text-[#2B1700]" fill="currentColor" />
            </button>
          )}

          {tripPhase === 'in_trip' && (
            <button 
              onClick={handleCompleteTrip}
              disabled={isCompleting}
              className="w-full bg-[#006D37] hover:bg-[#005c2e] text-white py-[1.125rem] rounded-[24px] flex justify-center items-center gap-2 font-black text-lg shadow-[0_8px_24px_rgba(0,109,55,0.22)] transition-all disabled:opacity-50"
            >
              <span>{isCompleting ? '処理中...' : '乗車を完了する'}</span>
              <CheckCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default DriverInTrip;
