import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapView } from '../../components/features/MapView';
import { Header } from '../../components/layout/Header';
import { FAB } from '../../components/ui/FAB';
import { useGeolocation } from '../../hooks/useGeolocation';
import { QuickBookingCard } from '../../components/features/QuickBookingCard';

const GuestHome = () => {
  const navigate = useNavigate();
  const { position, error } = useGeolocation();
  
  const [recenterKey, setRecenterKey] = useState(0);
  const [destination, setDestination] = useState('');

  // Xử lý nút đặt xe
  const handleBookNow = () => {
    if (destination.trim()) {
      // Chế độ Guest đi tới màn hình search của Guest
      navigate('/guest/search-location', { state: { initialSearch: destination } });
    } else {
      navigate('/guest/search-location');
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Header: Chế độ Guest (Đã đăng nhập là false) */}
      <Header
        variant="guest"
        onLoginClick={() => navigate('/login')}
        onSignupClick={() => navigate('/signup')}
      />

      {/* MapView */}
      <div style={styles.mapWrapper}>
        <MapView
          position={position}
          error={error}
          zoom={15}
          recenterKey={recenterKey}
          showPickupLabel
        />
      </div>

      {/* Lớp phủ Gradient phía dưới */}
      <div className="absolute bottom-0 left-0 right-0 h-[400px] gradient-sheet pointer-events-none z-[1010]" />

      {/* Quick Booking Card (Chế độ Guest: isGuest={true}) */}
      <QuickBookingCard
        isGuest={true}
        destinationValue={destination}
        setDestinationValue={setDestination}
        onBookNow={handleBookNow}
      />

      {/* FAB: Nút re-center */}
      <FAB
        onClick={() => setRecenterKey(k => k + 1)}
        ariaLabel="現在地に戻る"
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageWrapper: {
    position: 'relative',
    width: '100%',
    height: '100svh',
    overflow: 'hidden',
  },
  mapWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
};

export default GuestHome;
