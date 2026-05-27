import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { Header } from '../../components/layout/Header';
import { BottomSheet } from '../../components/layout/BottomSheet';
import { MapView } from '../../components/features/MapView';
import { Avatar } from '../../components/ui/Avatar';
import { FAB } from '../../components/ui/FAB';
import { useBooking } from '../../contexts/BookingContext';

// SVG Icons from assets
import IconCall from '../../assets/IconCall.svg';
import IconMess from '../../assets/IconMess.svg';
import IconCard from '../../assets/IconCard.svg';
import IconLocation from '../../assets/IconLocation.svg';
import IconCar from '../../assets/IconCar.svg';
import { socketService } from '../../services/socketService';
import { getRouteWithDuration } from '../../hooks/useLocationSuggestions';
import { distanceBetween } from '../../utils/routeUtils';
import { showToast } from '../../components/ui/Toast';
import { API_BASE_URL } from '../../config/api';
import { SmartMapRoute } from '../../components/features/SmartMapRoute';

const createDestinationIcon = (destName: string) => L.divIcon({
  className: 'custom-dest-marker',
  iconSize: [140, 100],
  iconAnchor: [70, 24], // Center of the 49px tall marker circle
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

const carIcon = L.divIcon({
  className: 'custom-car-marker',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  html: `
    <div class="w-[44px] h-[44px] bg-[#006D37] rounded-[9999px] flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.15)] border-[4px] border-white box-border">
      <img src="${IconCar}" alt="Driver" class="w-[20px] h-[20px] object-contain" />
    </div>
  `
});

export default function WatingDriverPickup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [recenterKey, setRecenterKey] = useState(0);
  const { pickup: pickupData, destination: destData } = useBooking();

  const driver = location.state?.driver || {
    name: '...',
    avatar: '',
    rating: '...',
    car: '...',
    licensePlate: '...'
  };

  const getCarModel = (car: any) => {
    if (!car) return '...';
    if (typeof car === 'string') {
      try {
        const parsed = JSON.parse(car);
        return parsed.model || car;
      } catch (e) {
        return car;
      }
    }
    return car.model || '...';
  };

  const getCarPlate = (car: any, licensePlate: any) => {
    if (licensePlate && licensePlate !== '...') return licensePlate;
    if (!car) return '...';
    if (typeof car === 'string') {
      try {
        const parsed = JSON.parse(car);
        return parsed.plate || licensePlate || '...';
      } catch (e) {
        return licensePlate || '...';
      }
    }
    return car.plate || licensePlate || '...';
  };

  // Redirect if no location is selected
  if (!pickupData?.coords || !destData?.coords) {
    return <Navigate to="/passenger/search-location" replace />;
  }

  const pickupPosition = { lat: pickupData.coords.lat, lng: pickupData.coords.lng };
  const destinationPosition = { lat: destData.coords.lat, lng: destData.coords.lng };
  const destName = destData.address || '目的地';
  const pickupLocationName = pickupData.address || '乗車場所';

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

  const updateDriverPosWithFilter = (lat: number, lng: number) => {
    const dist = getDistanceKm(lat, lng, pickupPosition.lat, pickupPosition.lng);
    if (dist < 4) {
      setDriverPosition({ lat, lng });
    } else {
      // Nếu GPS ở quá xa (ví dụ Hoàng Đạo Thúy), mock tài xế ở gần điểm đón để vẽ tuyến đường đón khách đẹp mắt
      setDriverPosition({ lat: pickupPosition.lat + 0.006, lng: pickupPosition.lng - 0.004 });
    }
  };

  const fallbackDriverPos = { lat: pickupPosition.lat + 0.006, lng: pickupPosition.lng - 0.004 };

  const formatFare = (val: any) => {
    if (!val) return '...';
    if (typeof val === 'number') return `${val.toLocaleString()} VND`;
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num)) return `${num.toLocaleString()} VND`;
    return val;
  };

  // Vị trí tài xế khởi tạo bằng toạ độ mock để bản đồ vẽ đường ngay lập tức, cập nhật khi fetch thành công hoặc qua socket
  const [driverPosition, setDriverPosition] = useState<{ lat: number; lng: number }>(fallbackDriverPos);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const lastFetchedPos = useRef<{ lat: number; lng: number } | null>(null);
  const [rideDetails, setRideDetails] = useState<any>(null);
  const [fareDisplay, setFareDisplay] = useState<string>(
    formatFare(location.state?.fare || sessionStorage.getItem('active_fare'))
  );

  // Fetch ride details to get actual fare and driver coordinates
  useEffect(() => {
    const fetchRideDetails = async () => {
      const rideId = location.state?.rideId || sessionStorage.getItem('active_ride_id');
      if (!rideId) return;
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
          if (res.data.matchFee) {
            setFareDisplay(formatFare(res.data.matchFee));
          }
          if (res.data.driver?.driverProfile?.lat && res.data.driver?.driverProfile?.lng) {
            updateDriverPosWithFilter(
              Number(res.data.driver.driverProfile.lat),
              Number(res.data.driver.driverProfile.lng)
            );
          }
        }
      } catch (err) {
        console.error('Error fetching ride details:', err);
      }
    };
    fetchRideDetails();
  }, [location.state?.rideId]);

  useEffect(() => {
    const fetchEta = async () => {
      if (!driverPosition || !pickupPosition) return;
      
      // Chỉ gọi lại API nếu di chuyển hơn 50m để tránh spam API
      if (lastFetchedPos.current) {
        const dist = distanceBetween(driverPosition, lastFetchedPos.current);
        if (dist < 50) return;
      }
      
      try {
        const { duration } = await getRouteWithDuration(driverPosition, pickupPosition);
        if (duration !== Infinity) {
          setEtaMinutes(Math.max(1, Math.ceil(duration / 60)));
          lastFetchedPos.current = driverPosition;
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchEta();
  }, [driverPosition, pickupPosition]);

  useEffect(() => {
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    const rideId = location.state?.rideId || sessionStorage.getItem('active_ride_id');
    
    if (userStr && rideId) {
      const user = JSON.parse(userStr);
      socketService.connect(user.id);
      socketService.joinChat(rideId);
    }
  }, [location.state?.rideId]);

  useEffect(() => {
    socketService.onReceiveMessage((msg) => {
      console.log("📡 [WaitingDriverPickup] Received socket message:", msg);
      if (msg.text === 'ドライバーが到着しました') {
        console.log("🚀 Driver has arrived! Automatically navigating to InTrip...");
        showToast('ドライバーが到着しました！', 'success');
        sessionStorage.setItem('driver_arrived', 'true');
        navigate('/passenger/in-trip', { state: { driver } });
      }
    });
    return () => {
      socketService.offReceiveMessage();
    };
  }, [navigate, driver]);

  useEffect(() => {
    socketService.onDriverLocation((data) => {
      updateDriverPosWithFilter(data.lat, data.lng);
    });
    return () => {
      socketService.offDriverLocation();
    };
  }, [pickupPosition]);

  const handleChat = () => {
    const rideId = location.state?.rideId || sessionStorage.getItem('active_ride_id');
    navigate('/passenger/chat', { state: { target: driver, rideId } });
  };
  
  const handleCall = () => {
    const rideId = location.state?.rideId || sessionStorage.getItem('active_ride_id');
    navigate('/passenger/call-driver', { state: { target: driver, rideId } });
  };

  const handleRecenter = () => setRecenterKey(prev => prev + 1);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#f5f5f5]">
      <Header
        title="ライブ追跡"
        showBackButton
        onBackClick={() => navigate('/passenger')}
        hideLanguageToggle
      />

      <div className="absolute inset-0 z-0">
        <MapView
          position={null}
          pickupPosition={pickupPosition}
          destinationPosition={destinationPosition}
          recenterKey={recenterKey}
          showPickupLabel={false}
          hideDestinationMarker={true}
          hideRoute={true}
          routePadding={[[50, 120], [50, 380]]}
          viewPadding={{ top: 100, bottom: 400, left: 50, right: 50 }}
          extraPositions={[driverPosition]}
        >
          {/* Đường vẽ từ vị trí hiện tại của driver -> điểm đón */}
          <SmartMapRoute driverPosition={driverPosition} destination={pickupPosition} color="url(#routeGradient)" />

          {/* Marker vị trí tài xế (xe) */}
          <Marker position={[driverPosition.lat, driverPosition.lng]} icon={carIcon} />
          {/* Marker điểm đón */}
          <Marker position={[pickupPosition.lat, pickupPosition.lng]} icon={createDestinationIcon(pickupLocationName)} />
        </MapView>
      </div>

      <FAB onClick={handleRecenter} className="fixed top-[96px] right-4" />

      <BottomSheet 
        isOpen={true} 
        onClose={() => {}} 
        showHandle 
        snapPoints={[185, 345]} 
        initialSnapIndex={1}
        hasBackdrop={false}
        contentClassName="px-4 sm:px-6"
      >
        <div className="flex flex-col gap-6 pt-2 px-1.5 pb-4">
          {/* Driver Info */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-[12px] sm:gap-[20px] flex-1 min-w-0 pr-2">
              <div className="relative inline-flex flex-col items-start justify-start flex-shrink-0">
                <img 
                  src={driver.avatar} 
                  alt={driver.name} 
                  className="w-[80px] h-[80px] object-cover shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10),0px_4px_6px_-1px_rgba(0,0,0,0.10)] rounded-[28px]" 
                />
                <div className="absolute left-[40px] top-[65px] px-2 py-[2px] bg-[#FEA520] rounded-lg border-2 border-white flex flex-col justify-start items-start">
                  <div className="text-[#2B1700] text-[10px] font-bold leading-[15px] whitespace-nowrap">
                    {driver.rating && driver.rating !== '...' && !isNaN(Number(driver.rating)) ? Number(driver.rating).toFixed(1) : driver.rating} ★
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-start justify-start flex-1 min-w-0">
                <div className="text-[#171D17] text-[18px] sm:text-[20px] font-extrabold leading-[28px] w-full truncate">
                  {driver.name}
                </div>
                <div className="text-[#3D4A3F] text-[13px] sm:text-[14px] font-medium leading-[20px] w-full truncate">
                  {getCarModel(driver.car)}
                </div>
                <div className="pt-1 flex flex-col items-start justify-start">
                  <div className="px-2 py-[2px] bg-[#E3EAE0] rounded flex items-center justify-center">
                    <div className="text-[#3D4A3F] text-[10px] sm:text-[11px] font-bold uppercase leading-[16.5px] tracking-[0.55px] whitespace-nowrap">
                      {getCarPlate(driver.car, driver.licensePlate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="inline-flex flex-col items-start justify-start flex-shrink-0 ml-2">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', height: 41 }}>
                <div style={{ color: '#006D37', fontSize: 36, fontWeight: '900', lineHeight: '40px' }}>
                  {etaMinutes !== null && !isNaN(etaMinutes) ? etaMinutes : '...'}
                </div>
                <div style={{ color: '#006D37', fontSize: 24, fontWeight: '800', lineHeight: '28px' }}>
                  分
                </div>
              </div>
              <div className="flex flex-col items-end justify-start w-full">
                <div className="text-right text-[rgba(61,74,63,0.60)] text-[10px] font-bold uppercase leading-[15px] tracking-[1px]">
                  到着予定
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              className="flex-1 py-5 bg-[#EFF6EC] rounded-[24px] flex justify-center items-center gap-3 hover:bg-[#e8edea] transition-colors" 
              onClick={handleChat}
            >
              <div className="w-[40px] h-[40px] bg-[#E9F0E6] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-full flex items-center justify-center flex-shrink-0">
                <img src={IconMess} alt="Chat" className="w-[18px] h-[18px] object-contain" />
              </div>
              <div className="flex flex-col justify-start items-start">
                <div className="text-[#3D4A3F] text-[14px] font-bold leading-[15px] whitespace-nowrap">
                  チャット
                </div>
              </div>
            </button>
            
            <button 
              className="flex-1 py-5 bg-[#EFF6EC] rounded-[24px] flex justify-center items-center gap-3 hover:bg-[#e8edea] transition-colors" 
              onClick={handleCall}
            >
              <div className="w-[40px] h-[40px] bg-[#E9F0E6] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-full flex items-center justify-center flex-shrink-0">
                <img src={IconCall} alt="Call" className="w-[18px] h-[18px] object-contain" />
              </div>
              <div className="flex flex-col justify-start items-start">
                <div className="text-[#3D4A3F] text-[14px] font-bold leading-[15px] whitespace-nowrap">
                  電話をかける
                </div>
              </div>
            </button>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-start gap-[12px]">
            <div className="w-[40px] h-[40px] bg-[#E9F0E6] rounded-[12px] flex items-center justify-center flex-shrink-0">
              <img src={IconCard} alt="Wallet" className="w-[20px] h-[16px] object-contain" />
            </div>
            <div className="flex flex-col items-start justify-start gap-0.5">
              <div className="text-[#171D17] text-[12px] font-bold leading-[12px]">
                ウォレット決済
              </div>
              <div className="text-[#3D4A3F] text-[10px] font-medium leading-[15px]">
                {fareDisplay}
              </div>
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
