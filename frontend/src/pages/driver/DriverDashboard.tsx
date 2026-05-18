import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/features/MapView';
import { BottomNavBar, type NavTab } from '../../components/layout/BottomNavBar';
import { FAB } from '../../components/ui/FAB';
import { API_BASE_URL } from '../../config/api';
import { useGeolocation } from '../../hooks/useGeolocation';
import IncomingRequestPopup from '../../components/features/IncomingRequestPopup';
import './DriverDashboard.css';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { position, error } = useGeolocation();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isOnline, setIsOnline] = useState(true);
  const [recenterKey, setRecenterKey] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [driverData, setDriverData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
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

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'profile') {
      navigate('/driver/profile');
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
          <div className="dd-wallet-icon">👝</div>
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
            request={mockRequest}
            onAccept={() => {
              setShowPopup(false);
              alert('リクエストを受け付けました。ナビゲーションを開始します。');
            }}
            onDecline={() => setShowPopup(false)}
            timeoutSeconds={180}
          />
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
