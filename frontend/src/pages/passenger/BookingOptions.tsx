import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import './BookingOptions.css';

const BookingOptions = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    // Navigate to select driver screen
    navigate('/passenger/select-driver');
  };

  return (
    <div className="booking-container">
      <Header
        variant="passenger"
        showBackButton={true}
        title="予約オプションの選択"
        onBackClick={() => navigate(-1)}
      />

      {/* MAP AREA */}
      <div className="bo-map-area">
        <div className="bo-map-gradient"></div>
        {/* Markers */}
        <div className="bo-marker bo-pickup" style={{ top: '206px', left: '79px' }}>
          <div className="bo-dot"></div>
          <div className="bo-label">乗車場所</div>
        </div>
        <div className="bo-marker bo-dropoff" style={{ top: '117px', left: '310px' }}>
          <div className="bo-dot bo-dest"></div>
          <div className="bo-label bo-dest">ロイヤルシティ</div>
        </div>
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
