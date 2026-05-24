import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/features/MapView';
import { useGeolocation } from '../../hooks/useGeolocation';
import { showToast } from '../../components/ui/Toast';
import './DriverInTrip.css';

const DriverInTrip: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { position } = useGeolocation();

  // Active trip states
  const rideId = location.state?.rideId || sessionStorage.getItem('active_ride_id');
  const passengerName = location.state?.passengerName || sessionStorage.getItem('active_passenger_name') || 'Hành khách';
  const passengerAvatar = location.state?.passengerAvatar || sessionStorage.getItem('active_passenger_avatar') || 'https://api.dicebear.com/7.x/avataaars/svg?seed=passenger';

  useEffect(() => {
    if (!rideId) {
      showToast('Không tìm thấy thông tin chuyến đi.', 'error');
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

  return (
    <div className="driver-intrip-page">
      <Header
        variant="driver"
        showBackButton={false}
        title="Đang trong chuyến đi"
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
              <div className="di-passenger-role">Khách hàng</div>
            </div>
          </div>
        </div>

        <div className="di-actions">
          <button className="di-btn di-chat-btn" onClick={handleChat}>
            <MessageSquare size={18} />
            Nhắn tin
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverInTrip;
