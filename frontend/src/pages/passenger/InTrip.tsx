import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/features/MapView';
import { FAB } from '../../components/ui/FAB';
import { useBooking } from '../../contexts/BookingContext';
import { showToast } from '../../components/ui/Toast';

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
import { API_BASE_URL } from '../../config/api';

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

  // Retrieve active ride ID & driver info from state or sessionStorage fallback
  const rideId = location.state?.rideId || sessionStorage.getItem('active_ride_id') || '';
  const storedDriverStr = sessionStorage.getItem('active_driver');
  const driver = location.state?.driver || (storedDriverStr ? JSON.parse(storedDriverStr) : {
    name: '...',
    avatar: '',
    rating: '...',
    car: '...',
    licensePlate: '...'
  });

  const fallbackDriverPos = { 
    lat: pickupData?.coords?.lat ? pickupData.coords.lat + 0.008 : 21.0150, 
    lng: pickupData?.coords?.lng ? pickupData.coords.lng - 0.005 : 105.8350 
  };

  // Vị trí tài xế khởi tạo bằng toạ độ mock để bản đồ vẽ đường ngay lập tức, cập nhật khi fetch thành công hoặc qua socket
  const [driverPosition, setDriverPosition] = useState<{ lat: number; lng: number }>(fallbackDriverPos);
  const [rideDetails, setRideDetails] = useState<any>(null);
  
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const [arrivalTime, setArrivalTime] = useState<string>('--:--');
  const lastFetchedPos = useRef<{ lat: number; lng: number } | null>(null);

  // Fetch actual ride details to get driver location and info
  useEffect(() => {
    const fetchRideDetails = async () => {
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
          if (res.data.driver?.driverProfile?.lat && res.data.driver?.driverProfile?.lng) {
            setDriverPosition({
              lat: Number(res.data.driver.driverProfile.lat),
              lng: Number(res.data.driver.driverProfile.lng)
            });
          }
        }
      } catch (err) {
        console.error('Error fetching ride details:', err);
      }
    };
    fetchRideDetails();
  }, [rideId]);

  useEffect(() => {
    if (!rideId) {
      showToast('乗車情報が見つかりませんでした。', 'error');
      navigate('/passenger');
      return;
    }

    // Connect socket and listen for ride completion
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user') || '{}';
    const user = JSON.parse(userStr);
    if (user.id) {
      socketService.connect(user.id);
    }

    socketService.onDriverLocation((data) => {
      setDriverPosition({ lat: data.lat, lng: data.lng });
    });

    // Listen for ride-completed event from backend
    socketService.onRideCompleted((data) => {
      console.log('🏁 Ride completed successfully!', data);
      showToast('目的地に到着しました。ご利用ありがとうございました。', 'success');
      
      // Clear active ride session
      sessionStorage.removeItem('active_ride_id');
      sessionStorage.removeItem('active_driver');
      sessionStorage.removeItem('driver_arrived');
      
      // Redirect to rating page
      navigate('/passenger/rate-trip', { state: { driver, rideId } });
    });

    return () => {
      socketService.offDriverLocation();
      socketService.offRideCompleted();
    };
  }, [rideId, navigate, driver]);

  useEffect(() => {
    const fetchEta = async () => {
      if (!pickupData?.coords || !destData?.coords) return;
      
      const pickupPos = { lat: pickupData.coords.lat, lng: pickupData.coords.lng };
      const destinationPos = { lat: destData.coords.lat, lng: destData.coords.lng };
      
      try {
        const { duration } = await getRouteWithDuration(pickupPos, destinationPos);
        if (duration !== Infinity && !isNaN(duration)) {
          const minutes = Math.max(1, Math.ceil(duration / 60));
          setEtaMinutes(minutes);
          
          const now = new Date();
          now.setMinutes(now.getMinutes() + minutes);
          const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setArrivalTime(timeString);
        } else {
          throw new Error('Invalid OSRM duration');
        }
      } catch (e) {
        console.warn('OSRM error, using default fallback duration for in-trip:', e);
        setEtaMinutes(null);
        setArrivalTime('--:--');
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

  const handleChat = () => {
    sessionStorage.setItem('active_ride_id', rideId);
    sessionStorage.setItem('active_driver', JSON.stringify(driver));
    navigate('/passenger/chat', { state: { driver, rideId } });
  };
  
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
                  <div style={{width: 60, height: 40, left: 0, top: 0, position: 'absolute', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#006D37', fontSize: 36, fontWeight: '800', lineHeight: '40px', wordWrap: 'break-word'}}>{etaMinutes !== null && !isNaN(etaMinutes) ? etaMinutes : '...'}</div>
                  <div style={{width: 38, height: 28, left: (etaMinutes !== null && !isNaN(etaMinutes)) ? (String(etaMinutes).length * 18 + 5) : 41, top: 10, position: 'absolute', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#006D37', fontSize: 24, fontWeight: '800', lineHeight: '28px', wordWrap: 'break-word'}}>分</div>
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
              <div style={{width: '100%', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{width: 188, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                  <div style={{position: 'relative', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                    <div style={{width: 64, height: 64, background: 'rgba(255, 255, 255, 0)', boxShadow: '0px 2px 4px -2px rgba(0, 0, 0, 0.10), 0px 4px 6px -1px rgba(0, 0, 0, 0.10)', overflow: 'hidden', borderRadius: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
                      <img style={{alignSelf: 'stretch', flex: '1 1 0', position: 'relative', objectFit: 'cover'}} src={driver.avatar} alt={driver.name} />
                    </div>
                    <div style={{paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2, left: 29.77, top: 53, position: 'absolute', background: '#FEA520', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 3.99, display: 'inline-flex'}}>
                      <div style={{justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#694000', fontSize: 8, fontWeight: '900', lineHeight: '15px', whiteSpace: 'nowrap'}}>{driver.rating && driver.rating !== '...' && !isNaN(Number(driver.rating)) ? Number(driver.rating).toFixed(1) : driver.rating}</div>
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
                      <div style={{width: 114, height: 40, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3D4A3F', fontSize: 14, fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>
                        {(() => {
                          try {
                            if (typeof driver.car === 'string' && driver.car.startsWith('{')) {
                              const carObj = JSON.parse(driver.car);
                              return `${carObj.model || ''} • ${carObj.plate || ''}`;
                            }
                            if (typeof driver.car === 'object' && driver.car !== null) {
                              return `${(driver.car as any).model || ''} • ${(driver.car as any).plate || ''}`;
                            }
                            return driver.car;
                          } catch (e) {
                            return driver.car;
                          }
                        })() || '...'}
                      </div>
                    </div>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                      <div style={{width: 109, height: 23, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'rgba(61, 74, 63, 0.70)', fontSize: 10, fontWeight: '400', textTransform: 'uppercase', lineHeight: '15px', wordWrap: 'break-word'}}> 認定ドライバー</div>
                    </div>
                  </div>
                </div>
                <div style={{justifyContent: 'flex-end', alignItems: 'center', gap: 8, display: 'flex', alignSelf: 'flex-end', marginTop: 16}}>
                  <div className="cursor-pointer" onClick={handleChat} style={{width: 48, height: 48, background: '#E9F0E6', borderRadius: 24, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                    <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                      <img src={IconMess} alt="Chat" style={{width: 20, height: 20, objectFit: 'contain'}} />
                    </div>
                  </div>
                  <div className="cursor-pointer" onClick={handleCall} style={{width: 48, height: 48, background: '#E9F0E6', borderRadius: 24, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                    <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                      <img src={IconCall} alt="Call" style={{width: 18, height: 18, objectFit: 'contain'}} />
                    </div>
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
