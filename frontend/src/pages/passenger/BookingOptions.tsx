import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { CarFront, User, Search } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/features/MapView';
import { useBooking } from '../../contexts/BookingContext';
import { API_BASE_URL } from '../../config/api';
import { showToast } from '../../components/ui/Toast';
import { Avatar } from '../../components/ui/Avatar';
import './BookingOptions.css';

const CarIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.85 7H17.15L18.22 10.12H5.78L6.85 7ZM19 17H5V12H19V17Z" />
    <circle cx="7.5" cy="14.5" r="1.5" />
    <circle cx="16.5" cy="14.5" r="1.5" />
  </svg>
);

const SearchIcon = ({ size = 24, color = '#7A5B1E' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="6" r="3.5" stroke={color} strokeWidth="2.0" />
    <path d="M3 18C3 15.5 5.5 13.5 8.5 13.5" stroke={color} strokeWidth="2.0" strokeLinecap="round" />
    <circle cx="16" cy="15" r="4.5" stroke={color} strokeWidth="2.0" />
    <path d="M19.5 18.5L23 22" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const BookingOptions = () => {
  const navigate = useNavigate();
  const { pickup: pickupData, destination: destData } = useBooking();
  const [selectedOption, setSelectedOption] = useState<'auto' | 'designated'>('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);
  const [fareAmount, setFareAmount] = useState<number | null>(null);

  // Bảo vệ an toàn
  const hasCoords = !!(pickupData?.coords && destData?.coords);

  useEffect(() => {
    const coords = pickupData?.coords;
    if (!coords) return;
    const fetchNearby = async () => {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        const response = await fetch(
          `${API_BASE_URL}/api/drivers/nearby?lng=${coords.lng}&lat=${coords.lat}&radius=3000`,
          {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          }
        );
        const data = await response.json();
        if (data.success && data.data) {
          setNearbyDrivers(data.data);
        }
      } catch (error) {
        console.error('Error fetching nearby drivers', error);
      }
    };
    fetchNearby();
  }, [hasCoords, pickupData?.coords?.lng, pickupData?.coords?.lat]);

  useEffect(() => {
    const pCoords = pickupData?.coords;
    const dCoords = destData?.coords;
    if (!pCoords || !dCoords) return;
    const fetchFare = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/fare/estimate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startLng: pCoords.lng,
            startLat: pCoords.lat,
            endLng: dCoords.lng,
            endLat: dCoords.lat,
            vehicleType: 'CAR_4_SEATER',
          }),
        });
        const data = await response.json();
        if (data.success && data.data) {
          setFareAmount(data.data.fare.totalFare);
        }
      } catch (error) {
        console.error('Error fetching fare estimation', error);
      }
    };
    fetchFare();
  }, [hasCoords, pickupData?.coords?.lng, pickupData?.coords?.lat, destData?.coords?.lng, destData?.coords?.lat]);

  if (!pickupData?.coords || !destData?.coords) {
    return <Navigate to="/passenger/search-location" replace />;
  }

  const pickup = pickupData.coords; 
  const destination = destData.coords;

  const handleNext = async () => {
    if (selectedOption === 'designated') {
      navigate('/passenger/select-driver', {
        state: {
          fare: fareAmount !== null ? fareAmount + 15000 : '...'
        }
      });
    } else {
      // Chế độ tự động
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/drivers/nearby?lng=${pickup.lng}&lat=${pickup.lat}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          const nearestDriver = data.data[0];
          navigate('/passenger/booking-confirmation', { 
            state: { 
              mode: 'auto', 
              driver: nearestDriver,
              fare: fareAmount !== null ? fareAmount : '...'
            } 
          });
        } else {
          showToast('周辺にドライバーが見つかりませんでした。', 'error');
        }
      } catch (error) {
        console.error('Error finding nearest driver', error);
        showToast('エラーが発生しました。', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="booking-container">
      <Header
        variant="passenger"
        showBackButton={true}
        title="予約オプションの選択"
        onBackClick={() => navigate(-1)}
        hideBrandName={true}
        hideLanguageToggle={true}
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
          <div className="bo-icon-box bo-green">
            <CarIcon color="#006D37" />
          </div>
          <div className="bo-option-content">
            <div className="bo-info">
              <div className="bo-text">
                <h3>今すぐ配車</h3>
                <p>お急ぎ便・システム割当</p>
              </div>
              <div className="bo-price">
                <span className="bo-amount bo-green">
                  {fareAmount !== null ? fareAmount.toLocaleString() : '...'}
                </span>
                <span className="bo-unit">VND</span>
              </div>
            </div>
            <div className="bo-badges">
              <span className="bo-badge-fast">最速</span>
              <span className="bo-time">
                ⏱ {nearbyDrivers.length > 0 
                  ? (nearbyDrivers[0].time ? nearbyDrivers[0].time.replace(' min', '分') : '...') 
                  : '...'}
              </span>
            </div>
          </div>
        </div>

        {/* Option 2: ドライバー指名 */}
        <div 
          className={`bo-option-card ${selectedOption === 'designated' ? 'bo-active' : ''}`}
          onClick={() => setSelectedOption('designated')}
        >
          <div className="bo-icon-box bo-beige">
            <SearchIcon color="#7A5B1E" />
          </div>
          <div className="bo-option-content">
            <div className="bo-info">
              <div className="bo-text">
                <h3>ドライバー選択</h3>
                <p>近くのドライバーを自分で選ぶ</p>
              </div>
              <div className="bo-price">
                <span className="bo-amount" style={{ color: '#7A5B1E' }} >
                  {fareAmount !== null ? (fareAmount + 15000).toLocaleString() : '...'}
                </span>
                <span className="bo-unit">VND</span>
              </div>
            </div>
            <div className="bo-badges">
              <div className="bo-avatars">
                {nearbyDrivers.slice(0, 2).map((driver, index) => (
                  <Avatar 
                    key={driver.id || index} 
                    src={driver.avatar} 
                    name={driver.name} 
                    className="bo-avt text-[8px] flex items-center justify-center" 
                    borderColor="none"
                  />
                ))}
                {nearbyDrivers.length > 2 && (
                  <div className="bo-avt-count">+{nearbyDrivers.length - 2}</div>
                )}
              </div>
              <span className="bo-distance">3km圏内</span>
            </div>
          </div>
        </div>

        <button className="bo-confirm-btn" onClick={handleNext} disabled={isLoading}>
          {isLoading ? '検索中...' : '次へ進む'} <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default BookingOptions;
