import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserX, ArrowRight } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Heading } from '../../components/ui/Heading';
import { MapView } from '../../components/features/MapView';
import { useBooking } from '../../contexts/BookingContext';
import { socketService } from '../../services/socketService';
import { API_BASE_URL } from '../../config/api';
import { Avatar } from '../../components/ui/Avatar';
import './WaitingDriver.css';

type WaitingStatus = 'waiting' | 'rejected' | 'accepted' | 'expired';

const getCarModel = (info: string) => {
  try {
    const parsed = JSON.parse(info);
    return parsed.model || info;
  } catch (e) {
    return info;
  }
};

const WaitingDriver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pickup: pickupData, setPickup } = useBooking();
  const [status, setStatus] = useState<WaitingStatus>('waiting');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [driver, setDriver] = useState<any>(location.state?.driver || null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [rideDetails, setRideDetails] = useState<any>(null);
  const statusRef = useRef(status);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Fetch ride details if pickup coordinates are missing to restore them
  useEffect(() => {
    const fetchRideDetails = async () => {
      const rideId = location.state?.rideId || sessionStorage.getItem('active_ride_id');
      if (!rideId) return;
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/rides/${rideId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const res = await response.json();
        if (res.success && res.data) {
          setRideDetails(res.data);
          if (res.data.driver) {
            const mappedDriver = {
              id: res.data.driver.id,
              name: res.data.driver.fullName || '...',
              avatar: res.data.driver.avatar || res.data.driver.driverProfile?.avatarPicture || '',
              rating: res.data.driver.driverProfile?.averageRating ? String(res.data.driver.driverProfile.averageRating) : '...',
              car: res.data.driver.driverProfile?.vehicleInfor || '...',
              vehicleType: res.data.driver.driverProfile?.vehicleType || '...',
              licensePlate: (() => {
                const info = res.data.driver.driverProfile?.vehicleInfor;
                if (!info) return '...';
                try {
                  return JSON.parse(info).plate || '...';
                } catch (e) {
                  return '...';
                }
              })()
            };
            setDriver(mappedDriver);
          }
          if (!pickupData?.coords && res.data.startLat && res.data.startLng) {
            setPickup({
              address: res.data.start_address || res.data.startAddress || '乗車場所',
              coords: { lat: Number(res.data.startLat), lng: Number(res.data.startLng) }
            });
          }
        }
      } catch (err) {
        console.error('Error fetching ride details in WaitingDriver:', err);
      }
    };
    fetchRideDetails();
  }, [location.state?.rideId, pickupData?.coords, setPickup]);

  // If coordinates are missing but we have rideId, show loading while useEffect fetches and restores them
  const rideId = location.state?.rideId || sessionStorage.getItem('active_ride_id');
  if (!pickupData?.coords && rideId) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F4FBF1', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #EFF6EC', borderTopColor: '#006D37', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ color: '#3D4A3F', fontSize: '14px', fontWeight: 'bold' }}>乗車情報を読み込み中...</div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const pickup = pickupData?.coords || { lat: 21.0285, lng: 105.8542 };

  const getCarDisplayName = (carInfo: string | any) => {
    if (!carInfo) return '...';
    if (typeof carInfo === 'string') {
      try {
        const parsed = JSON.parse(carInfo);
        return parsed.model ? `${parsed.model} • ${parsed.plate || ''}` : carInfo;
      } catch (e) {
        return carInfo;
      }
    }
    return carInfo.model ? `${carInfo.model} • ${carInfo.plate || ''}` : '...';
  };

  useEffect(() => {
    // Timer countdown
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Socket.io connection and listeners
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      socketService.connect(user.id);
    }

    socketService.onBookingAccepted((data) => {
      console.log('✅ Booking accepted by driver!', data);
      setStatus('accepted');
    });

    socketService.onBookingRejected((data) => {
      console.log('❌ Booking rejected by driver!', data);
      setStatus('rejected');
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      socketService.offBookingAccepted();
      socketService.offBookingRejected();
    };
  }, []);

  // Redirect to live tracking when accepted
  useEffect(() => {
    if (status === 'accepted') {
      const activeRideId = location.state?.rideId || '';
      if (activeRideId) {
        sessionStorage.setItem('active_ride_id', activeRideId);
      }
      if (driver) {
        sessionStorage.setItem('active_driver', JSON.stringify(driver));
      }
      const timer = setTimeout(() => {
        navigate('/passenger/waiting-driver-pickup', {
          state: {
            driver,
            rideId: location.state?.rideId || activeRideId
          }
        });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [status, navigate, driver, location.state?.rideId, location.state?.mode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => {
    navigate('/passenger/booking-options');
  };

  const handleCancelRide = async () => {
    try {
      const activeRideId = location.state?.rideId || sessionStorage.getItem('active_ride_id');
      if (activeRideId) {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        await fetch(`${API_BASE_URL}/api/rides/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ rideId: activeRideId })
        });
        sessionStorage.removeItem('active_ride_id');
        sessionStorage.removeItem('active_driver');
        sessionStorage.removeItem('active_fare');
      }
    } catch (e) {
      console.error('Error cancelling ride:', e);
    }
  };

  const handleBack = async () => {
    await handleCancelRide();
    navigate(-1);
  };

  const handleGoHome = async () => {
    await handleCancelRide();
    navigate('/passenger');
  };

  useEffect(() => {
    const handlePopState = () => {
      if (statusRef.current === 'waiting') {
        handleCancelRide();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div className="waiting-driver-page">
      <Header
        variant="passenger"
        showBackButton={status === 'waiting'}
        title="ドライバー選択"
        onBackClick={handleBack}
        hideBrandName={true}
        hideLanguageToggle={true}
      />

      <div className="wd-content">
        {status === 'accepted' && (
          <div className="wd-accepted-state" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center',
            margin: 'auto 0',
            width: '100%'
          }}>
            <div className="wd-success-icon-box" style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#006D37', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 8px 24px rgba(0, 109, 55, 0.2)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="wd-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0b1f0f', margin: '0 0 8px 0' }}>予約が確定しました！</h2>
            <p className="wd-status-text" style={{ color: '#006D37', fontWeight: 700, margin: '0 0 16px 0' }}>ドライバーがリクエストを承諾しました</p>
            <p className="wd-message" style={{ color: '#5c6c5f', fontSize: '0.95rem' }}>追跡画面に移行しています...</p>
          </div>
        )}

        {status === 'waiting' && (
          <>
            <div className="wd-map-circle">
              <div className="wd-map-container">
                <MapView
                  position={pickup}
                  interactive={false}
                  showZoomControl={false}
                  zoom={15}
                />
              </div>
              <div className="wd-car-icon-wrapper">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.85 7H17.15L18.22 10.12H5.78L6.85 7ZM19 17H5V12H19V17Z" />
                  <circle cx="7.5" cy="14.5" r="1.5" />
                  <circle cx="16.5" cy="14.5" r="1.5" />
                </svg>
              </div>
            </div>

            <h2 className="wd-title">ドライバーを探しています</h2>

            <div className="wd-status-text">
              <span className="wd-status-dot"></span>
              <span>リクエスト送信済み</span>
            </div>

            <p className="wd-message">
              ドライバーの承諾を待っています...
            </p>

            {driver && (
              <div className="wd-driver-info-card">
                <div className="wd-driver-main-info">
                  <Avatar src={driver.avatar} name={driver.name} className="wd-driver-avatar" borderColor="none" />
                  <div className="wd-driver-details">
                    <h3 className="wd-driver-name">{driver.name}</h3>
                    <p className="wd-driver-car">{getCarModel(driver.car)} • {driver.vehicleType}</p>
                  </div>
                  <div className="wd-driver-rating">★ {driver.rating && driver.rating !== '...' && !isNaN(Number(driver.rating)) ? Number(driver.rating).toFixed(1) : driver.rating}</div>
                </div>

                <div className="wd-button-group">
                  <button className="wd-cancel-btn" onClick={handleGoHome}>
                    <span className="wd-cancel-main">✕ Cancel Request</span>
                    <span className="wd-cancel-sub">リクエストをキャンセル</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {(status === 'rejected' || status === 'expired') && (
          <div className="wd-rejected-overlay">
            <Card className="wd-rejected-popup" rounded="2xl" padding="lg">
              <div className="wd-rejected-icon-box">
                <UserX size={48} className="text-[#A4394E]" />
              </div>

              <Heading level={1} className="wd-rejected-title">
                リクエストが{status === 'rejected' ? '拒否されました' : '期限切れになりました'}
              </Heading>

              <Card className="wd-explanation-box" variant="default" padding="md" rounded="md">
                <p>
                  申し訳ありませんが、現在ドライバー là リクエスト を受け付けることができません。
                </p>
              </Card>

              <p className="wd-rejected-subtitle">
                別のドライバーを選択するか、自動マッチングサービスをご利用ください。
              </p>

              <div className="wd-rejected-actions">
                <Button
                  variant="primary"
                  fullWidth
                  icon={ArrowRight}
                  onClick={handleRetry}
                  className="wd-retry-btn"
                >
                  別のドライバーを探す
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleGoHome}
                  className="wd-home-btn"
                >
                  ホームへ戻る
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingDriver;
