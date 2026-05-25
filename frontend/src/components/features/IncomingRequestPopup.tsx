import { useState, useEffect } from 'react';
import { User, MapPin, Clock, CreditCard, Navigation, X, Check } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Heading } from '../ui/Heading';
import './IncomingRequestPopup.css';

interface IncomingRequestProps {
  request: {
    passengerName: string;
    passengerAvatar: string;
    pickupLocation: string;
    destinationLocation: string;
    distanceToPickup: string;
    estimatedFare: string;
    duration: string;
    paymentMethod: string;
  };
  onAccept: () => void;
  onDecline: () => void;
  timeoutSeconds?: number;
}

const IncomingRequestPopup = ({
  request,
  onAccept,
  onDecline,
  timeoutSeconds = 180
}: IncomingRequestProps) => {
  const [timeLeft, setTimeLeft] = useState(timeoutSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onDecline();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onDecline]);

  const getTranslatedPaymentMethod = (method: string) => {
    if (!method) return '現金';
    const normalized = method.toLowerCase().trim();
    if (normalized === 'cash' || normalized === 'tiền mặt' || normalized === 'tien mat') {
      return '現金';
    }
    if (
      normalized === 'card' ||
      normalized === 'thẻ' ||
      normalized === 'the' ||
      normalized === 'クレジットカード' ||
      normalized === 'creditcard'
    ) {
      return 'カード';
    }
    return method;
  };

  return (
    <div className="irp-overlay">
      <Card className="irp-container" rounded="2xl" padding="none">
        <div className="irp-drag-handle" />
        
        <div className="irp-header-section">
          <div>
            <div className="irp-badge">新規リクエスト</div>
            <Heading level={2} className="irp-title">配車依頼</Heading>
          </div>
          <Card className="irp-fare-card" rounded="lg" padding="none">
            <span className="irp-fare-label">乗車料金</span>
            <span className="irp-fare-amount">{request.estimatedFare}</span>
          </Card>
        </div>

        <div className="irp-cards-row">
          <Card className="irp-passenger-card" variant="default" padding="sm" rounded="lg">
            <Avatar 
              src={request.passengerAvatar} 
              alt={request.passengerName} 
              size="md"
              borderColor="transparent"
            />
            <span className="irp-passenger-name">{request.passengerName}</span>
          </Card>
          
          <Card className="irp-distance-card" variant="default" padding="sm" rounded="lg">
            <MapPin size={18} className="text-[#27AE60]" />
            <div className="irp-distance-val">{request.distanceToPickup}</div>
            <div className="irp-distance-label">乗車位置</div>
          </Card>
        </div>

        <Card className="irp-route-card" variant="default" padding="md" rounded="lg">
          <div className="irp-route-item">
            <div className="irp-dot-container">
              <div className="irp-dot irp-green" />
            </div>
            <div className="irp-addr">
              <span className="irp-addr-label">乗車位置</span>
              <p className="irp-addr-text">{request.pickupLocation}</p>
            </div>
          </div>
          
          <div className="irp-route-line" />
          
          <div className="irp-route-item">
            <div className="irp-dot-container">
              <div className="irp-dot irp-orange" />
            </div>
            <div className="irp-addr">
              <span className="irp-addr-label">降車位置</span>
              <p className="irp-addr-text">{request.destinationLocation}</p>
            </div>
          </div>
          
          <div className="irp-meta-row">
            <div className="irp-meta-item">
              <Clock size={16} />
              <span>所要時間 : {request.duration}</span>
            </div>
             <div className="irp-meta-item">
              <CreditCard size={16} />
              <span>{getTranslatedPaymentMethod(request.paymentMethod)}</span>
            </div>
          </div>
        </Card>

        <div className="irp-timer-section">
          <div className="irp-timer-bar">
            <div 
              className="irp-timer-progress" 
              style={{ width: `${(timeLeft / timeoutSeconds) * 100}%` }}
            />
          </div>
        </div>

        <div className="irp-footer-section">
          <Button 
            variant="secondary" 
            size="xl" 
            fullWidth 
            onClick={onDecline}
            className="irp-cancel-btn"
          >
            キャンセル
          </Button>
          <Button 
            variant="primary" 
            size="xl" 
            fullWidth 
            icon={Navigation}
            iconPosition="left"
            onClick={onAccept}
            className="irp-accept-btn-custom"
          >
            リクエストを受ける
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default IncomingRequestPopup;
