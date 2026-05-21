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

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { position, error } = useGeolocation();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isOnline, setIsOnline] = useState(true);
  const [recenterKey, setRecenterKey] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<any>(null);
  const [driverData, setDriverData] = useState<any>(() => getCache(CACHE_KEYS.DRIVER_PROFILE) || null);
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

    fetchProfile();
    fetchRevenue();
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

    return () => {
      socketService.offIncomingBooking();
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
        navigate('/driver/chat', { 
          state: { 
            passengerName: currentRequest.passengerName, 
            rideId: currentRequest.rideId 
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

  const mockRequest = {
    passengerName: '山田 亜希子',
    passengerAvatar: 'https://i.pravatar.cc/150?u=akiko',
    pickupLocation: '高島屋サイゴン（1区）',
    destinationLocation: 'タンソンニャット空港第2ターミナル',
    distanceToPickup: '1.2 km',
    estimatedFare: '145k VND',
    duration: '約25分',
    paymentMethod: 'クレジットカード'
  };

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
      <div className="dd-top-controls">
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

        <FAB 
          onClick={() => setRecenterKey(k => k + 1)}
          ariaLabel="現在地に戻る"
          style={{ position: 'static' }} 
        />
      </div>

      {/* INCOME CARD */}
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
            const barHeightPercent = d.value > 0 ? (d.value / maxWeeklyVal) * 70 + 15 : 0;
            return (
              <div key={i} className="dd-chart-column">
                <div 
                  className={`dd-chart-bar ${d.highlight ? 'highlight' : ''}`} 
                  style={{ height: `${barHeightPercent}%` }} 
                />
                <div className={`dd-chart-day ${d.highlight ? 'highlight' : ''}`}>
                  {d.day}
                </div>
              </div>
            );
          })}
        </div>
        
      </div>

      {/* BOTTOM NAV */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* INCOMING REQUEST POPUP */}
      {showPopup && (
        <div className="dd-popup-overlay">
          <IncomingRequestPopup
            request={currentRequest || mockRequest}
            onAccept={handleAcceptRide}
            onDecline={handleDeclineRide}
            timeoutSeconds={180}
          />
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
