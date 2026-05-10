import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import LocationInputGroup from './LocationInputGroup';
import StaticMapPreview from './StaticMapPreview';
import RecentHistory, { type HistoryItem } from './RecentHistory';
import LocationPermissionPopup from './LocationPermissionPopup';
import { useWatchLocation } from '../../hooks/useWatchLocation';
import { Button } from '../ui/Button';
import { ArrowRight } from 'lucide-react';
import { AuthRequiredSheet } from '../features/AuthRequiredSheet';
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
  initialSearch?: string;
}

const SearchLocationScreen: React.FC<SearchLocationScreenProps> = ({ 
  isGuest = false,
  initialSearch = '' 
}) => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState(initialSearch);
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);
  
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
      if (isGuest) {
        setIsAuthSheetOpen(true);
      } else {
        navigate('/passenger/booking-options');
        console.log('Proceed to next with destination:', destination);
      }
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
        <Button 
          variant="primary" 
          fullWidth
          disabled={!destination.trim()}
          onClick={handleNext}
          className="sl-next-btn"
          icon={ArrowRight}
          iconPosition="right"
        >
          次へ進む
        </Button>
      </div>

      <LocationPermissionPopup isOpen={location.permissionDenied} />
      
      <AuthRequiredSheet 
        isOpen={isAuthSheetOpen} 
        onClose={() => setIsAuthSheetOpen(false)} 
      />
    </div>
  );
};

export default SearchLocationScreen;
