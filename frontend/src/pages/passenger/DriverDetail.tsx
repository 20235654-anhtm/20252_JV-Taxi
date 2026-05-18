import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import './DriverDetail.css';

const DriverDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const driver = location.state?.driver;

  if (!driver) {
    return (
      <div className="driver-detail-page">
        <Header variant="passenger" showBackButton title="ドライバー詳細" onBackClick={() => navigate(-1)} />
        <div style={{ padding: '40px', textAlign: 'center' }}>ドライバー情報が見つかりません</div>
      </div>
    );
  }

  const handleSelectDriver = () => {
    // Chuyển sang màn hình thanh toán
    navigate('/passenger/booking-confirmation', { state: { driver, mode: 'designated' } });
  };

  // Mock reviews based on image
  const reviews = [
    {
      id: 1,
      name: 'Kenji Sato',
      initial: 'KS',
      rating: 5,
      date: '2日前',
      text: 'タンさんは非常にプロフェッショナルでした。日本語も完璧で、車内もピカピカに清掃されていました。サイゴンで一番快適な乗り心地です。'
    },
    {
      id: 2,
      name: 'Elena Miller',
      initial: 'EM',
      rating: 5,
      date: '1週間前',
      text: 'Great experience! The driver was very polite and arrived exactly on time.'
    }
  ];

  return (
    <div className="driver-detail-page">
      <Header
        variant="passenger"
        showBackButton={true}
        title="ドライバー詳細"
        onBackClick={() => navigate(-1)}
      />

      <div className="dd-content">
        {/* MAIN DRIVER CARD */}
        <div className="dd-main-card">
          <div className="dd-avatar-wrapper">
            <img src={driver.avatar} alt={driver.name} className="dd-avatar" />
            <div className="dd-verified-badge">
              <div className="dd-verified-icon">✓</div>
            </div>
          </div>

          <h2 className="dd-name">{driver.name}</h2>

          <div className="dd-badges-row">
            <div className="dd-badge dd-badge-rating">
              <span style={{ color: '#FEA520' }}>★</span> {driver.rating}
            </div>
            <div className="dd-badge dd-badge-lang">
              <span>文<sub>A</sub></span> JLPT N2
            </div>
          </div>

          <div className="dd-vehicle-box">
            <div className="dd-car-icon-box">🚘</div>
            <div className="dd-vehicle-info">
              <div className="dd-vehicle-label">車両情報</div>
              <div className="dd-vehicle-text">{driver.car}</div>
            </div>
          </div>
        </div>

        {/* RECENT REVIEWS SECTION */}
        <div className="dd-reviews-section">
          <h3 className="dd-reviews-title">最近のレビュー</h3>

          {reviews.map(review => (
            <div key={review.id} className="dd-review-card">
              <div className="dd-review-header">
                <div className="dd-reviewer-info">
                  <div className="dd-reviewer-avatar">{review.initial}</div>
                  <div>
                    <h4 className="dd-reviewer-name">{review.name}</h4>
                    <div className="dd-review-stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ color: i < review.rating ? '#FEA520' : '#DDE5DB' }}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="dd-review-date">{review.date}</span>
              </div>
              <p className="dd-review-text">{review.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FIXED FOOTER WITH BUTTON */}
      <div className="dd-footer">
        <button className="dd-confirm-btn" onClick={handleSelectDriver}>
          <div className="dd-btn-icon">✓</div>
          このドライバーを選択する
        </button>
      </div>
    </div>
  );
};

export default DriverDetail;
