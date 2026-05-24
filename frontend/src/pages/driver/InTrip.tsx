import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/features/MapView';
import { MessageCircle } from 'lucide-react';

const InTrip: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passenger = location.state?.passenger || {
    name: 'Khách hàng',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop'
  };

  const pickup = { lat: 21.0285, lng: 105.8542 };
  const destination = { lat: 21.0028, lng: 105.8427 };

  return (
    <div style={{ width: '100%', height: '100vh', background: '#F4FBF1', display: 'flex', flexDirection: 'column' }}>
      <Header
        variant="driver"
        showBackButton={true}
        title="乗車中 (In Trip)"
        onBackClick={() => navigate(-1)}
        hideBrandName={true}
        hideLanguageToggle={true}
      />
      
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView 
          position={pickup} 
          pickupPosition={pickup} 
          destinationPosition={destination}
          routePadding={[[40, 40], [40, 40]]}
        />
        
        {/* Passenger Info Overlay */}
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyItems: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <img src={passenger.avatar} alt="Passenger" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#171d17', fontWeight: 'bold' }}>{passenger.name}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6d7a6e' }}>Đang di chuyển</p>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/driver/chat', { state: { passenger, rideId: location.state?.rideId } })}
            style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#006D37', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,109,55,0.3)' }}
          >
            <MessageCircle size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InTrip;
