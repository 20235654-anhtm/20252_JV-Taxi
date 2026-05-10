import { useNavigate } from 'react-router-dom';
import { MapView } from '../../components/features/MapView';
import { Header } from '../../components/layout/Header';
import { useGeolocation } from '../../hooks/useGeolocation';

const GuestHome = () => {
  const navigate = useNavigate();
  const { position, error } = useGeolocation();

  return (
    <div style={styles.pageWrapper}>
      {/* Header nổi trên bản đồ */}
      <Header
        variant="guest"
        onLoginClick={() => navigate('/login')}
        onSignupClick={() => navigate('/signup')}
      />

      {/* MapView tự xử lý cả 3 trạng thái: loading / error / success */}
      <div style={styles.mapWrapper}>
        <MapView position={position} error={error} zoom={15} />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageWrapper: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
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
