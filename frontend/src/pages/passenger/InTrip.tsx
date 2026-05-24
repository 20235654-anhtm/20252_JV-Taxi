import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/features/MapView';
import { useGeolocation } from '../../hooks/useGeolocation';
import { Avatar } from '../../components/ui/Avatar';
import { Heading } from '../../components/ui/Heading';
import { Text } from '../../components/ui/Text';
import { socketService } from '../../services/socketService';
import { showToast } from '../../components/ui/Toast';
import './InTrip.css';

const InTrip: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve active ride ID & driver info from location.state or sessionStorage fallback
  const rideId = location.state?.rideId || sessionStorage.getItem('active_ride_id') || '';
  const storedDriverStr = sessionStorage.getItem('active_driver');
  const driver = location.state?.driver || (storedDriverStr ? JSON.parse(storedDriverStr) : {
    name: 'ドライバー',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=driver',
    rating: '5.0',
    car: 'Toyota Camry • 29A-888.88',
    vehicleType: 'Sedan'
  });

  const { position } = useGeolocation();

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

    // Listen for ride-completed event from backend
    socketService.onRideCompleted((data) => {
      console.log('🏁 Ride completed successfully!', data);
      showToast('目的地に到着しました。ご利用ありがとうございました。', 'success');
      
      // Clear active ride session
      sessionStorage.removeItem('active_ride_id');
      sessionStorage.removeItem('active_driver');
      
      // Redirect to rating page
      navigate('/passenger/rate-trip');
    });

    return () => {
      socketService.offRideCompleted();
    };
  }, [rideId, navigate]);

  const handleChat = () => {
    sessionStorage.setItem('active_ride_id', rideId);
    sessionStorage.setItem('active_driver', JSON.stringify(driver));
    navigate('/passenger/chat', {
      state: {
        driver,
        rideId
      }
    });
  };

  return (
    <div className="in-trip-container">
      <Header
        variant="passenger"
        showBackButton={true}
        onBackClick={() => navigate(-1)}
        title="乗車中"
        hideBrandName={true}
        hideLanguageToggle={true}
      />

      {/* Interactive Map */}
      <div className="it-map-wrapper">
        <MapView
          position={position}
          zoom={16}
          interactive={true}
          showZoomControl={false}
          hasBottomNav={false}
        />
      </div>

      {/* Bottom Panel containing Driver & Trip status */}
      <div className="it-bottom-panel">
        <div className="it-panel-handle"></div>

        {/* Driver Details Card */}
        <div className="it-driver-card">
          <div className="it-driver-profile">
            <Avatar 
              src={driver.avatar} 
              className="!w-[56px] !h-[56px]"
              borderColor="transparent"
            />
            <div className="it-driver-text">
              <Heading level={3} className="!text-[16px] !font-bold !text-[#0B1F0F]">
                {driver.name}
              </Heading>
              <Text variant="small" className="!text-[#5C6C5F] !font-medium">
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
                })()}
              </Text>
            </div>
            <div className="it-driver-rating">
              <span>★ {driver.rating}</span>
            </div>
          </div>
        </div>

        {/* Action Button Group */}
        <div className="it-actions">
          <button 
            className="it-chat-btn"
            onClick={handleChat}
          >
            <MessageSquare size={18} style={{ marginRight: '8px' }} />
            メッセージ
          </button>
        </div>
      </div>
    </div>
  );
};

export default InTrip;
