import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
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
import { getRouteWithDuration } from '../../hooks/useLocationSuggestions';
import { SmartMapRoute } from '../../components/features/SmartMapRoute';

// Outline Icons we designed
import IconCall from '../../assets/IconCall.svg';
import IconMess from '../../assets/IconMess.svg';
import IconClock from '../../assets/IconClock.svg';
import IconCar from '../../assets/IconCar.svg';
import IconLocation from '../../assets/IconLocation.svg';

type TripPhase = 'picking_up' | 'in_trip';

const DriverInTrip: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { position, error } = useGeolocation();
  const [tripPhase, setTripPhaseState] = useState<TripPhase>(
    () => (sessionStorage.getItem('active_trip_phase') as TripPhase) || 'picking_up'
  );
  const setTripPhase = (phase: TripPhase) => {
    sessionStorage.setItem('active_trip_phase', phase);
    setTripPhaseState(phase);
  };
  const [isCompleting, setIsCompleting] = useState(false);
  const [recenterKey, setRecenterKey] = useState(0);

  // Accumulate actual GPS route taken by driver
  const [gpsRouteHistory, setGpsRouteHistory] = useState<[number, number][]>(() => {
    try {
      const stored = sessionStorage.getItem('active_gps_route_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Retrieve active ride data from state or sessionStorage
  const rideId = location.state?.rideId || sessionStorage.getItem('active_ride_id') || '';
  const passengerName = location.state?.passengerName || sessionStorage.getItem('active_passenger_name') || '';
  const passengerAvatar = location.state?.passengerAvatar || sessionStorage.getItem('active_passenger_avatar') || '';
  const passengerId = location.state?.passengerId || sessionStorage.getItem('active_passenger_id') || '';
  
  const pickupLocation = location.state?.pickupLocation || sessionStorage.getItem('active_pickup_location') || '';
  const destinationLocation = location.state?.destinationLocation || sessionStorage.getItem('active_destination_location') || '';
  const distanceToPickup = location.state?.distanceToPickup || sessionStorage.getItem('active_distance_to_pickup') || '';
  const duration = location.state?.duration || sessionStorage.getItem('active_duration') || '';
  const fare = location.state?.estimatedFare || sessionStorage.getItem('active_fare') || '';

  useEffect(() => {
    if (!rideId) {
      navigate('/driver');
    }
  }, [rideId, navigate]);

  // Marker Leaflet Icons
  const carIcon = L.divIcon({
    className: 'custom-car-marker',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `
      <div class="w-[44px] h-[44px] bg-[#006D37] rounded-[9999px] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.15)] border-[4px] border-white box-border">
        <img src="${IconCar}" alt="Current Location" class="w-[20px] h-[20px] object-contain" />
      </div>
    `
  });

  const createDestinationIcon = (destName: string) => L.divIcon({
    className: 'custom-dest-marker',
    iconSize: [140, 100],
    iconAnchor: [70, 24],
    html: `
      <div class="flex flex-col items-center">
        <div class="w-[44px] h-[49px] bg-[#865300] rounded-[9999px] flex items-center justify-center mb-1.5 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.10),0_4px_6px_-4px_rgba(0,0,0,0.10)] border-[4px] border-white box-border">
          <img src="${IconLocation}" alt="Destination" class="w-[20px] h-[25px] object-contain" />
        </div>
        <div class="bg-white border-[1.5px] border-[#865300] rounded-[10px] py-1 px-3.5 text-center shadow-md whitespace-nowrap">
          <div class="text-[10px] font-extrabold text-[#865300] leading-tight mb-0.5">目的地</div>
          <div class="text-[13px] font-extrabold text-[#1a1a1a] leading-tight">${destName}</div>
        </div>
      </div>
    `
  });

  // State calculations for live ETA and distance
  const [rideDetails, setRideDetails] = useState<any>(null);
  const [actualDistance, setActualDistance] = useState<string>('...');
  const [actualDuration, setActualDuration] = useState<string>('...');
  const [distanceNumber, setDistanceNumber] = useState<number | null>(null);
  const [distanceUnit, setDistanceUnit] = useState<string>('km');

  // Fetch actual ride details
  useEffect(() => {
    const fetchRideDetails = async () => {
      if (rideId === 'mock-ride-id') return;
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/rides/${rideId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const res = await response.json();
        if (res.success && res.data) {
          setRideDetails(res.data);
        }
      } catch (err) {
        console.error('Error fetching ride details:', err);
      }
    };
    fetchRideDetails();
  }, [rideId]);

  // Helper to calculate distance in km
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
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

  // Toạ độ điểm đón và trả khách lấy từ db, state hoặc session storage
  const pickupPosition = (() => {
    if (rideDetails?.startLat && rideDetails?.startLng) {
      return { lat: Number(rideDetails.startLat), lng: Number(rideDetails.startLng) };
    }
    const stateLat = location.state?.startLat;
    const stateLng = location.state?.startLng;
    if (stateLat && stateLng) {
      return { lat: Number(stateLat), lng: Number(stateLng) };
    }
    const sessLat = sessionStorage.getItem('active_start_lat');
    const sessLng = sessionStorage.getItem('active_start_lng');
    if (sessLat && sessLng && sessLat !== 'undefined' && sessLng !== 'undefined') {
      return { lat: Number(sessLat), lng: Number(sessLng) };
    }
    return position ? { lat: position.lat, lng: position.lng } : { lat: 21.0285, lng: 105.8542 }; // fallback điểm đón
  })();

  const destinationPosition = (() => {
    if (rideDetails?.endLat && rideDetails?.endLng) {
      return { lat: Number(rideDetails.endLat), lng: Number(rideDetails.endLng) };
    }
    const stateLat = location.state?.endLat;
    const stateLng = location.state?.endLng;
    if (stateLat && stateLng) {
      return { lat: Number(stateLat), lng: Number(stateLng) };
    }
    const sessLat = sessionStorage.getItem('active_end_lat');
    const sessLng = sessionStorage.getItem('active_end_lng');
    if (sessLat && sessLng && sessLat !== 'undefined' && sessLng !== 'undefined') {
      return { lat: Number(sessLat), lng: Number(sessLng) };
    }
    return position ? { lat: position.lat, lng: position.lng } : { lat: 21.0125, lng: 105.8425 }; // fallback điểm trả
  })();

  // Vị trí tài xế giả lập/thực tế thông minh:
  // Nếu có GPS thực tế và GPS này nằm trong bán kính 4km so với điểm đón, ta dùng GPS thực tế.
  // Ngược lại (hoặc không định vị được), ta tự động giả lập tài xế ở gần điểm đón (lệch một khoảng nhỏ)
  // để đảm bảo vẽ tuyến đường đón khách đẹp mắt và OSRM tính toán ra kết quả chuẩn xác.
  const getDriverGeoPos = () => {
    if (position?.lat && position?.lng) {
      const dist = getDistanceKm(position.lat, position.lng, pickupPosition.lat, pickupPosition.lng);
      if (dist < 4) {
        return { lat: position.lat, lng: position.lng };
      }
    }
    return { lat: pickupPosition.lat + 0.006, lng: pickupPosition.lng - 0.004 };
  };

  const driverGeoPos = getDriverGeoPos();

  // Route metrics calculation based on position (with fallbacks if geolocation is disabled)
  useEffect(() => {
    const calculateRouteMetrics = async () => {
      let startLat = 0;
      let startLng = 0;
      let targetLat = 0;
      let targetLng = 0;

      if (tripPhase === 'picking_up') {
        // Phase 1: từ vị trí tài xế đến vị trí điểm đón
        startLat = driverGeoPos.lat;
        startLng = driverGeoPos.lng;
        targetLat = pickupPosition.lat;
        targetLng = pickupPosition.lng;
      } else if (tripPhase === 'in_trip') {
        // Phase 2: từ điểm đón đến điểm đến để suy ra khoảng cách/thời gian di chuyển bằng ô tô
        startLat = pickupPosition.lat;
        startLng = pickupPosition.lng;
        targetLat = destinationPosition.lat;
        targetLng = destinationPosition.lng;
      } else {
        setActualDistance('0 m');
        setActualDuration('待ち中');
        setDistanceNumber(0);
        setDistanceUnit('m');
        return;
      }

      try {
        const { distance, duration } = await getRouteWithDuration(
          { lat: startLat, lng: startLng },
          { lat: targetLat, lng: targetLng }
        );

        if (distance !== Infinity && duration !== Infinity && !isNaN(distance) && !isNaN(duration)) {
          if (distance < 1000) {
            setActualDistance(`${Math.round(distance)} m`);
            setDistanceNumber(Math.round(distance));
            setDistanceUnit('m');
          } else {
            const km = (distance / 1000).toFixed(1);
            setActualDistance(`${km} km`);
            setDistanceNumber(Number(km));
            setDistanceUnit('km');
          }
          const mins = Math.max(1, Math.ceil(duration / 60));
          setActualDuration(`${mins}分`);
        } else {
          throw new Error('Invalid OSRM result');
        }
      } catch (err) {
        console.warn('Using offline route fallbacks:', err);
        setActualDistance('...');
        setDistanceNumber(null);
        setDistanceUnit('');
        setActualDuration('...');
      }
    };

    calculateRouteMetrics();
  }, [driverGeoPos.lat, driverGeoPos.lng, tripPhase, rideDetails, pickupPosition.lat, pickupPosition.lng, destinationPosition.lat, destinationPosition.lng]);

  const displayPickup = rideDetails?.startAddress || pickupLocation;
  const displayDest = rideDetails?.endAddress || destinationLocation;

  // Recenter map automatically when position updates
  useEffect(() => {
    if (position) {
      setRecenterKey(prev => prev + 1);
    }
  }, [position]);

  // Track GPS history when in trip
  useEffect(() => {
    if (position?.lat && position?.lng && tripPhase === 'in_trip') {
      setGpsRouteHistory(prev => {
        const lastPos = prev[prev.length - 1];
        if (!lastPos || lastPos[0] !== position.lat || lastPos[1] !== position.lng) {
          const newRoute = [...prev, [position.lat, position.lng] as [number, number]];
          sessionStorage.setItem('active_gps_route_history', JSON.stringify(newRoute));
          return newRoute;
        }
        return prev;
      });
    }
  }, [position?.lat, position?.lng, tripPhase]);

  const handleChat = () => {
    navigate('/driver/chat', {
      state: {
        rideId,
        passengerId,
        passengerName,
        passengerAvatar
      }
    });
  };

  const handleCall = () => {
    navigate('/driver/call-passenger', {
      state: {
        rideId,
        passengerId,
        passengerName,
        passengerAvatar
      }
    });
  };

  // State transitions
  const handleArrived = () => {
    // Chuyển thẳng sang phase 'in_trip' để di chuyển đến điểm trả khách
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
        text: 'ドライバーが到着しました'
      });
      console.log("📡 [DriverInTrip] Emitted ドライバーが到着しました socket message to passenger!");
    }
  };

  const handleCompleteTrip = async () => {
    setIsCompleting(true);
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/rides/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          rideId, 
          actualPath: JSON.stringify(gpsRouteHistory) 
        })
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
        sessionStorage.removeItem('active_trip_phase');
        sessionStorage.removeItem('active_gps_route_history');
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
              : '乗車中'
          }
          hideBrandName={true}
          hideLanguageToggle={true}
        />

        {/* Map Background */}
        <div className="flex-1 w-full relative z-0">
          <MapView
            position={null}
            pickupPosition={pickupPosition}
            destinationPosition={destinationPosition}
            zoom={15}
            recenterKey={recenterKey}
            hasBottomNav={false}
            hideRoute={true}
            extraPositions={[driverGeoPos]}
          >
            {/* Nếu đang đón khách, vẽ đường từ xe đến điểm đón. Nếu đang chở khách, vẽ đường từ điểm đón đến điểm trả */}
            {tripPhase === 'picking_up' && (
              <SmartMapRoute driverPosition={driverGeoPos} destination={pickupPosition} color="url(#routeGradient)" />
            )}
            {tripPhase === 'in_trip' && (
              <SmartMapRoute driverPosition={pickupPosition} destination={destinationPosition} color="url(#routeGradient)" />
            )}

            {/* Marker vị trí hiện tại (xe) */}
            <Marker position={[driverGeoPos.lat, driverGeoPos.lng]} icon={carIcon} />

            {/* Marker đích đến (hoặc điểm đón tùy phase) */}
            {tripPhase === 'picking_up' && (
              <Marker position={[pickupPosition.lat, pickupPosition.lng]} icon={createDestinationIcon('乗車位置')} />
            )}
            {tripPhase === 'in_trip' && (
              <Marker position={[destinationPosition.lat, destinationPosition.lng]} icon={createDestinationIcon(displayDest)} />
            )}
          </MapView>

          {/* Floating Navigation Instructions Box (Top overlay) */}
          <div className="absolute top-[80px] left-4 right-4 z-[1000] bg-white rounded-[24px] p-4 flex gap-4 items-center shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
            <div className="w-14 h-14 bg-[#006D37] rounded-[18px] flex items-center justify-center flex-shrink-0 shadow-md">
              <CornerUpRight className="text-white w-6 h-6" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5 w-full">
                <span className="text-[#171D17] text-2xl font-black leading-tight tracking-tight">
                  {distanceNumber !== null ? distanceNumber : '...'}
                </span>
                <span className="text-[#171D17] text-sm font-extrabold">
                  {distanceUnit}
                </span>
                <span className="text-[#006D37] text-xs font-bold pl-2 truncate">
                  {tripPhase === 'picking_up' 
                    ? '次の曲がり角' 
                    : '目的地まで'
                  }
                </span>
              </div>
              <span className="text-[#3D4A3F] text-sm font-medium truncate w-full mt-0.5">
                {tripPhase === 'picking_up' 
                  ? '乗車位置へ向かいます' 
                  : '降車位置へ向かいます'
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
                  {tripPhase === 'in_trip' ? displayDest : displayPickup}
                </span>
              </div>
            </div>

            {/* Time / Distance Indicator */}
            <div className="flex flex-col items-end flex-shrink-0">
              <span className="text-[#171D17] text-lg font-black leading-none">
                {actualDuration}
              </span>
              <span className="text-[#006D37] text-xs font-bold mt-1">
                {actualDistance}
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
