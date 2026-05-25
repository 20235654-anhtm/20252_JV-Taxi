import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { API_BASE_URL } from '../../config/api';
import './DriverDetail.css';

interface DriverSummary {
  id: string;
  name: string;
  car: string;
  vehicleType: string;
  distance: string;
  distanceMeters: number;
  time: string;
  price: string;
  rating: number;
  avatar: string;
}

interface DriverDetailData extends DriverSummary {
  email?: string;
  phone?: string;
  vehicleInfor?: string;
  parsedVehicleInfor?: Record<string, any>;
}

const formatVehicleText = (infoStr: string) => {
  try {
    const parsed = JSON.parse(infoStr);
    const model = parsed.model || '';
    const secondary = parsed.color || parsed.plate || '';
    if (model && secondary) return `${model} • ${secondary}`;
    return model || infoStr;
  } catch (e) {
    return infoStr;
  }
};

const DriverDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialDriver = location.state?.driver as DriverSummary | undefined;
  const passedFare = location.state?.fare;
  const [driver, setDriver] = useState<DriverDetailData | undefined>(initialDriver);
  const [loading, setLoading] = useState<boolean>(!!initialDriver);
  const [error, setError] = useState<string | undefined>();
  const [realReviews, setRealReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!initialDriver?.id) {
      setLoading(false);
      return;
    }

    const fetchDriverDetail = async () => {
      setLoading(true);
      setError(undefined);

      try {
        const response = await fetch(`${API_BASE_URL}/api/drivers/${initialDriver.id}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.message || 'ドライバー情報を取得できませんでした');
          setLoading(false);
          return;
        }

        setDriver(prev => ({
          ...(prev ?? initialDriver),
          email: data.data.email,
          phone: data.data.phone,
          vehicleInfor: data.data.driverProfile?.vehicleInfor || (prev ?? initialDriver).car,
          parsedVehicleInfor: data.data.driverProfile?.parsedVehicleInfor || {},
        }));

        // Fetch reviews
        const reviewRes = await fetch(`${API_BASE_URL}/api/reviews/driver/${initialDriver.id}`);
        const reviewData = await reviewRes.json();
        if (reviewData.success) {
          setRealReviews(reviewData.data);
        }
      } catch (err) {
        console.error('[DriverDetail] fetch error:', err);
        setError('サーバーと通信できませんでした');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverDetail();
  }, [initialDriver?.id]);

  if (loading) {
    return (
      <div className="driver-detail-page">
        <Header variant="passenger" showBackButton title="ドライバー詳細" onBackClick={() => navigate(-1)} hideBrandName={true} hideLanguageToggle={true} />
        <div style={{ padding: '40px', textAlign: 'center' }}>ドライバー情報を読み込み中...</div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="driver-detail-page">
        <Header variant="passenger" showBackButton title="ドライバー詳細" onBackClick={() => navigate(-1)} hideBrandName={true} hideLanguageToggle={true} />
        <div style={{ padding: '40px', textAlign: 'center' }}>ドライバー情報が見つかりません</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="driver-detail-page">
        <Header variant="passenger" showBackButton title="ドライバー詳細" onBackClick={() => navigate(-1)} hideBrandName={true} hideLanguageToggle={true} />
        <div style={{ padding: '40px', textAlign: 'center', color: '#d32f2f' }}>{error}</div>
      </div>
    );
  }

  const handleSelectDriver = () => {
    // Chuyển sang màn hình thanh toán
    navigate('/passenger/booking-confirmation', { state: { driver, mode: 'designated', fare: passedFare } });
  };

  return (
    <div className="driver-detail-page">
      <Header
        variant="passenger"
        showBackButton={true}
        title="ドライバー詳細"
        onBackClick={() => navigate(-1)}
        hideBrandName={true}
        hideLanguageToggle={true}
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
              <span style={{ color: '#006D37' }}>★</span> {driver.rating && !isNaN(Number(driver.rating)) ? Number(driver.rating).toFixed(1) : driver.rating}
            </div>
            <div className="dd-badge dd-badge-lang">
              <span>文<sub>A</sub></span> JLPT N2
            </div>
          </div>

          <div className="dd-vehicle-box">
            <div className="dd-car-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#006D37" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.85 7H17.15L18.22 10.12H5.78L6.85 7ZM19 17H5V12H19V17Z" />
                <circle cx="7.5" cy="14.5" r="1.5" />
                <circle cx="16.5" cy="14.5" r="1.5" />
              </svg>
            </div>
            <div className="dd-vehicle-info">
              <div className="dd-vehicle-label">車両情報</div>
              <div className="dd-vehicle-text">{formatVehicleText(driver.vehicleInfor || driver.car)}</div>
            </div>
          </div>
        </div>

        {/* RECENT REVIEWS SECTION */}
        <div className="dd-reviews-section">
          <h3 className="dd-reviews-title">最近のレビュー</h3>

          {realReviews.map(review => (
            <div key={review.id} className="dd-review-card">
              <div className="dd-review-header">
                <div className="dd-reviewer-info">
                  {review.reviewer?.avatar ? (
                    <img 
                      src={review.reviewer.avatar} 
                      alt={review.reviewer.fullName || 'User'} 
                      className="dd-reviewer-avatar" 
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="dd-reviewer-avatar">
                      {review.reviewer?.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <h4 className="dd-reviewer-name">{review.reviewer?.fullName || 'ユーザー'}</h4>
                    <div className="dd-review-stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ color: i < (review.starReview || 0) ? '#006D37' : '#DDE5DB' }}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="dd-review-date">{new Date(review.createdAt).toLocaleDateString('ja-JP')}</span>
              </div>
              <p className="dd-review-text">{review.commentReview}</p>
            </div>
          ))}
          {realReviews.length === 0 && (
            <p style={{ textAlign: 'center', color: '#8C998E', padding: '20px' }}>レビューはまだありません。</p>
          )}
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
