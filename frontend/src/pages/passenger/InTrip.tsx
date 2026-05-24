import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/features/MapView';
import { FAB } from '../../components/ui/FAB';
import { useBooking } from '../../contexts/BookingContext';

// SVG Icons
import IconCall from '../../assets/IconCall.svg';
import IconMess from '../../assets/IconMess.svg';
import IconClock from '../../assets/IconClock.svg';
import IconCar from '../../assets/IconCar.svg';
import IconLocation from '../../assets/IconLocation.svg';
import { socketService } from '../../services/socketService';
import { SmartMapRoute } from '../../components/features/SmartMapRoute';
import { getRouteWithDuration } from '../../hooks/useLocationSuggestions';
import { distanceBetween } from '../../utils/routeUtils';

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

export default function InTrip() {
  const navigate = useNavigate();
  const location = useLocation();
  const [recenterKey, setRecenterKey] = useState(0);
  const { pickup: pickupData, destination: destData } = useBooking();

  const driver = location.state?.driver || {
    name: 'Nguyen Tan',
    avatar: 'https://i.pravatar.cc/150?img=11',
    rating: '4.9',
    car: 'Toyota Camry',
    licensePlate: '51H-123.45'
  };

  // Vị trí tài xế (Khởi tạo từ pickup, cập nhật qua socket)
  const [driverPosition, setDriverPosition] = useState({ 
    lat: pickupData?.coords?.lat ? pickupData.coords.lat + 0.008 : 21.0150, 
    lng: pickupData?.coords?.lng ? pickupData.coords.lng - 0.005 : 105.8350 
  });
  
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const [arrivalTime, setArrivalTime] = useState<string>('--:--');
  const lastFetchedPos = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    socketService.onDriverLocation((data) => {
      setDriverPosition({ lat: data.lat, lng: data.lng });
    });
    return () => {
      socketService.offDriverLocation();
    };
  }, []);

  useEffect(() => {
    const fetchEta = async () => {
      if (!driverPosition || !destData?.coords) return;
      
      const destinationPos = { lat: destData.coords.lat, lng: destData.coords.lng };
      
      // Chỉ gọi lại API nếu di chuyển hơn 50m để tránh spam API
      if (lastFetchedPos.current) {
        const dist = distanceBetween(driverPosition, lastFetchedPos.current);
        if (dist < 50) return;
      }
      
      try {
        const { duration } = await getRouteWithDuration(driverPosition, destinationPos);
        if (duration !== Infinity) {
          const minutes = Math.max(1, Math.ceil(duration / 60));
          setEtaMinutes(minutes);
          
          // Calculate arrival time
          const now = new Date();
          now.setMinutes(now.getMinutes() + minutes);
          const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setArrivalTime(timeString);
          
          lastFetchedPos.current = driverPosition;
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchEta();
  }, [driverPosition, destData?.coords]);

  // Redirect if no location is selected
  if (!pickupData?.coords || !destData?.coords) {
    return <Navigate to="/passenger/search-location" replace />;
  }

  const destinationPosition = { lat: destData.coords.lat, lng: destData.coords.lng };
  const destName = destData.address || '目的地';
  const pickupName = pickupData.address || '乗車場所';

  const handleChat = () => navigate('/passenger/chat', { state: { target: driver } });
  const handleCall = () => navigate('/passenger/call-driver', { state: { target: driver } });
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
          pickupPosition={pickupData?.coords}
          destinationPosition={destinationPosition}
          recenterKey={recenterKey}
          showPickupLabel={false}
          hidePickupMarker={true}
          hideDestinationMarker={true}
          hideRoute={true}
          routePadding={[[50, 120], [50, 420]]}
          viewPadding={{ top: 100, bottom: 420, left: 50, right: 50 }}
          extraPositions={[driverPosition]}
        >
          {/* Đường vẽ thông minh với 3 Case xử lý */}
          <SmartMapRoute driverPosition={driverPosition} destination={destinationPosition} color="url(#routeGradient)" />

          {/* Marker vị trí hiện tại (xe) */}
          <Marker position={[driverPosition.lat, driverPosition.lng]} icon={carIcon} />
          {/* Marker đích đến */}
          <Marker position={[destinationPosition.lat, destinationPosition.lng]} icon={createDestinationIcon(destName)} />
        </MapView>
      </div>

      <FAB onClick={handleRecenter} className="fixed top-[96px] right-4" />

      {/* Floating Card UI */}
      <div className="absolute bottom-6 left-4 right-4 z-[1000] flex justify-center pointer-events-none">
        <div className="w-full max-w-[390px] flex flex-col pointer-events-auto" style={{ alignItems: 'center' }}>
          <div style={{alignSelf: 'stretch', background: 'white', boxShadow: '0px -8px 24px rgba(0, 0, 0, 0.08)', overflow: 'hidden', borderTopLeftRadius: 32, borderTopRightRadius: 32, borderBottomRightRadius: 24, borderBottomLeftRadius: 24, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
            <div style={{alignSelf: 'stretch', paddingTop: 24, paddingBottom: 16, paddingLeft: 32, paddingRight: 32, background: '#EFF6EC', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                  <div style={{width: 165.91, height: 16, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3D4A3F', fontSize: 12, fontWeight: '400', textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 1.20, wordWrap: 'break-word'}}>到着予定</div>
                </div>
                <div style={{alignSelf: 'stretch', height: 40, position: 'relative'}}>
                  <div style={{width: 20.03, height: 40, left: 0, top: 0, position: 'absolute', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#006D37', fontSize: 36, fontWeight: '800', lineHeight: '40px', wordWrap: 'break-word'}}>{etaMinutes !== null ? etaMinutes : '-'}</div>
                  <div style={{width: 38, height: 28, left: 27, top: 10, position: 'absolute', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#006D37', fontSize: 24, fontWeight: '800', lineHeight: '28px', wordWrap: 'break-word'}}>分</div>
                </div>
              </div>
              <div style={{paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, background: 'rgba(0, 109, 55, 0.10)', borderRadius: 9999, justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex'}}>
                <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                  <img src={IconClock} alt="Time" style={{width: 11.67, height: 11.67}} />
                </div>
                <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                  <div style={{width: 52.25, height: 16, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#006D37', fontSize: 12, fontWeight: '700', lineHeight: '16px', whiteSpace: 'nowrap'}}>{arrivalTime}</div>
                </div>
              </div>
            </div>
            <div style={{alignSelf: 'stretch', height: 231, paddingBottom: 32, paddingLeft: 32, paddingRight: 32, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 20, display: 'flex'}}>
              <div style={{width: 304, justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{width: 188, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                  <div style={{position: 'relative', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                    <div style={{width: 64, height: 64, background: 'rgba(255, 255, 255, 0)', boxShadow: '0px 2px 4px -2px rgba(0, 0, 0, 0.10), 0px 4px 6px -1px rgba(0, 0, 0, 0.10)', overflow: 'hidden', borderRadius: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
                      <img style={{alignSelf: 'stretch', flex: '1 1 0', position: 'relative', objectFit: 'cover'}} src={driver.avatar} alt={driver.name} />
                    </div>
                    <div style={{paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2, left: 29.77, top: 53, position: 'absolute', background: '#FEA520', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 3.99, display: 'inline-flex'}}>
                      <div style={{width: 13.91, height: 15, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#694000', fontSize: 8, fontWeight: '900', lineHeight: '15px', wordWrap: 'break-word'}}>{driver.rating}</div>
                      <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                        <span style={{fontSize: 8, color: '#694000', lineHeight: '15px'}}>★</span>
                      </div>
                    </div>
                  </div>
                  <div style={{width: 114, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                    <div style={{width: 114, height: 44, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                      <div style={{width: 155, height: 56, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 20, fontWeight: '800', lineHeight: '32px', whiteSpace: 'nowrap'}}>{driver.name}</div>
                    </div>
                    <div style={{width: 114, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                      <div style={{width: 114, height: 40, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3D4A3F', fontSize: 14, fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>{driver.car} •<br/>{driver.licensePlate || '51H-123.45'}</div>
                    </div>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                      <div style={{width: 109, height: 23, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'rgba(61, 74, 63, 0.70)', fontSize: 10, fontWeight: '400', textTransform: 'uppercase', lineHeight: '15px', wordWrap: 'break-word'}}> 認定ドライバー</div>
                    </div>
                  </div>
                </div>
                <div style={{justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div className="cursor-pointer" onClick={handleCall} style={{width: 48, height: 48, background: '#E9F0E6', borderRadius: 24, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                    <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                      <img src={IconCall} alt="Call" style={{width: 18, height: 18, objectFit: 'contain'}} />
                    </div>
                  </div>
                </div>
                <div className="cursor-pointer" onClick={handleChat} style={{width: 48, height: 48, background: '#E9F0E6', borderRadius: 24, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                  <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                    <img src={IconMess} alt="Chat" style={{width: 20, height: 20, objectFit: 'contain'}} />
                  </div>
                </div>
              </div>
              <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                <div style={{paddingTop: 4, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                  <div style={{width: 8, height: 8, background: '#27AE60', borderRadius: 9999}} />
                  <div style={{width: 2, height: 48, paddingTop: 4, paddingBottom: 4, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                    <div style={{width: 2, height: 40, background: 'rgba(188, 202, 188, 0.30)'}} />
                  </div>
                  <div style={{width: 12, height: 12, background: '#865300', boxShadow: '0px 0px 8px rgba(254, 165, 32, 0.40)', borderRadius: 9999}} />
                </div>
                <div style={{flex: '1 1 0', minWidth: 0, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                  <div style={{alignSelf: 'stretch', opacity: 0.40, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch', display: 'flex'}}>
                    <div style={{width: 142.20, height: 15, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3D4A3F', fontSize: 10, fontWeight: '400', textTransform: 'uppercase', lineHeight: '15px', wordWrap: 'break-word'}}>現在地</div>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch', display: 'flex'}}>
                      <div style={{width: '100%', minHeight: 16, display: 'block', color: '#171D17', fontSize: 12, fontWeight: '500', lineHeight: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{pickupName}</div>
                    </div>
                  </div>
                  <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch', display: 'flex'}}>
                    <div style={{width: 106.33, height: 15, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#865300', fontSize: 10, fontWeight: '400', textTransform: 'uppercase', lineHeight: '15px', wordWrap: 'break-word'}}> 行き先</div>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch', display: 'flex'}}>
                      <div style={{width: '100%', minHeight: 24, display: 'block', color: '#171D17', fontSize: 16, fontWeight: '700', lineHeight: '24px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{destName}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
