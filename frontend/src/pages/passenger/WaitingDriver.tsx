import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserX, ArrowRight } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Heading } from '../../components/ui/Heading';
import { useBooking } from '../../contexts/BookingContext';
import { useSocket } from '../../hooks/useSocket';
import './WaitingDriver.css';

type WaitingStatus = 'waiting' | 'rejected' | 'accepted' | 'expired';

const API_BASE = 'http://localhost:5000/api';

const WaitingDriver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pickup, destination } = useBooking();
  const socketRef = useSocket();

  const driver = location.state?.driver;
  const [status, setStatus] = useState<WaitingStatus>('waiting');
  const [timeLeft, setTimeLeft] = useState(180);
  const [rideId, setRideId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Create ride in DB on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.id || !driver?.id) return;

    const createRide = async () => {
      try {
        const response = await fetch(`${API_BASE}/rides`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            passengerId: user.id,
            driverId: driver.id,
            startAddress: pickup?.address || 'Điểm đón',
            endAddress: destination?.address || 'Điểm đến',
            startLng: pickup?.coords?.lng ?? 0,
            startLat: pickup?.coords?.lat ?? 0,
            endLng: destination?.coords?.lng ?? 0,
            endLat: destination?.coords?.lat ?? 0,
            vehicleTypeRequested: driver.vehicleType,
          }),
        });
        const data = await response.json();
        if (data.success) {
          setRideId(data.data.id);
          // Join ride socket room
          socketRef.current?.emit('join_ride', data.data.id);
        }
      } catch (err) {
        console.error('Failed to create ride:', err);
      }
    };

    createRide();
  }, [driver, pickup, destination, socketRef]);

  // Listen for driver response via socket
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleStatusUpdate = (data: { rideId: string; status: string; driver?: object }) => {
      if (data.status === 'ACCEPTED') {
        clearInterval(timerRef.current!);
        setStatus('accepted');
        // Navigate to ride in progress screen
        setTimeout(() => {
          navigate('/passenger/ride-in-progress', {
            state: { driver: data.driver, rideId: rideId || data.rideId },
          });
        }, 1500);
      } else if (data.status === 'REJECTED') {
        setStatus('rejected');
      }
    };

    socket.on('ride_status_updated', handleStatusUpdate);
    return () => { socket.off('ride_status_updated', handleStatusUpdate); };
  }, [socketRef, rideId, navigate]);

  // Countdown timer
  useEffect(() => {
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
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRetry = () => navigate('/passenger/booking-options');
  const handleGoHome = () => navigate('/passenger');

  return (
    <div className="waiting-driver-page">
      <Header
        variant="passenger"
        showBackButton={status === 'waiting'}
        title="ドライバー選択"
        onBackClick={() => navigate(-1)}
      />

      <div className="wd-content">
        {status === 'waiting' && (
          <>
            <div className="wd-map-circle">
              <img
                src="https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/105.84,21.01,14/240x240?access_token=MAP_TOKEN"
                alt="Map"
                className="wd-map-image"
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/240x240?text=Map'; }}
              />
              <div className="wd-car-icon">🚗</div>
            </div>

            <h2 className="wd-title">ドライバーを探しています</h2>

            <div className="wd-status-badge">
              <span className="wd-status-dot"></span>
              <span>リクエスト送信済み</span>
            </div>

            <p className="wd-message">
              ドライバーの承諾を待っています...<br />
              残り時間: <strong>{formatTime(timeLeft)}</strong>
            </p>

            {driver && (
              <div className="wd-driver-info-card">
                <div className="wd-driver-main-info">
                  <img src={driver.avatar} alt={driver.name} className="wd-driver-avatar" />
                  <div className="wd-driver-details">
                    <h3 className="wd-driver-name">{driver.name}</h3>
                    <p className="wd-driver-car">{driver.car} • {driver.vehicleType}</p>
                  </div>
                  <div className="wd-driver-rating">★ {driver.rating}</div>
                </div>

                <div className="wd-button-group">
                  <button className="wd-cancel-btn" onClick={handleGoHome}>
                    <span>✕ Cancel Request</span>
                    <span className="wd-cancel-sub">リクエストをキャンセル</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {status === 'accepted' && (
          <div className="wd-accepted-overlay">
            <div className="wd-accepted-icon">✅</div>
            <h2 className="wd-accepted-title">Tài xế đã chấp nhận!</h2>
            <p>Đang chuyển sang màn hình theo dõi...</p>
          </div>
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
                <p>申し訳ありませんが、現在ドライバーはリクエストを受け付けることができません。</p>
              </Card>

              <div className="wd-rejected-actions">
                <Button variant="primary" fullWidth icon={ArrowRight} onClick={handleRetry} className="wd-retry-btn">
                  別のドライバーを探す
                </Button>
                <Button variant="secondary" fullWidth onClick={handleGoHome} className="wd-home-btn">
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
