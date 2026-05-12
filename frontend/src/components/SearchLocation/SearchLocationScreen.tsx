import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import LocationInputGroup from './LocationInputGroup';
import { MapView } from '../features/MapView';
import RecentHistory, { type HistoryItem } from './RecentHistory';
import LocationPermissionPopup from './LocationPermissionPopup';
import { useWatchLocation } from '../../hooks/useWatchLocation';
import { Button } from '../ui/Button';
import { ArrowRight } from 'lucide-react';
import { AuthRequiredSheet } from '../features/AuthRequiredSheet';
import { reverseGeocode, useLocationSuggestions } from '../../hooks/useLocationSuggestions';
import { useBooking } from '../../contexts/BookingContext';
import { useRecentDestinations } from '../../hooks/useRecentDestinations';
import './SearchLocation.css';

// Mock data has been removed and replaced with API call

interface SearchLocationScreenProps {
  isGuest?: boolean;
  initialSearch?: string;
}

const SearchLocationScreen: React.FC<SearchLocationScreenProps> = ({
  isGuest = false,
  initialSearch = ''
}) => {
  const navigate = useNavigate();
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sử dụng Global State thay vì Local State
  const { 
    pickup, setPickup, 
    destination, setDestination, 
    hasAutoFilledPickup, setHasAutoFilledPickup 
  } = useBooking();

  const { suggestions: initialSuggestions } = useLocationSuggestions(initialSearch);
  const location = useWatchLocation();

  // Lấy thông tin user để gọi API lịch sử
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const { recentDestinations, isLoading: isHistoryLoading } = useRecentDestinations(user?.id);

  // 1. Phân giải tọa độ cho initialSearch nếu có (từ trang chủ truyền sang)
  useEffect(() => {
    // Chạy logic này nếu có initialSearch VÀ (chưa có destination HOẶC destination chưa có tọa độ)
    const needsResolution = initialSearch && (!destination || !destination.coords);
    
    if (needsResolution && initialSuggestions && initialSuggestions.length > 0) {
      const first = initialSuggestions[0];
      setDestination({
        address: initialSearch,
        coords: { lat: first.coordinates[1], lng: first.coordinates[0] }
      });
    }
  }, [initialSearch, initialSuggestions, destination, setDestination]);

  // 2. Logic GPS CHỈ chạy 1 lần duy nhất lúc mới vào app
  useEffect(() => {
    const autoFillGPS = async () => {
      // Nếu chưa từng điền GPS VÀ đã có tọa độ
      if (!hasAutoFilledPickup && location.latitude && location.longitude) {
        // Gán chữ hiển thị tạm trong lúc chờ
        setPickup({ address: '位置情報取得中...', coords: null });
        
        // Gọi API lấy địa chỉ chữ
        const address = await reverseGeocode(location.latitude, location.longitude);
        
        // Cập nhật đầy đủ tọa độ & chữ, sau đó bật cờ "đã điền"
        setPickup({
          address: address,
          coords: { lat: location.latitude, lng: location.longitude }
        });
        setHasAutoFilledPickup(true);
      } else if (!hasAutoFilledPickup && location.permissionDenied) {
        setPickup({ address: 'Vị trí bị chặn (Hãy bật GPS)', coords: null });
        setHasAutoFilledPickup(true); // Đánh dấu đã xử lý xong để khỏi lặp lại
      }
    };

    autoFillGPS();
  }, [location.latitude, location.longitude, location.permissionDenied, hasAutoFilledPickup, setPickup, setHasAutoFilledPickup]);

  const handleBackClick = () => {
    // KHÔNG xóa destination/origin nữa để giữ nguyên State khi quay lại
    if (isGuest) {
      navigate('/');
    } else {
      navigate('/passenger');
    }
  };

  const handleDestinationSelect = (item: HistoryItem) => {
    setDestination({
      address: item.name,
      coords: item.coords || null
    });
    setErrorMessage(null); // Xóa lỗi khi chọn hợp lệ
  };

  const handleNext = () => {
    // Xóa thông báo lỗi cũ
    setErrorMessage(null);

    // 1. Kiểm tra xem đã có chữ chưa
    if (!destination?.address.trim()) {
      return;
    }

    // 2. KIỂM TRA TỌA ĐỘ: Bắt buộc phải có tọa độ mới được đi tiếp
    if (!pickup?.coords) {
      setErrorMessage('現在地を正しく選択してください。');
      return;
    }

    if (!destination?.coords) {
      setErrorMessage('目的地を正しく選択してください。');
      return;
    }

    // Nếu qua được các bước trên -> Có tọa độ thật
    if (isGuest) {
      setIsAuthSheetOpen(true);
    } else {
      navigate('/passenger/booking-options');
    }
  };

  return (
    <div className="sl-container">
      <Header isGuest={isGuest} onBackClick={handleBackClick} />

      <div className="sl-content">
        <LocationInputGroup
          origin={pickup?.address || ''}
          onOriginChange={(val, coords) => {
            setPickup({ 
              address: val, 
              coords: coords ? { lat: coords[1], lng: coords[0] } : null 
            });
            setErrorMessage(null); // Xóa lỗi khi người dùng bắt đầu sửa
          }}
          destination={destination?.address || ''}
          onDestinationChange={(val, coords) => {
            setDestination({ 
              address: val, 
              coords: coords ? { lat: coords[1], lng: coords[0] } : null 
            });
            setErrorMessage(null); // Xóa lỗi khi người dùng bắt đầu sửa
          }}
        />

        {/* HIỂN THỊ THÔNG BÁO LỖI NẾU CÓ */}
        {errorMessage && (
          <div className="px-4 py-2 mt-2 mx-4 text-sm font-medium text-red-600 bg-red-50 rounded-md border border-red-200">
            {errorMessage}
          </div>
        )}

        <div className="h-[500px] rounded-[24px] overflow-hidden border border-[rgba(0,109,55,0.1)] shadow-sm relative">
          <MapView
            position={location.latitude && location.longitude ? { lat: location.latitude, lng: location.longitude } : null}
            pickupPosition={pickup?.coords}
            zoom={12}
            showZoomControl={true}
          />
        </div>

        {!isGuest && recentDestinations.length > 0 && (
          <RecentHistory
            history={recentDestinations}
            onSelect={handleDestinationSelect}
          />
        )}
      </div>

      <div className="sl-next-btn-container">
        <Button
          variant="primary"
          fullWidth
          disabled={!destination?.address?.trim()}
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
