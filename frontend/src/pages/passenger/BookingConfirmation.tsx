import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/features/MapView';
import { Banknote, CreditCard, Check, MapPin, Flag, Send, XCircle } from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { paymentService } from '../../services/paymentService';
import { API_BASE_URL } from '../../config/api';
import './BookingConfirmation.css';

const getCarModel = (info: string) => {
  try {
    const parsed = JSON.parse(info);
    return parsed.model || info;
  } catch (e) {
    return info;
  }
};

const BookingConfirmation = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  const { pickup: pickupData, destination: destData } = useBooking();
  const passedDriver = location.state?.driver;
  
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

  const driver = passedDriver || {
    name: '...',
    avatar: '',
    rating: '...',
    car: '...'
  };
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{ id?: string, card?: string }>({});
  const [createdRideId, setCreatedRideId] = useState<string | null>(null);

  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const defaultCard = user?.paymentMethods?.find((pm: any) => pm.isDefault) || user?.paymentMethods?.[0];
  const cardDetailsString = defaultCard?.cardDetails || "";

  const [cardData, setCardData] = useState(() => {
    if (cardDetailsString) {
      const [cardNumber, cardHolder, expiry, cvv] = cardDetailsString.split('|');
      return {
        cardNumber: cardNumber || "",
        cardHolder: cardHolder || "",
        expiry: expiry || "",
        cvv: cvv || ""
      };
    }
    return {
      cardNumber: '',
      cardHolder: '',
      expiry: '',
      cvv: ''
    };
  });

  if (!pickupData?.coords || !destData?.coords) {
    return <Navigate to="/passenger/search-location" replace />;
  }

  const pickup = pickupData.coords;
  const destination = destData.coords;

  const passedFare = location.state?.fare;
  const fareAmount = passedFare !== undefined ? passedFare : '...';
  const displayFare = typeof fareAmount === 'number' ? fareAmount.toLocaleString() : fareAmount;

  const handleConfirm = async () => {
    if (paymentMethod === 'card') {
      setShowCardModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await paymentService.processPayment(typeof fareAmount === 'number' ? fareAmount : 0, 'cash');
      if (result.success) {
        // Create Ride in database
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        const rideResponse = await fetch(`${API_BASE_URL}/api/rides/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            driverId: driver.id,
            startAddress: pickupData.address || '...',
            endAddress: destData.address || '...',
            startLng: pickup.lng,
            startLat: pickup.lat,
            endLng: destination.lng,
            endLat: destination.lat,
            matchFee: typeof fareAmount === 'number' ? fareAmount : 0,
            matchType: location.state?.mode || 'designated',
            vehicleTypeRequested: driver.vehicleType || 'Sedan',
            paymentType: 'CASH',
            distance: driver.distance
          })
        });
        const rideData = await rideResponse.json();
        if (rideData.success) {
          setCreatedRideId(rideData.data.id);
          setPaymentDetails({ id: result.transactionId || 'CASH-TEMP' });
          navigate('/passenger/waiting-driver', { 
            state: { 
              driver, 
              rideId: rideData.data.id,
              mode: location.state?.mode || 'designated' 
            } 
          });
        } else {
          throw new Error(rideData.message || '配車リクエストの作成に失敗しました');
        }
      } else {
        setErrorMessage(result.error || '決済に失敗しました');
        setShowErrorPopup(true);
      }
    } catch (error: any) {
      setErrorMessage(error.message || '支払い処理中にエラーが発生しました。');
      setShowErrorPopup(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripePayment = async () => {
    setIsProcessing(true);
    try {
      if (!cardData.cardNumber || cardData.cardNumber.length < 14) {
        throw new Error("カード番号が正しくありません (14桁以上)");
      }
      if (!cardData.expiry || cardData.expiry.length < 5) {
        throw new Error("有効期限が正しくありません (MM/YY)");
      }

      await new Promise(r => setTimeout(r, 1000)); // Simulate processing

      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const generatedStripePaymentId = 'CARD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const rideResponse = await fetch(`${API_BASE_URL}/api/rides/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          driverId: driver.id,
          startAddress: pickupData.address || '...',
          endAddress: destData.address || '...',
          startLng: pickup.lng,
          startLat: pickup.lat,
          endLng: destination.lng,
          endLat: destination.lat,
          matchFee: typeof fareAmount === 'number' ? fareAmount : 0,
          matchType: location.state?.mode || 'designated',
          vehicleTypeRequested: driver.vehicleType || 'Sedan',
          paymentType: 'CARD',
          stripePaymentId: generatedStripePaymentId,
          distance: driver.distance
        })
      });
      const rideData = await rideResponse.json();
      if (rideData.success) {
        setCreatedRideId(rideData.data.id);
        setPaymentDetails({ 
          id: generatedStripePaymentId, 
          card: `**** ${cardData.cardNumber.slice(-4)}` 
        });
        setShowCardModal(false);
        setShowSuccessPopup(true);
      } else {
        throw new Error(rideData.message || '配車リクエストの作成に失敗しました');
      }
    } catch (error: any) {
      setErrorMessage(error.message || '支払い処理中にエラーが発生しました。');
      setShowErrorPopup(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTrack = () => {
    navigate('/passenger/waiting-driver', { 
      state: { 
        driver, 
        rideId: createdRideId,
        mode: location.state?.mode || 'designated' 
      } 
    });
  };

  return (
    <div className="bc-container">
      <Header
        variant="passenger"
        showBackButton={true}
        title="予約内容の確認"
        onBackClick={() => navigate(-1)}
        hideBrandName={true}
        hideLanguageToggle={true}
      />

      <div className="bc-map-area">
        <MapView 
          position={pickup} 
          pickupPosition={pickup} 
          destinationPosition={destination}
          routePadding={[[15, 48], [15, 10]]}
        />
        <div className="bc-eta-badge">到着予想 15分</div>
      </div>

      <div className="bc-content-scroll">
        <div className="bc-route-card">
          <div className="bc-route-item">
            <div className="bc-route-graphic">
              <div className="bc-route-dot bc-pickup-dot" />
              <div className="bc-route-line" />
            </div>
            <div className="bc-route-text">
              <span className="bc-route-label">出発地</span>
              <span className="bc-route-name">{pickupData.address || '...'}</span>
            </div>
          </div>
          <div className="bc-route-item">
            <div className="bc-route-graphic">
              <div className="bc-route-dot bc-dest-dot" />
            </div>
            <div className="bc-route-text">
              <span className="bc-route-label">目的地</span>
              <span className="bc-route-name">{destData.address || '...'}</span>
            </div>
          </div>
        </div>

        <div className="bc-info-row">
          <div className="bc-driver-card">
            <div className="bc-driver-avatar-wrapper">
              <img src={driver.avatar} alt={driver.name} className="bc-driver-avatar" />
              <div className="bc-driver-rating">{driver.rating && driver.rating !== '...' && !isNaN(Number(driver.rating)) ? Number(driver.rating).toFixed(1) : driver.rating} ★</div>
            </div>
            <div className="bc-driver-details">
              <div className="bc-driver-name">{driver.name}</div>
              <div className="bc-driver-car">{getCarModel(driver.car)}</div>
            </div>
          </div>
          
          <div className="bc-fare-card">
            <div className="bc-fare-label">運賃</div>
            <div className="bc-fare-amount">{displayFare} <span className="bc-fare-currency">VND</span></div>
          </div>
        </div>
      </div>

      <div className="bc-bottom-sheet">
        <div className="bc-drag-handle"></div>
        <h3 className="bc-sheet-title">お支払い方法</h3>
        
        <div className="bc-payment-options">
          <button 
            className={`bc-payment-btn ${paymentMethod === 'cash' ? 'bc-active' : ''}`}
            onClick={() => setPaymentMethod('cash')}
          >
            <Banknote size={20} color={paymentMethod === 'cash' ? '#006D37' : '#3D4A3F'} />
            <span>現金</span>
          </button>
          
          <button 
            className={`bc-payment-btn ${paymentMethod === 'card' ? 'bc-active' : ''}`}
            onClick={() => setPaymentMethod('card')}
          >
            <CreditCard size={20} color={paymentMethod === 'card' ? '#006D37' : '#3D4A3F'} />
            <span>カード</span>
          </button>
        </div>

        <button 
          className={`bc-confirm-btn ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`} 
          onClick={handleConfirm}
          disabled={isProcessing}
        >
          {isProcessing ? '処理中...' : '配車を確定する'}
        </button>
      </div>

      {showCardModal && (
        <div className="bc-success-overlay" onClick={() => setShowCardModal(false)}>
          <div className="bc-success-popup" onClick={(e) => e.stopPropagation()}>
            <div className="bc-popup-drag-handle" onClick={() => setShowCardModal(false)}></div>
            
            <h2 className="bc-success-title">クレジットカード情報</h2>
            
            <div className="bc-stripe-container" style={{ width: '100%', marginBottom: '24px' }}>
              <label className="bc-stripe-label">カード情報を入力してください</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <input 
                  type="text" 
                  placeholder="カード番号 (0000 0000 0000 0000)" 
                  value={cardData.cardNumber} 
                  onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: '1px solid #DDE5DB', borderRadius: '8px', fontSize: '16px', outline: 'none' }}
                />
                <input 
                  type="text" 
                  placeholder="名義人 (TARO YAMADA)" 
                  value={cardData.cardHolder} 
                  onChange={(e) => setCardData({...cardData, cardHolder: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: '1px solid #DDE5DB', borderRadius: '8px', fontSize: '16px', outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    value={cardData.expiry} 
                    onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                    style={{ width: '50%', padding: '12px', border: '1px solid #DDE5DB', borderRadius: '8px', fontSize: '16px', outline: 'none' }}
                  />
                  <input 
                    type="text" 
                    placeholder="CVC" 
                    value={cardData.cvv} 
                    onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                    style={{ width: '50%', padding: '12px', border: '1px solid #DDE5DB', borderRadius: '8px', fontSize: '16px', outline: 'none' }}
                  />
                </div>
              </div>
            </div>
            
            <button 
              className="bc-confirm-btn" 
              onClick={handleStripePayment}
              disabled={isProcessing}
            >
              {isProcessing ? '処理中...' : '今すぐ支払う'}
            </button>
            
            <button 
              className="bc-cancel-btn" 
              onClick={() => setShowCardModal(false)}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {showSuccessPopup && (
        <div className="bc-success-overlay" onClick={() => setShowSuccessPopup(false)}>
          <div className="bc-success-popup" onClick={(e) => e.stopPropagation()}>
            <div className="bc-popup-drag-handle" onClick={() => setShowSuccessPopup(false)}></div>
            
            <div className="bc-success-icon">
              <Check size={40} color="white" strokeWidth={3} />
            </div>
            
            <h2 className="bc-success-title">決済が完了しました</h2>
            
            <div className="bc-receipt-card">
              <div className="bc-receipt-label">合計支払額</div>
              <div className="bc-receipt-amount">{displayFare} VND</div>
              <div className="bc-receipt-details">
                <span>決済ID: {paymentDetails.id}</span>
                {paymentDetails.card && <span>{paymentDetails.card}</span>}
              </div>
            </div>
            
            <div className="bc-receipt-route">
              <div className="bc-receipt-route-item">
                <div className="bc-receipt-icon"><MapPin size={18} color="#006D37" /></div>
                <div className="bc-receipt-text">
                  <div className="bc-receipt-route-label">乗車場所</div>
                  <div className="bc-receipt-route-name">{pickupData.address || '...'}</div>
                </div>
              </div>
              <div className="bc-receipt-route-item">
                <div className="bc-receipt-icon bg-red-100"><Flag size={18} color="#C62828" /></div>
                <div className="bc-receipt-text">
                  <div className="bc-receipt-route-label">目的地</div>
                  <div className="bc-receipt-route-name">{destData.address || '...'}</div>
                </div>
              </div>
            </div>
            
            <button className="bc-track-btn" onClick={handleTrack}>
              追跡する <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {showErrorPopup && (
        <div className="bc-success-overlay" onClick={() => setShowErrorPopup(false)}>
          <div className="bc-success-popup" onClick={(e) => e.stopPropagation()}>
            <div className="bc-popup-drag-handle" onClick={() => setShowErrorPopup(false)}></div>
            
            <div className="bc-success-icon bg-red-600" style={{ backgroundColor: '#C62828', boxShadow: '0 0 0 20px rgba(198, 40, 40, 0.1)' }}>
              <XCircle size={40} color="white" strokeWidth={3} />
            </div>
            
            <h2 className="bc-success-title" style={{ color: '#C62828' }}>決済に失敗しました</h2>
            
            <p className="text-center text-[#3D4A3F] mb-6">{errorMessage}</p>
            
            <button 
              className="bc-track-btn" 
              onClick={() => setShowErrorPopup(false)}
              style={{ backgroundColor: '#171D17' }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingConfirmation;
