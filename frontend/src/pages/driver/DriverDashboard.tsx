import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/features/MapView';
import { BottomNavBar, type NavTab } from '../../components/layout/BottomNavBar';
import { FAB } from '../../components/ui/FAB';
import { API_BASE_URL } from '../../config/api';
import { useGeolocation } from '../../hooks/useGeolocation';
import IncomingRequestPopup from '../../components/features/IncomingRequestPopup';
import { socketService } from '../../services/socketService';
import './DriverDashboard.css';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { position, error } = useGeolocation();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isOnline, setIsOnline] = useState(true);
  const [recenterKey, setRecenterKey] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [driverData, setDriverData] = useState<any>(null);
  const [currentRequest, setCurrentRequest] = useState<any>(null);

  useEffect(() => {
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
        }
      } catch (error) {
        console.error('Error fetching dashboard profile:', error);
      }
    };
    fetchProfile();
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
        alert('Có lỗi xảy ra khi nhận chuyến.');
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


  // Mock data for weekly income
  const weeklyData = [
    { day: '月', value: 20 },
    { day: '火', value: 40 },
    { day: '水', value: 15 },
    { day: '木', value: 50 },
    { day: '金', value: 80, highlight: true },
    { day: '土', value: 10 },
    { day: '日', value: 25 },
  ];

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
      {/* HEADER */}
      <Header
        variant="auth"
        userAvatar={driverData?.driverProfile?.avatarPicture || "https://i.pravatar.cc/150?img=12"}
        onAvatarClick={() => navigate('/driver/profile')}
        isFixed={false}
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
              1,450,000<span className="dd-income-currency">₫</span>
            </div>
          </div>
          <div className="dd-wallet-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 5H4C2.89543 5 2 5.89543 2 7V17C2 18.1046 2.89543 19 4 19H17" stroke="#27AE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 9C22 7.89543 21.1046 7 20 7H14C12.8954 7 12 7.89543 12 9V15C12 16.1046 12.8954 17 14 17H20C21.1046 17 22 16.1046 22 15V9Z" fill="#27AE60" stroke="#27AE60" strokeWidth="0.5"/>
              <circle cx="17" cy="12" r="1.5" fill="white"/>
            </svg>
          </div>
        </div>

        <div className="dd-chart-container">
          {weeklyData.map((d, i) => (
            <div key={i} className="dd-chart-column">
              <div 
                className={`dd-chart-bar ${d.highlight ? 'highlight' : ''}`} 
                style={{ height: `${d.value}%` }} 
              />
              <div className={`dd-chart-day ${d.highlight ? 'highlight' : ''}`}>
                {d.day}
              </div>
            </div>
          ))}
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
