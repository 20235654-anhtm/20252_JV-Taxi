import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/features/MapView';
import { useBooking } from '../../contexts/BookingContext';
import './BookingOptions.css';

const BookingOptions = () => {
  const navigate = useNavigate();
  const { pickup: pickupData, destination: destData } = useBooking();
  const [selectedOption, setSelectedOption] = useState<'auto' | 'designated'>('auto');

  // Bảo vệ an toàn
  if (!pickupData?.coords || !destData?.coords) {
    return <Navigate to="/passenger/search-location" replace />;
  }

  const pickup = pickupData.coords; 
  const destination = destData.coords;

  const handleNext = () => {
    if (selectedOption === 'designated') {
      navigate('/passenger/select-driver');
    } else {
      // Chế độ tự động
      navigate('/passenger/waiting-driver', { state: { mode: 'auto' } });
    }
  };

  return (
    <div className="booking-container">
      <Header
        variant="passenger"
        showBackButton={true}
        title="予約オプション"
        onBackClick={() => navigate(-1)}
      />

      <div className="bo-map-area">
        <MapView 
          position={pickup} 
          pickupPosition={pickup} 
          destinationPosition={destination}
          routePadding={[[40, 120], [40, 180]]}
        />
      </div>

      <div className="bo-bottom-sheet">
        <div className="bo-drag-handle"></div>
        <h2 className="bo-sheet-title">配車スタイルの選択</h2>

        {/* Option 1: 自動マッチング */}
        <div 
          className={`bo-option-card ${selectedOption === 'auto' ? 'bo-active' : ''}`}
          onClick={() => setSelectedOption('auto')}
        >
          <div className="bo-icon-box bo-green">🚘</div>
          <div className="bo-option-content">
            <div className="bo-info">
              <div className="bo-text">
                <h3>自動マッチング（無料）</h3>
                <p>お急ぎ便・システム割当</p>
              </div>
              <div className="bo-price">
                <span className="bo-amount bo-green">135,000</span>
                <span className="bo-unit">VND</span>
              </div>
            </div>
            <div className="bo-badges">
              <span className="bo-badge-fast">最速</span>
              <span className="bo-time">⏱ 2分</span>
            </div>
          </div>
        </div>

        {/* Option 2: ドライバー指名 */}
        <div 
          className={`bo-option-card ${selectedOption === 'designated' ? 'bo-active' : ''}`}
          onClick={() => setSelectedOption('designated')}
        >
          <div className="bo-icon-box bo-orange">👨‍✈️</div>
          <div className="bo-option-content">
            <div className="bo-info">
              <div className="bo-text">
                <h3>ドライバー指名（+15,000VND）</h3>
                <p>近くのドライバーを自分で選ぶ</p>
              </div>
              <div className="bo-price">
                <span className="bo-amount">150,000</span>
                <span className="bo-unit">VND</span>
              </div>
            </div>
            <div className="bo-badges">
              <div className="bo-avatars">
                <div className="bo-avt"></div>
                <div className="bo-avt"></div>
                <div className="bo-avt-count">+8</div>
              </div>
              <span className="bo-distance">3km圏内</span>
            </div>
          </div>
        </div>

        <button className="bo-confirm-btn" onClick={handleNext}>
          次へ進む <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default BookingOptions;
