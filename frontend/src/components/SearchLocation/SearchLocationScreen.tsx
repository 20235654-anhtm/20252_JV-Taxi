import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import LocationInputGroup from './LocationInputGroup';
import StaticMapPreview from './StaticMapPreview';
import RecentHistory, { type HistoryItem } from './RecentHistory';
import LocationPermissionPopup from './LocationPermissionPopup';
import { useWatchLocation } from '../../hooks/useWatchLocation';
import './SearchLocation.css';

// Mock data for recent history
const mockHistory: HistoryItem[] = [
  {
    id: '1',
    name: 'ロイヤルシティ',
    address: 'ハノイ市、タンスアン区、タンスアン坊、グエンチャイ通り72番'
  },
  {
    id: '2',
    name: 'ビンコムセンター・ファムゴックタック',
    address: 'ハノイ市、ドンダー区、キムリエン坊、ファムゴックタック通り2番地'
  },
  {
    id: '3',
    name: '国立映画センター',
    address: 'ハノイ市、ドンダー区、オチョズア坊、ランハ通り87番地'
  }
];

interface SearchLocationScreenProps {
  isGuest?: boolean;
}

const SearchLocationScreen: React.FC<SearchLocationScreenProps> = ({ isGuest = false }) => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  
  const [origin, setOrigin] = useState('');
  
  // Use custom hook to watch location
  const location = useWatchLocation();
  
  const hasInitializedOrigin = React.useRef(false);
  
  React.useEffect(() => {
    if (hasInitializedOrigin.current) return;

    if (location.latitude && location.longitude) {
      setOrigin('ハノイ工科大学'); // Mocked address from GPS
      hasInitializedOrigin.current = true;
    } else if (location.error && !location.permissionDenied) {
      setOrigin('位置情報を取得できません');
      hasInitializedOrigin.current = true;
    }
  }, [location.latitude, location.longitude, location.error, location.permissionDenied]);

  const handleBackClick = () => {
    setDestination(''); // Hủy nội dung đang nhập
    setOrigin('');

    if (isGuest) {
      navigate('/'); // Về trang chủ Guest
    } else {
      navigate('/passenger'); // Về trang chủ Passenger
    }
  };

  const handleDestinationSelect = (item: HistoryItem) => {
    setDestination(item.name);
    // Auto navigate to confirm route screen as required
    // setTimeout(() => navigate('/confirm-route'), 300);
  };

  const handleNext = () => {
    if (destination.trim()) {
      navigate('/passenger/booking-options');
      console.log('Proceed to next with destination:', destination);
    }
  };

  return (
    <div className="sl-container">
      <Header isGuest={isGuest} onBackClick={handleBackClick} />
      
      <div className="sl-content">
        <LocationInputGroup 
          origin={origin}
          onOriginChange={setOrigin} 
          destination={destination}
          onDestinationChange={setDestination}
        />
        
        <StaticMapPreview 
          latitude={location.latitude} 
          longitude={location.longitude} 
          loading={location.loading} 
        />
        
        {!isGuest && (
          <RecentHistory 
            history={mockHistory} 
            onSelect={handleDestinationSelect} 
          />
        )}
      </div>

      <div className="sl-next-btn-container">
        <button 
          className="sl-next-btn" 
          disabled={!destination.trim()}
          onClick={handleNext}
        >
          次へ進む
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>

      <LocationPermissionPopup isOpen={location.permissionDenied} />
    </div>
  );
};

export default SearchLocationScreen;
