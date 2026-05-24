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
    name: 'Nguyen Van Nam',
    avatar: 'https://i.pravatar.cc/150?img=11',
    rating: '4.9',
    car: 'Toyota Camry',
    licensePlate: '51H-123.45'
  };

  // Redirect if no location is selected
  if (!pickupData?.coords || !destData?.coords) {
    return <Navigate to="/passenger/search-location" replace />;
  }

  const pickupPosition = { lat: pickupData.coords.lat, lng: pickupData.coords.lng };
  const destinationPosition = { lat: destData.coords.lat, lng: destData.coords.lng };
  const destName = destData.address || '目的地';

  // Vị trí tài xế (mock ban đầu gần điểm đón, cập nhật qua socket)
  const [driverPosition, setDriverPosition] = useState({ lat: pickupPosition.lat + 0.008, lng: pickupPosition.lng - 0.005 });
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const lastFetchedPos = useRef<{ lat: number; lng: number } | null>(null);

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
    socketService.onDriverLocation((data) => {
      setDriverPosition({ lat: data.lat, lng: data.lng });
    });
    return () => {
      socketService.offDriverLocation();
    };
  }, []);

  const handleChat = () => navigate('/passenger/chat');
  const handleCall = () => navigate('/passenger/call-driver');
  const handleRecenter = () => setRecenterKey(prev => prev + 1);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#f5f5f5]">
      <Header
        title="ライブ追跡"
        showBackButton
        onBackClick={() => navigate('/passenger')}
        hideLanguageToggle
        rightContent={
          <button 
            onClick={() => {
              alert('Tài xế đã đến!');
              navigate('/passenger/in-trip', { state: { driver } });
            }}
            className="text-[#FEA520] font-bold text-xs bg-[#FEA520]/10 px-3 py-1.5 rounded-full"
          >
            [TEST] Xe đến
          </button>
        }
      />

      <div className="absolute inset-0 z-0">
        <MapView
          position={null}
          pickupPosition={pickupPosition}
          destinationPosition={destinationPosition}
          recenterKey={recenterKey}
          showPickupLabel={false}
          hideDestinationMarker={true}
          routeColor="url(#routeGradient)"
          routePadding={[[50, 120], [50, 380]]}
          viewPadding={{ top: 100, bottom: 400, left: 50, right: 50 }}
          extraPositions={[driverPosition]}
        >
          {/* Marker vị trí tài xế (xe) */}
          <Marker position={[driverPosition.lat, driverPosition.lng]} icon={carIcon} />
          {/* Marker điểm đến */}
          <Marker position={[destinationPosition.lat, destinationPosition.lng]} icon={createDestinationIcon(destName)} />
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
            <div className="flex items-center gap-[20px]">
              <div className="relative inline-flex flex-col items-start justify-start">
                <img 
                  src={driver.avatar} 
                  alt={driver.name} 
                  className="w-[80px] h-[80px] object-cover shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10),0px_4px_6px_-1px_rgba(0,0,0,0.10)] rounded-[28px]" 
                />
                <div className="absolute left-[40px] top-[65px] px-2 py-[2px] bg-[#FEA520] rounded-lg border-2 border-white flex flex-col justify-start items-start">
                  <div className="text-[#2B1700] text-[10px] font-bold leading-[15px] whitespace-nowrap">
                    {driver.rating} ★
                  </div>
                </div>
              </div>
              
              <div className="inline-flex flex-col items-start justify-start">
                <div className="text-[#171D17] text-[24px] font-extrabold leading-[32px]">
                  {driver.name}
                </div>
                <div className="text-[#3D4A3F] text-[16px] font-medium leading-[24px]">
                  {driver.car}
                </div>
                <div className="pt-1 flex flex-col items-start justify-start">
                  <div className="px-2 py-[2px] bg-[#E3EAE0] rounded flex items-center justify-center">
                    <div className="text-[#3D4A3F] text-[11px] font-bold uppercase leading-[16.5px] tracking-[0.55px]">
                      {driver.licensePlate || '51H-123.45'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="inline-flex flex-col items-start justify-start w-[75.5px]">
              <div className="relative w-full h-[41px]">
                <div className="absolute left-[24.5px] top-[-0.5px] flex flex-col justify-center text-right text-[#006D37] text-[36px] font-black leading-[40px]">
                  {etaMinutes !== null ? etaMinutes : '-'}
                </div>
                <div className="absolute left-[48.5px] top-[5.5px] flex flex-col justify-center text-right text-[#006D37] text-[24px] font-extrabold leading-[28px]">
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
              <div className="w-[40px] h-[40px] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-full flex items-center justify-center flex-shrink-0">
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
              <div className="w-[40px] h-[40px] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-full flex items-center justify-center flex-shrink-0">
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
                145,000 VND
              </div>
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
