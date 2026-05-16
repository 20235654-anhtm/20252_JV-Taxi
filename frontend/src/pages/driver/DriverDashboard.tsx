import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/features/MapView';
import { BottomNavBar, type NavTab } from '../../components/layout/BottomNavBar';
import { FAB } from '../../components/ui/FAB';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useSocket } from '../../hooks/useSocket';
import IncomingRequestPopup from '../../components/features/IncomingRequestPopup';
import './DriverDashboard.css';

interface RideRequest {
  rideId: string;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  startAddress: string;
  endAddress: string;
  matchFee?: number;
  vehicleTypeRequested?: string;
}

const API_BASE = 'http://localhost:5000/api';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { position, error } = useGeolocation();
  const socketRef = useSocket();

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isOnline, setIsOnline] = useState(true);
  const [recenterKey, setRecenterKey] = useState(0);
  const [incomingRequest, setIncomingRequest] = useState<RideRequest | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Weekly income mock
  const weeklyData = [
    { day: '月', value: 20 }, { day: '火', value: 40 },
    { day: '水', value: 15 }, { day: '木', value: 50 },
    { day: '金', value: 80, highlight: true },
    { day: '土', value: 10 }, { day: '日', value: 25 },
  ];

  // Listen for incoming ride requests via socket
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNewRide = (data: RideRequest) => {
      if (isOnline) setIncomingRequest(data);
    };

    socket.on('new_ride_request', handleNewRide);
    return () => { socket.off('new_ride_request', handleNewRide); };
  }, [socketRef, isOnline]);

  const handleAccept = async () => {
    if (!incomingRequest) return;
    try {
      await fetch(`${API_BASE}/rides/${incomingRequest.rideId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED', driverId: user.id }),
      });

      setIncomingRequest(null);
      // Navigate to driver's in-progress screen
      navigate('/driver/ride-in-progress', {
        state: {
          rideId: incomingRequest.rideId,
          passenger: {
            name: incomingRequest.passengerName,
            phone: incomingRequest.passengerPhone,
          },
          startAddress: incomingRequest.startAddress,
          endAddress: incomingRequest.endAddress,
        },
      });
    } catch (err) {
      console.error('Accept ride error:', err);
    }
  };

  const handleDecline = async () => {
    if (!incomingRequest) return;
    try {
      await fetch(`${API_BASE}/rides/${incomingRequest.rideId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', driverId: user.id }),
      });
    } catch (err) {
      console.error('Decline ride error:', err);
    }
    setIncomingRequest(null);
  };

  // Format incoming request for popup component
  const popupRequest = incomingRequest
    ? {
        passengerName: incomingRequest.passengerName,
        passengerAvatar: `https://i.pravatar.cc/150?u=${incomingRequest.passengerId}`,
        pickupLocation: incomingRequest.startAddress,
        destinationLocation: incomingRequest.endAddress,
        distanceToPickup: '-- km',
        estimatedFare: incomingRequest.matchFee ? `${Math.round(incomingRequest.matchFee / 1000)}k VND` : '--',
        duration: '--',
        paymentMethod: 'Tiền mặt',
      }
    : null;

  return (
    <div className="driver-dashboard-page">
      <Header variant="auth" userAvatar="https://i.pravatar.cc/150?img=12" />

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <MapView position={position} error={error} zoom={15} recenterKey={recenterKey} hasBottomNav />
      </div>

      {/* Online/Offline Toggle */}
      <div className="dd-top-controls">
        <div className="dd-toggle-container">
          <button className={`dd-toggle-btn ${isOnline ? 'active' : 'inactive'}`} onClick={() => setIsOnline(true)}>
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
        <FAB onClick={() => setRecenterKey((k) => k + 1)} ariaLabel="現在地に戻る" style={{ position: 'static' }} />
      </div>

      {/* Income Card */}
      <div className="dd-income-card">
        <div className="dd-income-header">
          <div>
            <div className="dd-income-title">日次収益</div>
            <div className="dd-income-amount">1,450,000<span className="dd-income-currency">₫</span></div>
          </div>
          <div className="dd-wallet-icon">👝</div>
        </div>

        <div className="dd-chart-container">
          {weeklyData.map((d, i) => (
            <div key={i} className="dd-chart-column">
              <div className={`dd-chart-bar ${d.highlight ? 'highlight' : ''}`} style={{ height: `${d.value}%` }} />
              <div className={`dd-chart-day ${d.highlight ? 'highlight' : ''}`}>{d.day}</div>
            </div>
          ))}
        </div>

        <div className="dd-status-info">
          <span className={`dd-status-indicator ${isOnline ? 'online' : 'offline'}`}></span>
          <span>{isOnline ? '配車リクエスト受付中...' : 'オフライン中'}</span>
        </div>
      </div>

      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Incoming Request Popup */}
      {incomingRequest && popupRequest && (
        <div className="dd-popup-overlay">
          <IncomingRequestPopup
            request={popupRequest}
            onAccept={handleAccept}
            onDecline={handleDecline}
            timeoutSeconds={60}
          />
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
