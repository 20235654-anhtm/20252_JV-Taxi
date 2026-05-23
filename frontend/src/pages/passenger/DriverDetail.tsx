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

const DriverDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialDriver = location.state?.driver as DriverSummary | undefined;
  const [driver, setDriver] = useState<DriverDetailData | undefined>(initialDriver);
  const [loading, setLoading] = useState<boolean>(!!initialDriver);
  const [error, setError] = useState<string | undefined>();

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

          <div className="dd-contact-row">
            {driver.email && <div className="dd-contact-item">📧 {driver.email}</div>}
            {driver.phone && <div className="dd-contact-item">📞 {driver.phone}</div>}
          </div>

          <div className="dd-badges-row">
            <div className="dd-badge dd-badge-rating">
              <span style={{ color: '#FEA520' }}>★</span> {driver.rating}
            </div>
            <div className="dd-badge dd-badge-lang">
              <span>文<sub>A</sub></span> JLPT N2
            </div>
          </div>

          <div className="dd-vehicle-box">
            <div className="dd-car-icon-box">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#006D37" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                <circle cx="7" cy="17" r="2" />
                <path d="M9 17h6" />
                <circle cx="17" cy="17" r="2" />
              </svg>
            </div>
            <div className="dd-vehicle-info">
              <div className="dd-vehicle-label">車両情報</div>
              <div className="dd-vehicle-text">{driver.vehicleInfor || driver.car}</div>
              {driver.parsedVehicleInfor && Object.keys(driver.parsedVehicleInfor).length > 0 && (
                <div className="dd-vehicle-detail-list">
                  {Object.entries(driver.parsedVehicleInfor).map(([key, value]) => (
                    <div key={key} className="dd-vehicle-detail-item">
                      <strong>{key}:</strong> {String(value)}
                    </div>
                  ))}
                </div>
              )}
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
