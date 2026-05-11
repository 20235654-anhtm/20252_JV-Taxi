import React, { useState, useEffect } from 'react';
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
import { reverseGeocode, useLocationSuggestions } from '../../hooks/useLocationSuggestions';
import './SearchLocation.css';

// Mock data for recent history
const mockHistory: HistoryItem[] = [
  {
    id: '1',
    name: 'Royal City',
    address: '72A Nguyễn Trãi, Thượng Đình, Thanh Xuân, Hà Nội',
    coords: { lat: 21.0028, lng: 105.8152 }
  },
  {
    id: '2',
    name: 'Lotte Center',
    address: '54 Liễu Giai, Cống Vị, Ba Đình, Hà Nội',
    coords: { lat: 21.0313, lng: 105.8152 }
  },
  {
    id: '3',
    name: 'Hanoi Opera House',
    address: '1 Tràng Tiền, Phan Chu Trinh, Hoàn Kiếm, Hà Nội',
    coords: { lat: 21.0242, lng: 105.8584 }
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
  const [destCoords, setDestCoords] = useState<{lat: number, lng: number} | null>(null);
  const [pickupCoords, setPickupCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);

  const [origin, setOrigin] = useState('位置情報取得中...');

  // Hook lấy gợi ý tự động cho initialSearch để lấy tọa độ ban đầu
  const { suggestions: initialSuggestions } = useLocationSuggestions(initialSearch);

  // Use custom hook to watch location
  const location = useWatchLocation();

  // Tự động phân giải tọa độ cho initialSearch nếu chưa có destCoords
  useEffect(() => {
    if (initialSearch && !destCoords && initialSuggestions && initialSuggestions.length > 0) {
      const first = initialSuggestions[0];
      setDestCoords({ lat: first.coordinates[1], lng: first.coordinates[0] });
    }
  }, [initialSearch, initialSuggestions, destCoords]);

  // Cập nhật pickupCoords khi có GPS lần đầu
  useEffect(() => {
    if (location.latitude && location.longitude && !pickupCoords) {
      setPickupCoords({ lat: location.latitude, lng: location.longitude });
    }
  }, [location.latitude, location.longitude, pickupCoords]);

  // Tự động lấy địa chỉ hiện tại khi có tọa độ GPS
  useEffect(() => {
    const updateCurrentLocation = async () => {
      if (location.latitude && location.longitude && origin === '位置情報取得中...') {
        const address = await reverseGeocode(location.latitude, location.longitude);
        setOrigin(address);
      } else if (location.permissionDenied) {
        setOrigin('Vị trí bị chặn (Hãy bật GPS)');
      }
    };

    updateCurrentLocation();
  }, [location.latitude, location.longitude, location.permissionDenied, origin]);

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
    if (item.coords) {
      setDestCoords(item.coords);
    }
  };

  const handleNext = () => {
    if (destination.trim()) {
      if (isGuest) {
        setIsAuthSheetOpen(true);
      } else {
        // Truyền tọa độ thật sang trang tiếp theo
        navigate('/passenger/booking-options', {
          state: {
            pickup: pickupCoords || { lat: location.latitude, lng: location.longitude },
            destination: destCoords || { lat: 21.0313, lng: 105.8152 }
          }
        });
      }
    }
  };

  return (
    <div className="sl-container">
      <Header isGuest={isGuest} onBackClick={handleBackClick} />

      <div className="sl-content">
        <LocationInputGroup
          origin={origin}
          onOriginChange={(val, coords) => {
            setOrigin(val);
            if (coords) {
              setPickupCoords({ lat: coords[1], lng: coords[0] });
            }
          }}
          destination={destination}
          onDestinationChange={(val, coords) => {
            setDestination(val);
            if (coords) {
              setDestCoords({ lat: coords[1], lng: coords[0] }); // OSRM/Photon dùng [lng, lat]
            }
          }}
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
