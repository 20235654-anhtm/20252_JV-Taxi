import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapView } from '../../components/features/MapView';
import { Header } from '../../components/layout/Header';
import { BottomNavBar } from '../../components/layout/BottomNavBar';
import type { NavTab } from '../../components/layout/BottomNavBar';
import { FAB } from '../../components/ui/FAB';
import { useGeolocation } from '../../hooks/useGeolocation';
import { QuickBookingCard } from '../../components/features/QuickBookingCard';

const PassengerHome = () => {
  const navigate = useNavigate();
  const { position, error } = useGeolocation();

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [currentLang, setCurrentLang] = useState<'jp' | 'vn'>('jp');
  const [recenterKey, setRecenterKey] = useState(0);
  const [destination, setDestination] = useState('');

  // Xử lý nút đặt xe
  const handleBookNow = () => {
    if (destination.trim()) {
      // Nếu có nhập text, truyền text qua state
      navigate('/passenger/search-location', { state: { initialSearch: destination } });
    } else {
      // Nếu trống, đi tới màn hình search trống
      navigate('/passenger/search-location');
    }
  };

  // TODO: thay bằng avatar thực từ user profile khi có auth
  const userAvatar = 'https://i.pravatar.cc/150?img=3';

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
  };

  return (
    <div style={styles.pageWrapper}>
      {/* ── Header: variant passenger (logo giữa, avatar trái, JP/VN phải) ── */}
      <Header
        variant="passenger"
        userAvatar={userAvatar}
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
      />

      {/* ── Bản đồ chiếm toàn màn hình ── */}
      <div style={styles.mapWrapper}>
        <MapView
          position={position}
          error={error}
          zoom={15}
          recenterKey={recenterKey}
          hasBottomNav
          showPickupLabel
        />
      </div>

      {/* ── Lớp phủ Gradient phía dưới để làm nền cho Card & Nav ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[400px] gradient-sheet pointer-events-none z-[1010]" />

      {/* ── Quick Booking Card (Tự quản lý vị trí & vuốt lên/xuống) ── */}
      <QuickBookingCard
        userName="佐藤"
        destinationValue={destination}
        setDestinationValue={setDestination}
        onBookNow={handleBookNow}
      />

      {/* ── FAB: Nút re-center (vị trí mặc định top-24 right-4) ── */}
      <FAB
        onClick={() => setRecenterKey(k => k + 1)}
        ariaLabel="現在地に戻る"
      />

      {/* ── BottomNavBar ── */}
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
