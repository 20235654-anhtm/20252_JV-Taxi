import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapView } from '../../components/features/MapView';
import { Header } from '../../components/layout/Header';
import { BottomNavBar } from '../../components/layout/BottomNavBar';
import type { NavTab } from '../../components/layout/BottomNavBar';
import { FAB } from '../../components/ui/FAB';
import { useGeolocation } from '../../hooks/useGeolocation';
import { QuickBookingCard } from '../../components/features/QuickBookingCard';
import { useBooking } from '../../contexts/BookingContext';

const PassengerHome = () => {
  const navigate = useNavigate();
  const { position, error, permissionDenied } = useGeolocation();
  const { destination, setDestination } = useBooking();

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [currentLang, setCurrentLang] = useState<'jp' | 'vn'>('jp');
  const [recenterKey, setRecenterKey] = useState(0);
  
  const [destinationInput, setDestinationInput] = useState(destination?.address || '');

  const handleBookNow = () => {
    if (destinationInput.trim()) {
      setDestination({ address: destinationInput, coords: null });
      navigate('/passenger/search-location', { state: { initialSearch: destinationInput } });
    } else {
      navigate('/passenger/search-location');
    }
  };

  const userAvatar = 'https://i.pravatar.cc/150?img=3';

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Header */}
      <Header
        variant="passenger"
        userAvatar={userAvatar}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />

      {/* Bản đồ - luôn hiển thị, popup phủ lên nếu GPS bị từ chối */}
      <div style={styles.mapWrapper}>
        <MapView
          position={position}
          error={error}
          permissionDenied={permissionDenied}
          zoom={15}
          recenterKey={recenterKey}
          hasBottomNav
          showPickupLabel
        />
      </div>

      {/* Chỉ hiển thị khi có quyền GPS */}
      {!permissionDenied && (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-[400px] gradient-sheet pointer-events-none z-[1010]" />

          <QuickBookingCard
            userName="佐藤"
            destinationValue={destinationInput}
            setDestinationValue={setDestinationInput}
            onBookNow={handleBookNow}
          />

          <FAB
            onClick={() => setRecenterKey(k => k + 1)}
            ariaLabel="現在地に戻る"
          />
        </>
      )}

      {/* BottomNavBar luôn hiển thị */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  // Toàn trang, reference cho các phần tử absolute bên trong
  pageWrapper: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  },
  // Bản đồ trải full màn hình, nằm sau tất cả UI
  mapWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
};

export default PassengerHome;
