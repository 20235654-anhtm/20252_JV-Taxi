import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/features/MapView';
import { useGeolocation } from '../../hooks/useGeolocation';
import { showToast } from '../../components/ui/Toast';
import { API_BASE_URL } from '../../config/api';
import './DriverInTrip.css';

const DriverInTrip: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { position } = useGeolocation();
  const [isCompleting, setIsCompleting] = useState(false);

  // Active trip states
  const rideId = location.state?.rideId || sessionStorage.getItem('active_ride_id');
  const passengerName = location.state?.passengerName || sessionStorage.getItem('active_passenger_name') || '乗客';
  const passengerAvatar = location.state?.passengerAvatar || sessionStorage.getItem('active_passenger_avatar') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop';

  useEffect(() => {
    if (!rideId) {
      showToast('乗車情報が見つかりませんでした。', 'error');
      navigate('/driver');
    }
  }, [rideId, navigate]);

  const handleChat = () => {
    navigate('/driver/chat', {
      state: {
        rideId,
        passengerName,
        passengerAvatar
      }
    });
  };

  const handleCompleteTrip = async () => {
    if (!rideId) return;
    setIsCompleting(true);
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/rides/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rideId })
      });
      const data = await response.json();
      if (data.success) {
        showToast('乗車が正常に完了しました！', 'success');
        sessionStorage.removeItem('active_ride_id');
        sessionStorage.removeItem('active_passenger_name');
        sessionStorage.removeItem('active_passenger_avatar');
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
    <div className="driver-intrip-page">
      <Header
        variant="driver"
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        title="乗車中"
        hideBrandName={true}
        hideLanguageToggle={true}
      />

      {/* Map Background */}
      <div className="di-map-container">
        <MapView
          position={position}
          zoom={15}
          hasBottomNav={false}
        />
      </div>

      {/* Bottom Panel */}
      <div className="di-bottom-panel">
        <div className="di-panel-handle"></div>

        <div className="di-passenger-card">
          <div className="di-passenger-profile">
            <img 
              src={passengerAvatar} 
              alt="Passenger" 
              className="di-passenger-avatar" 
            />
            <div className="di-passenger-info">
              <div className="di-passenger-name">{passengerName}</div>
              <div className="di-passenger-role">ご乗車中のお客様</div>
            </div>
          </div>
        </div>

        <div className="di-actions">
          <button className="di-btn di-chat-btn" onClick={handleChat}>
            <MessageSquare size={18} />
            メッセージ
          </button>
        </div>

        <button 
          className="di-complete-btn" 
          onClick={handleCompleteTrip}
          disabled={isCompleting}
        >
          <CheckCircle size={18} style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />
          {isCompleting ? '処理中...' : '乗車を完了する'}
        </button>
      </div>
    </div>
  );
};

export default DriverInTrip;
