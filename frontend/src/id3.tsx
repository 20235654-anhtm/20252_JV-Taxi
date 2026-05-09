
import './id3.css';

const ID3 = () => {
  return (
    <div className="booking-container">
      {/* HEADER */}
      <div className="flat-header">
        <div className="back-btn">←</div>
        <div className="header-title">予約オプションの選択</div>
      </div>

      {/* MAP AREA */}
      <div className="map-area">
        <div className="map-gradient"></div>
        {/* Markers */}
        <div className="marker pickup" style={{ top: '206px', left: '79px' }}>
          <div className="dot"></div>
          <div className="label">乗車場所</div>
        </div>
        <div className="marker dropoff" style={{ top: '117px', left: '310px' }}>
          <div className="dot dest"></div>
          <div className="label dest">ロイヤルシティ</div>
        </div>
      </div>

      {/* BOTTOM SHEET */}
      <div className="bottom-sheet">
        <div className="drag-handle"></div>
        <h2 className="sheet-title">配車スタイルの選択</h2>

        {/* Option 1 */}
        <div className="option-card active">
          <div className="icon-box green">🚘</div>
          <div className="option-content">
            <div className="info">
              <div className="text">
                <h3>今すぐ配車</h3>
                <p>お急ぎ便・システム割当</p>
              </div>
              <div className="price">
                <span className="amount green">135,000</span>
                <span className="unit">VND</span>
              </div>
            </div>
            <div className="badges">
              <span className="badge-fast">最速</span>
              <span className="time">⏱ 2分</span>
            </div>
          </div>
        </div>

        {/* Option 2 */}
        <div className="option-card">
          <div className="icon-box orange">👨‍✈️</div>
          <div className="option-content">
            <div className="info">
              <div className="text">
                <h3>ドライバー選択</h3>
                <p>近くのドライバーを自分で選ぶ</p>
              </div>
              <div className="price">
                <span className="amount">135k-160k</span>
                <span className="unit">VND</span>
              </div>
            </div>
            <div className="badges">
              <div className="avatars">
                <div className="avt"></div>
                <div className="avt"></div>
                <div className="avt-count">+8</div>
              </div>
              <span className="distance">3km圏内</span>
            </div>
          </div>
        </div>

        {/* Final Button */}
        <button className="confirm-btn">
          次へ進む <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default ID3;