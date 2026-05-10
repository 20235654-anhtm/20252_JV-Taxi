import { useState } from 'react';
import { MapView } from '../../components/features/MapView';
import { Header } from '../../components/layout/Header';
import { BottomNavBar } from '../../components/layout/BottomNavBar';
import type { NavTab } from '../../components/layout/BottomNavBar';
import { FAB } from '../../components/ui/FAB';
import { useGeolocation } from '../../hooks/useGeolocation';

const PassengerHome = () => {
  const { position, error } = useGeolocation();

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [currentLang, setCurrentLang] = useState<'jp' | 'vn'>('jp');
  const [recenterKey, setRecenterKey] = useState(0);

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

      {/*
        ── FAB: nút re-center ──
        Vị trí: phải góc map, dưới header 32px
        = top: 64px (header) + 32px (gap) = 96px
        right: 16px
        z-index phải cao hơn map (800) nhưng thấp hơn header (1000)
      */}
      <FAB
        onClick={() => setRecenterKey(k => k + 1)}
        ariaLabel="現在地に戻る"
      />

      {/* ── BottomNavBar: điều hướng giữa các tab ── */}
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
