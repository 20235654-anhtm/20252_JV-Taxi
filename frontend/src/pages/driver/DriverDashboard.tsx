import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/features/MapView';
import { BottomNavBar, type NavTab } from '../../components/layout/BottomNavBar';
import { FAB } from '../../components/ui/FAB';
import { API_BASE_URL } from '../../config/api';
import { useGeolocation } from '../../hooks/useGeolocation';
import IncomingRequestPopup from '../../components/features/IncomingRequestPopup';
import svgPaths from './svg-paths';
import { socketService } from '../../services/socketService';
import { showToast } from '../../components/ui/Toast';
import { getCache, setCache, CACHE_KEYS } from '../../services/cacheService';
import './DriverDashboard.css';

const formatCurrency = (value: number) => {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString('vi-VN');
};

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { position, error } = useGeolocation();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isOnline, setIsOnline] = useState(true);
  const [recenterKey, setRecenterKey] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showCanceledPopup, setShowCanceledPopup] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<any>(null);
  const [driverData, setDriverData] = useState<any>(() => getCache(CACHE_KEYS.DRIVER_PROFILE) || null);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [revenueData, setRevenueData] = useState<any>({
    dailyEarnings: 0,
    weeklyTotal: 0,
    totalEarnings: 0,
    totalTrips: 0,
    weeklyData: [
      { day: 'Mon', label: '月', value: 0 },
      { day: 'Tue', label: '火', value: 0 },
      { day: 'Wed', label: '水', value: 0 },
      { day: 'Thu', label: '木', value: 0 },
      { day: 'Fri', label: '金', value: 0 },
      { day: 'Sat', label: '土', value: 0 },
      { day: 'Sun', label: '日', value: 0 }
    ]
  });

  useEffect(() => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) return;
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setDriverData(data.user);
          setCache(CACHE_KEYS.DRIVER_PROFILE, data.user);
        }
      } catch (error) {
        console.error('Error fetching dashboard profile:', error);
      }
    };

    const fetchRevenue = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/drivers/revenue`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setRevenueData(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching driver revenue:', error);
      }
    };

    const fetchActiveRide = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/rides/active/current`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.data) {
            const ride = res.data;
            if (ride.status === 'PENDING') {
              const mappedRequest = {
                rideId: ride.id,
                passengerId: ride.passenger?.id || ride.passengerId,
                passengerName: ride.passenger?.fullName || '...',
                passengerAvatar: ride.passenger?.avatar || '',
                pickupLocation: ride.start_address || ride.startAddress,
                destinationLocation: ride.end_address || ride.endAddress,
                startLat: Number(ride.startLat),
                startLng: Number(ride.startLng),
                endLat: Number(ride.endLat),
                endLng: Number(ride.endLng),
                distanceToPickup: '1.2 km',
                estimatedFare: `${Math.round(Number(ride.match_fee || ride.matchFee) / 1000)}k VND`,
                duration: '約25分',
                paymentMethod: ride.payment?.paymentType === 'CARD' ? 'クレジットカード' : '現金'
              };
              setCurrentRequest(mappedRequest);
              setShowPopup(true);
              setActiveRide(null);
            } else {
              setActiveRide(ride);
              
              // Save active ride details in sessionStorage for DriverInTrip screen
              sessionStorage.setItem('active_ride_id', ride.id);
              sessionStorage.setItem('active_passenger_id', ride.passenger?.id || '');
              sessionStorage.setItem('active_passenger_name', ride.passenger?.fullName || '');
              sessionStorage.setItem('active_passenger_avatar', ride.passenger?.avatar || '');
              sessionStorage.setItem('active_pickup_location', ride.start_address || ride.startAddress);
              sessionStorage.setItem('active_destination_location', ride.end_address || ride.endAddress);
              sessionStorage.setItem('active_start_lat', String(ride.startLat));
              sessionStorage.setItem('active_start_lng', String(ride.startLng));
              sessionStorage.setItem('active_end_lat', String(ride.endLat));
              sessionStorage.setItem('active_end_lng', String(ride.endLng));
              sessionStorage.setItem('active_fare', `${Math.round(Number(ride.match_fee || ride.matchFee) / 1000)}k VND`);
            }
          } else {
            setActiveRide(null);
          }
        }
      } catch (err) {
        console.error('Error fetching active ride for driver:', err);
      }
    };

    fetchProfile();
    fetchRevenue();
    fetchActiveRide();
  }, []);

  // Print geolocation changes for debugging
  useEffect(() => {
    console.log("[DriverDashboard] useGeolocation hook position changed:", position, "error:", error);
  }, [position, error]);

  // Sync online status and GPS location to backend
  useEffect(() => {
    const updateStatus = async () => {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) {
          console.warn("[DriverDashboard] No authToken found in sessionStorage or localStorage.");
          return;
        }

        const body: any = {
          isOnline: isOnline
        };

        if (isOnline && position) {
          body.lat = position.lat;
          body.lng = position.lng;
        }

        console.log("[DriverDashboard] Syncing status to backend at URL:", `${API_BASE_URL}/api/drivers/status`, "Body:", body);

        const response = await fetch(`${API_BASE_URL}/api/drivers/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });

        const resData = await response.json();
        console.log("[DriverDashboard] Backend status response:", resData);
      } catch (err) {
        console.error('[DriverDashboard] Error updating status/location:', err);
      }
    };

    updateStatus();
  }, [isOnline, position]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  const currentDayOfWeek = new Date().getDay();
  const todayIndex = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'profile') {
      navigate('/driver/profile');
    }
  };

  // Listen for incoming booking via socket
  useEffect(() => {
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      socketService.connect(user.id);
    }

    socketService.onIncomingBooking((data) => {
      console.log('📡 Received incoming booking request:', data);
      setCurrentRequest(data);
      setShowPopup(true);
    });

    socketService.onBookingCancelled((data) => {
      console.log('❌ Booking cancelled by passenger!', data);
      setCurrentRequest((prev: any) => {
        if (prev && prev.rideId === data.rideId) {
          setShowPopup(false);
          setShowCanceledPopup(true);
          return null;
        }
        return prev;
      });
    });

    return () => {
      socketService.offIncomingBooking();
      socketService.offBookingCancelled();
    };
  }, []);

  const handleAcceptRide = async () => {
    if (!currentRequest) return;
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/rides/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rideId: currentRequest.rideId })
      });
      const data = await response.json();
      if (data.success) {
        setShowPopup(false);
        // Persist active ride info
        sessionStorage.setItem('active_ride_id', currentRequest.rideId);
        sessionStorage.setItem('active_passenger_id', currentRequest.passengerId || '');
        sessionStorage.setItem('active_passenger_name', currentRequest.passengerName);
        sessionStorage.setItem('active_passenger_avatar', currentRequest.passengerAvatar);
        sessionStorage.setItem('active_pickup_location', currentRequest.pickupLocation || '高島屋サイゴン（1区）');
        sessionStorage.setItem('active_destination_location', currentRequest.destinationLocation || 'タンソンニャット空港第2ターミナル');
        sessionStorage.setItem('active_start_lat', String(currentRequest.startLat || ''));
        sessionStorage.setItem('active_start_lng', String(currentRequest.startLng || ''));
        sessionStorage.setItem('active_end_lat', String(currentRequest.endLat || ''));
        sessionStorage.setItem('active_end_lng', String(currentRequest.endLng || ''));
        sessionStorage.setItem('active_distance_to_pickup', currentRequest.distanceToPickup || '1.2 km');
        sessionStorage.setItem('active_duration', currentRequest.duration || '約25分');
        sessionStorage.setItem('active_fare', currentRequest.estimatedFare || '145k VND');
        sessionStorage.setItem('active_payment_method', currentRequest.paymentMethod || 'クレジットカード');

        navigate('/driver/in-trip', { 
          state: { 
            passengerId: currentRequest.passengerId,
            passengerName: currentRequest.passengerName, 
            passengerAvatar: currentRequest.passengerAvatar,
            rideId: currentRequest.rideId,
            pickupLocation: currentRequest.pickupLocation,
            destinationLocation: currentRequest.destinationLocation,
            startLat: currentRequest.startLat,
            startLng: currentRequest.startLng,
            endLat: currentRequest.endLat,
            endLng: currentRequest.endLng,
            distanceToPickup: currentRequest.distanceToPickup,
            duration: currentRequest.duration,
            estimatedFare: currentRequest.estimatedFare,
            paymentMethod: currentRequest.paymentMethod
          } 
        });
      } else {
        showToast('Có lỗi xảy ra khi nhận chuyến.', 'error');
      }
    } catch (err) {
      console.error('Error accepting ride:', err);
    }
  };

  const handleDeclineRide = async () => {
    if (!currentRequest) return;
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      await fetch(`${API_BASE_URL}/api/rides/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rideId: currentRequest.rideId })
      });
      setShowPopup(false);
      setCurrentRequest(null);
    } catch (err) {
      console.error('Error declining ride:', err);
      setShowPopup(false);
    }
  };

  const weeklyDataWithHighlight = revenueData.weeklyData.map((d: any, index: number) => ({
    day: d.label,
    value: d.value,
    highlight: index === todayIndex
  }));

  return (
    <div className="driver-dashboard-page">
      <Header
        variant="auth"
        userAvatar={driverData?.avatar || driverData?.driverProfile?.avatarPicture || null}
        userName={driverData?.fullName || "D"}
        onAvatarClick={() => navigate('/driver/profile')}
      />

      {/* MAP BACKGROUND */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <MapView
          position={position}
          error={error}
          zoom={15}
          recenterKey={recenterKey}
          hasBottomNav
        />
      </div>

      {/* TOP CONTROLS */}
      <div className="dd-top-controls" style={{ justifyContent: 'center' }}>
        <div className="dd-toggle-container">
          <button 
            className={`dd-toggle-btn ${isOnline ? 'active' : 'inactive'}`}
            onClick={() => setIsOnline(true)}
          >
            {isOnline && <span className="dd-status-dot" />}
            オンライン
          </button>
          <button 
            className={`dd-toggle-btn ${!isOnline ? 'active' : 'inactive'}`}
            onClick={() => setIsOnline(false)}
            style={!isOnline ? { background: '#6B7A6C' } : {}}
          >
            オフライン
          </button>
        </div>
      </div>

      <FAB 
        onClick={() => setRecenterKey(k => k + 1)}
        ariaLabel="現在地に戻る"
        className="absolute right-4"
        style={{ top: '50%', transform: 'translateY(-50%)', zIndex: 1010 }} 
      />

      {/* INCOME CARD OR ACTIVE RIDE POPUP */}
      {activeRide ? (
        /* ACTIVE RIDE POPUP FOR DRIVER */
        <div style={sheetStyles.container}>
          {/* Drag handle */}
          <div 
            style={sheetStyles.dragHandle} 
            onClick={() => setIsExpanded(!isExpanded)}
          />
          
          {/* Header */}
          <div 
            style={sheetStyles.header}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span style={sheetStyles.title}>進行中の乗車</span>
            {!isExpanded && (
              <span style={sheetStyles.expandHint}>タップして詳細を表示</span>
            )}
          </div>

          {isExpanded && (
            <div style={sheetStyles.expandedContent}>
              {/* Pickup Row */}
              <div style={sheetStyles.locationRow}>
                <div style={sheetStyles.iconContainerGreen}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006D37" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div style={sheetStyles.locationInfo}>
                  <div style={sheetStyles.locationLabel}>乗車場所</div>
                  <div style={sheetStyles.locationValue}>{activeRide.start_address || activeRide.startAddress}</div>
                </div>
              </div>

              {/* Destination Row */}
              <div style={sheetStyles.locationRow}>
                <div style={sheetStyles.iconContainerRed}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    <line x1="4" y1="22" x2="4" y2="15" />
                  </svg>
                </div>
                <div style={sheetStyles.locationInfo}>
                  <div style={sheetStyles.locationLabel}>目的地</div>
                  <div style={sheetStyles.locationValue}>{activeRide.end_address || activeRide.endAddress}</div>
                </div>
              </div>

              {/* Passenger Profile Block */}
              {activeRide.passenger && (
                <div style={sheetStyles.profileCard}>
                  <div style={sheetStyles.avatarWrapper}>
                    {activeRide.passenger.avatar ? (
                      <img 
                        src={activeRide.passenger.avatar} 
                        alt="Passenger avatar" 
                        style={sheetStyles.avatarImg}
                      />
                    ) : (
                      <div style={sheetStyles.avatarPlaceholder}>
                        {activeRide.passenger.fullName ? activeRide.passenger.fullName.charAt(0).toUpperCase() : 'P'}
                      </div>
                    )}
                  </div>
                  
                  <div style={sheetStyles.profileInfo}>
                    <div style={sheetStyles.nameRow}>
                      <span style={sheetStyles.profileName}>{activeRide.passenger.fullName}</span>
                    </div>
                    {activeRide.passenger.phone && (
                      <div style={sheetStyles.carDetails}>
                        {activeRide.passenger.phone}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Show Map Button */}
          <button 
            onClick={() => {
              navigate('/driver/in-trip', { 
                state: { 
                  passengerId: activeRide.passenger?.id || '',
                  passengerName: activeRide.passenger?.fullName || '', 
                  passengerAvatar: activeRide.passenger?.avatar || '',
                  rideId: activeRide.id,
                  pickupLocation: activeRide.start_address || activeRide.startAddress,
                  destinationLocation: activeRide.end_address || activeRide.endAddress,
                  startLat: activeRide.startLat,
                  startLng: activeRide.startLng,
                  endLat: activeRide.endLat,
                  endLng: activeRide.endLng,
                  distanceToPickup: '1.2 km',
                  duration: '約25分',
                  estimatedFare: `${Math.round(Number(activeRide.match_fee || activeRide.matchFee) / 1000)}k VND`,
                  paymentMethod: 'クレジットカード'
                } 
              });
            }}
            style={sheetStyles.button}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" y1="3" x2="9" y2="18" />
              <line x1="15" y1="6" x2="15" y2="21" />
            </svg>
            <span>地図を表示</span>
          </button>
        </div>
      ) : (
        <div className="dd-income-card">
          <div className="dd-income-header">
            <div>
              <div className="dd-income-title">日次収益</div>
              <div className="dd-income-amount">
                {formatCurrency(revenueData.dailyEarnings)}<span className="dd-income-currency">₫</span>
              </div>
            </div>
            <div className="dd-wallet-icon" role="button" aria-label="Wallet">
              <div className="h-[18px] relative shrink-0 w-[19px]" data-name="Container">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 18">
                  <g id="Container">
                    <path d={svgPaths.p3f8e080} fill="var(--fill-0, #27AE60)" id="Icon" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <div className="dd-chart-container">
            {weeklyDataWithHighlight.map((d: any, i: number) => {
              const maxWeeklyVal = Math.max(...revenueData.weeklyData.map((w: any) => w.value), 1);
              const level = d.value > 0 ? Math.ceil((d.value / maxWeeklyVal) * 7) : 0;
              const barHeightPercent = level > 0 ? ((level - 1) / 6) * 70 + 15 : 0;

              const barColors = [
                '#52D191', // Mon: Mint Green
                '#25B867', // Tue: Medium Green
                '#00A389', // Wed: Emerald/Teal
                '#0096B1', // Thu: Dark Teal
                '#0084C8', // Fri: Ocean Blue
                '#5F6CAF', // Sat: Soft Blue-Purple
                '#8E5CB5'  // Sun: Amethyst Purple
              ];

              return (
                <div key={i} className="dd-chart-column">
                  <div className="dd-chart-bar-wrapper">
                    <div 
                      className={`dd-chart-bar ${d.highlight ? 'highlight' : ''}`} 
                      style={{ 
                        height: `${barHeightPercent}%`,
                        backgroundColor: d.value > 0 ? barColors[i] : undefined
                      }} 
                    />
                  </div>
                  <div className={`dd-chart-day ${d.highlight ? 'highlight' : ''}`}>
                    {d.day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        role="driver"
      />

      {/* INCOMING REQUEST POPUP */}
      {showPopup && currentRequest && (
        <div className="dd-popup-overlay">
          <IncomingRequestPopup
            request={currentRequest}
            onAccept={handleAcceptRide}
            onDecline={handleDeclineRide}
            timeoutSeconds={180}
          />
        </div>
      )}

      {/* CANCELED POPUP */}
      {showCanceledPopup && (
        <div className="dd-popup-overlay">
          <div className="dd-canceled-popup" style={{ background: 'white', padding: '24px', borderRadius: '16px', textAlign: 'center', width: '90%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#C62828', marginBottom: '16px' }}>
              お客様によってリクエストがキャンセルされました
            </h2>
            <button 
              onClick={() => setShowCanceledPopup(false)}
              style={{ background: '#171D17', color: 'white', padding: '12px 24px', borderRadius: '8px', width: '100%', fontWeight: 600 }}
            >
              確認
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const sheetStyles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    bottom: '96px',
    left: '16px',
    right: '16px',
    background: '#ffffff',
    borderRadius: '32px 32px 24px 24px',
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.12)',
    padding: '24px',
    zIndex: 1011,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"Plus Jakarta Sans", "Noto Sans JP", sans-serif',
    boxSizing: 'border-box',
    border: '1px solid rgba(0, 109, 55, 0.08)',
  },
  dragHandle: {
    width: '40px',
    height: '5px',
    background: '#E5E9E5',
    borderRadius: '9999px',
    margin: '0 auto 16px auto',
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#006D37',
  },
  expandHint: {
    fontSize: '12px',
    color: '#71717A',
    fontWeight: '600',
  },
  expandedContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '16px',
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconContainerGreen: {
    width: '40px',
    height: '40px',
    background: '#EFF6EC',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconContainerRed: {
    width: '40px',
    height: '40px',
    background: '#FDF2F2',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  locationInfo: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    flex: 1,
  },
  locationLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#71717A',
    marginBottom: '2px',
  },
  locationValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#171D17',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  profileCard: {
    background: '#EFF6EC',
    borderRadius: '16px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '4px',
  },
  avatarWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    background: '#006D37',
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '2px',
  },
  profileName: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#171D17',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  carDetails: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#3D4A3F',
  },
  button: {
    width: '100%',
    background: '#006D37',
    color: '#ffffff',
    border: 'none',
    borderRadius: '24px',
    padding: '14px 0',
    fontSize: '16px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0px 8px 24px rgba(0, 109, 55, 0.22)',
    transition: 'background 0.2s ease',
  }
};

export default DriverDashboard;
