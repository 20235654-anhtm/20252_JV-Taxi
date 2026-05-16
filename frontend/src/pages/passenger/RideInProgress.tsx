import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, MessageSquare, ChevronLeft } from 'lucide-react';
import { MapView } from '../../components/features/MapView';
import { useBooking } from '../../contexts/BookingContext';
import './RideInProgress.css';

const RideInProgress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pickup, destination } = useBooking();

  const driver = location.state?.driver;
  const rideId = location.state?.rideId;

  if (!driver) {
    navigate('/passenger');
    return null;
  }

  const pickupCoords = pickup?.coords ?? null;
  const destCoords = destination?.coords ?? null;

  return (
    <div className="rip-page">
      {/* Header */}
      <div className="rip-header">
        <button className="rip-back-btn" onClick={() => navigate('/passenger')}>
          <ChevronLeft size={22} />
        </button>
        <span className="rip-title">JV – Taxi</span>
        <span className="rip-live-badge">ライブ追跡</span>
      </div>

      {/* Map */}
      <div className="rip-map">
        <MapView
          position={pickupCoords}
          pickupPosition={pickupCoords}
          destinationPosition={destCoords}
          zoom={14}
        />
      </div>

      {/* ETA Card */}
      <div className="rip-eta-card">
        <div className="rip-eta-left">
          <p className="rip-eta-label">到着予定</p>
          <p className="rip-eta-time">8 分</p>
        </div>
        <div className="rip-eta-clock">
          <span>🕐</span>
          <span>{new Date(Date.now() + 8 * 60000).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Driver Info Card */}
      <div className="rip-driver-card">
        <div className="rip-driver-main">
          <div className="rip-avatar-wrapper">
            <img
              src={driver.avatar || 'https://placehold.co/80x80'}
              alt={driver.name}
              className="rip-avatar"
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/80x80'; }}
            />
            <div className="rip-rating-badge">
              <span className="rip-star">★</span>
              {driver.rating ?? '4.9'}
            </div>
          </div>

          <div className="rip-driver-info">
            <h3 className="rip-driver-name">{driver.name}</h3>
            <p className="rip-car-info">{driver.car}</p>
            <p className="rip-verified">認定ドライバー</p>
          </div>

          {/* Action Buttons */}
          <div className="rip-actions">
            <a href={`tel:${driver.phone}`} className="rip-action-btn rip-call">
              <Phone size={20} />
            </a>
            <button
              className="rip-action-btn rip-chat"
              onClick={() => navigate('/passenger/chat', { state: { driver, rideId } })}
            >
              <MessageSquare size={20} />
            </button>
          </div>
        </div>

        <div className="rip-locations">
          <div className="rip-location-row">
            <span className="rip-dot rip-dot-green"></span>
            <div>
              <p className="rip-loc-label">現在地</p>
              <p className="rip-loc-text">{pickup?.address || 'Điểm đón'}</p>
            </div>
          </div>
          <div className="rip-location-row">
            <span className="rip-dot rip-dot-brown"></span>
            <div>
              <p className="rip-loc-label">行き先</p>
              <p className="rip-loc-text">{destination?.address || 'Điểm đến'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideInProgress;
