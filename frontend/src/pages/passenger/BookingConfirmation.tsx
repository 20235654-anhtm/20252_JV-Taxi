import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/features/MapView';
import { Banknote, CreditCard, Check, MapPin, Flag, Send, XCircle } from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { paymentService } from '../../services/paymentService';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  const { pickup: pickupData, destination: destData } = useBooking();
  const passedDriver = location.state?.driver;
  
  // Dùng driver từ state, nếu không có (như chế độ Auto) thì hiển thị mock data
  const driver = passedDriver || {
    name: 'Nguyen Tan',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: '4.9',
    car: 'Toyota Camry'
  };
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('card');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{ id?: string, card?: string }>({});

  if (!pickupData?.coords || !destData?.coords) {
    return <Navigate to="/passenger/search-location" replace />;
  }

  const pickup = pickupData.coords;
  const destination = destData.coords;

  const handleConfirm = async () => {
    if (paymentMethod === 'card') {
      setShowCardModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await paymentService.processPayment(145000, 'cash');
      if (result.success) {
        setPaymentDetails({ id: result.transactionId });
        setShowSuccessPopup(true);
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
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      const intentData = await paymentService.createPaymentIntent(145000);
      
      if ('error' in intentData) {
        throw new Error(intentData.error);
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('カード情報が見つかりません');

      const { error, paymentIntent } = await stripe.confirmCardPayment(intentData.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Demo User',
          },
        },
      });

      if (error) {
        setErrorMessage(error.message || '決済に失敗しました');
        setShowErrorPopup(true);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentDetails({ 
          id: paymentIntent.id, 
          card: 'Visa **** 4242' 
        });
        setShowCardModal(false);
        setShowSuccessPopup(true);
      }
    } catch (error: any) {
      setErrorMessage(error.message || '支払い処理中にエラーが発生しました。');
      setShowErrorPopup(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTrack = () => {
    navigate('/passenger/waiting-driver', { state: { driver, mode: location.state?.mode || 'designated' } });
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
              <span className="bc-route-name">{pickupData.address || 'ハノイ工科大学'}</span>
            </div>
          </div>
          <div className="bc-route-item">
            <div className="bc-route-graphic">
              <div className="bc-route-dot bc-dest-dot" />
            </div>
            <div className="bc-route-text">
              <span className="bc-route-label">目的地</span>
              <span className="bc-route-name">{destData.address || 'ロイヤルシティ'}</span>
            </div>
          </div>
        </div>

        <div className="bc-info-row">
          <div className="bc-driver-card">
            <div className="bc-driver-avatar-wrapper">
              <img src={driver.avatar} alt={driver.name} className="bc-driver-avatar" />
              <div className="bc-driver-rating">{driver.rating} ★</div>
            </div>
            <div className="bc-driver-details">
              <div className="bc-driver-name">{driver.name}</div>
              <div className="bc-driver-car">{driver.car}</div>
            </div>
          </div>
          
          <div className="bc-fare-card">
            <div className="bc-fare-label">運賃</div>
            <div className="bc-fare-amount">145,000 <span className="bc-fare-currency">VND</span></div>
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
            <Banknote size={24} color={paymentMethod === 'cash' ? '#006D37' : '#3D4A3F'} />
            <span>現金</span>
          </button>
          
          <button 
            className={`bc-payment-btn ${paymentMethod === 'card' ? 'bc-active' : ''}`}
            onClick={() => setPaymentMethod('card')}
          >
            <CreditCard size={24} color={paymentMethod === 'card' ? '#006D37' : '#3D4A3F'} />
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
              <CardElement 
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#171D17',
                      '::placeholder': {
                        color: '#8C998E',
                      },
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                    },
                    invalid: {
                      color: '#C62828',
                    },
                  },
                }} 
              />
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
              <div className="bc-receipt-amount">145,000 VND</div>
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
                  <div className="bc-receipt-route-name">{pickupData.address || 'ハノイ工科大学'}</div>
                </div>
              </div>
              <div className="bc-receipt-route-item">
                <div className="bc-receipt-icon bg-red-100"><Flag size={18} color="#C62828" /></div>
                <div className="bc-receipt-text">
                  <div className="bc-receipt-route-label">目的地</div>
                  <div className="bc-receipt-route-name">{destData.address || 'ロイヤルシティ'}</div>
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
