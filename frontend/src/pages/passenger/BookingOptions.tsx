import { useNavigate, Navigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/features/MapView';
import { useBooking } from '../../contexts/BookingContext';
import './BookingOptions.css';

const BookingOptions = () => {
  const navigate = useNavigate();
  const { pickup: pickupData, destination: destData } = useBooking();

  // Bảo vệ an toàn: Nếu không có tọa độ (do gõ URL trực tiếp hoặc lỗi state), bắt buộc quay lại trang tìm kiếm
  if (!pickupData?.coords || !destData?.coords) {
    return <Navigate to="/passenger/search-location" replace />;
  }

  const pickup = pickupData.coords; 
  const destination = destData.coords;

  const handleNext = () => {
    navigate('/passenger/select-driver');
  };


  return (
    <div className="booking-container">
      <Header
        variant="passenger"
        showBackButton={true}
        title="予約オプション"
        onBackClick={() => navigate(-1)}
      />

      {/* MAP AREA - Hiển thị bản đồ thật */}
      <div className="bo-map-area">
        <MapView 
          position={pickup} 
          pickupPosition={pickup} 
          destinationPosition={destination}
          routePadding={[[40, 120], [40, 180]]} // Cân đối lại: trên 120px, dưới 300px
        />
      </div>

      {/* BOTTOM SHEET */}
      <div className="bo-bottom-sheet">
        <div className="bo-drag-handle"></div>
        <h2 className="bo-sheet-title">配車スタイルの選択</h2>

        {/* Option 1 */}
        <div className="bo-option-card bo-active">
          <div className="bo-icon-box bo-green">🚘</div>
          <div className="bo-option-content">
            <div className="bo-info">
              <div className="bo-text">
                <h3>今すぐ配車</h3>
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

        {/* Option 2 */}
        <div className="bo-option-card">
          <div className="bo-icon-box bo-orange">👨‍✈️</div>
          <div className="bo-option-content">
            <div className="bo-info">
              <div className="bo-text">
                <h3>ドライバー選択</h3>
                <p>近くのドライバーを自分で選ぶ</p>
              </div>
              <div className="bo-price">
                <span className="bo-amount">135k-160k</span>
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

        {/* Final Button */}
        <button className="bo-confirm-btn" onClick={handleNext}>
          次へ進む <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default BookingOptions;
