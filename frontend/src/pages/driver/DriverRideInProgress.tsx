import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Phone, ChevronLeft } from 'lucide-react';
import { MapView } from '../../components/features/MapView';
import { useGeolocation } from '../../hooks/useGeolocation';
import './DriverRideInProgress.css';

const DriverRideInProgress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { position, error } = useGeolocation();

  const rideId = location.state?.rideId;
  const passenger = location.state?.passenger;
  const startAddress = location.state?.startAddress;
  const endAddress = location.state?.endAddress;

  return (
    <div className="drip-page">
      {/* Header */}
      <div className="drip-header">
        <button className="drip-back-btn" onClick={() => navigate('/driver')}>
          <ChevronLeft size={22} />
        </button>
        <span className="drip-title">Đang đến đón khách</span>
        <span className="drip-live-badge">Live</span>
      </div>

      {/* Map fullscreen */}
      <div className="drip-map">
        <MapView position={position} error={error} zoom={15} />
      </div>

      {/* Passenger Card */}
      <div className="drip-card">
        <div className="drip-passenger-row">
          <div className="drip-avatar">
            <img
              src={`https://i.pravatar.cc/80?u=${passenger?.name}`}
              alt={passenger?.name}
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/60x60'; }}
            />
          </div>
          <div className="drip-info">
            <h3 className="drip-name">{passenger?.name || 'Hành khách'}</h3>
            <p className="drip-address">📍 {startAddress}</p>
            <p className="drip-dest">🏁 {endAddress}</p>
          </div>
          <div className="drip-actions">
            <a href={`tel:${passenger?.phone}`} className="drip-btn drip-call">
              <Phone size={20} />
            </a>
            <button
              className="drip-btn drip-chat"
              onClick={() =>
                navigate('/driver/chat', {
                  state: { passenger, rideId },
                })
              }
            >
              <MessageSquare size={20} />
            </button>
          </div>
        </div>

        <button
          className="drip-arrived-btn"
          onClick={() => navigate('/driver')}
        >
          ✅ Đã đến điểm đón
        </button>
      </div>
    </div>
  );
};

export default DriverRideInProgress;
