import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Heading } from '../../components/ui/Heading';
import { Text } from '../../components/ui/Text';
import { showToast } from '../../components/ui/Toast';
import './Rateyourtrip.css';

import { API_BASE_URL as API_HOST } from '../../config/api';

const API_BASE_URL = `${API_HOST}/api`;

const Rateyourtrip: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rating, setRating] = useState<number>(0); // Initial rating 0
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [realDriver, setRealDriver] = useState<any>(null);

  // Nhận thông tin tài xế và chuyến đi từ Route state
  const rideId = location.state?.rideId || '';
  const driver = location.state?.driver || {
    name: 'Nguyen Tan',
    avatar: 'https://i.pravatar.cc/150?img=11',
    rating: '4.9',
    car: 'Toyota Camry',
    licensePlate: '51H-123.45'
  };
  const fare = location.state?.fare || '₫145,000';

  useEffect(() => {
    const fetchDriverDetails = async () => {
      const id = driver?.userId || driver?.id;
      if (!id || id === 'mock-driver-id') return;

      try {
        const response = await fetch(`${API_BASE_URL}/drivers/${id}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setRealDriver(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching driver details for rating screen:', error);
      }
    };

    fetchDriverDetails();
  }, [driver]);

  const handleRating = (index: number) => {
    setRating(index + 1);
  };

  const handleBack = () => {
    setRating(0);
    setComment('');
    navigate('/passenger');
  };

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    
    try {
      const userStr = sessionStorage.getItem('user') || localStorage.getItem('user') || '{}';
      const user = JSON.parse(userStr);
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');

      // Gọi trực tiếp API
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          rating,
          comment,
          driverId: driver?.userId || driver?.id || undefined,
          rideId: rideId || undefined,
          reviewerId: user?.id || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }
      
      // Navigate to Home
      navigate('/passenger');
    } catch (error) {
      console.error('Failed to submit rating:', error);
      showToast('評価 of 送信 to 失敗. Vui lòng thử lại.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rate-trip-container">
      {/* Header */}
      <Header 
        showBackButton={true} 
        title="評価" 
        onBackClick={handleBack} 
        hideBrandName={true}
        hideLanguageToggle={true}
      />

      {/* Main Content */}
      <main className="rate-trip-content">
        {/* Completion Message */}
        <section className="completion-header">
          <h1 className="completion-title">乗車が完了しました</h1>
          <p className="completion-subtitle">ご乗車ありがとうございました</p>
        </section>

        {/* Info Cards */}
        <section className="info-cards-group">
          {/* Driver Card */}
          <Card padding="sm" rounded="lg">
            <div className="driver-info-content">
              <Avatar 
                src={realDriver?.driverProfile?.avatarPicture || driver?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=driver"} 
                className="!w-[64px] !h-[64px]"
                borderColor="transparent"
              />
              <div className="driver-details">
                <Text variant="label" weight="bold" className="!text-[12px] !tracking-[1.2px] !text-[#006D37] mb-1">
                  担当ドライバー
                </Text>
                <Heading level={2} className="!text-[18px] mb-1">{realDriver?.fullName || driver?.name || "Nguyen Tan"}</Heading>
                <div className="driver-rating">
                  <Star size={14} fill="currentColor" />
                  <span>{realDriver?.driverProfile?.averageRating ? String(Number(realDriver.driverProfile.averageRating).toFixed(1)) : (driver?.rating || "4.9")}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Price & Car Card */}
          <Card padding="sm" rounded="lg">
            <div className="price-car-content">
              <div className="price-details">
                <Text variant="label" weight="bold" className="!text-[12px] !tracking-[1.2px] !text-[#006D37] mb-1">
                  合計料金
                </Text>
                <Heading level={1} className="!text-[24px] !font-extrabold !font-['Plus_Jakarta_Sans']">{fare}</Heading>
              </div>
              <div className="car-details">
                <Text variant="label" weight="bold" color="secondary" className="!text-[12px] !tracking-[1.2px] !font-['Plus_Jakarta_Sans'] mb-1">
                  {(() => {
                    try {
                      const car = realDriver?.driverProfile?.parsedVehicleInfor?.model || driver?.car;
                      if (typeof car === 'string' && car.startsWith('{')) {
                        const carObj = JSON.parse(car);
                        return carObj.model || 'Toyota Camry';
                      }
                      if (typeof car === 'object' && car !== null) {
                        return (car as any).model || 'Toyota Camry';
                      }
                      return car || 'Toyota Camry';
                    } catch (e) {
                      return 'Toyota Camry';
                    }
                  })()}
                </Text>
                <Text variant="body" weight="medium" color="secondary" className="!text-[14px] !font-['Plus_Jakarta_Sans']">
                  {(() => {
                    try {
                      const car = realDriver?.driverProfile?.parsedVehicleInfor?.plate || driver?.car;
                      if (typeof car === 'string' && car.startsWith('{')) {
                        const carObj = JSON.parse(car);
                        return carObj.plate || '51H-123.45';
                      }
                      if (typeof car === 'object' && car !== null) {
                        return (car as any).plate || '51H-123.45';
                      }
                      return realDriver?.driverProfile?.parsedVehicleInfor?.plate || driver?.licensePlate || '51H-123.45';
                    } catch (e) {
                      return '51H-123.45';
                    }
                  })()}
                </Text>
              </div>
            </div>
          </Card>
        </section>

        {/* Rating Section */}
        <section className="rating-section">
          <div className="rating-question">
            <Heading level={2} className="!text-[18px]">いかがでしたか？</Heading>
          </div>
          
          <div className="stars-container">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                size={30}
                className="star-icon"
                fill={index < rating ? "#FEA520" : "transparent"}
                color={index < rating ? "#FEA520" : "#BCCABC"}
                onClick={() => handleRating(index)}
              />
            ))}
          </div>

          <div className="comment-section">
            <Text variant="label" weight="bold" color="secondary" className="!text-[12px] !tracking-[1.2px] text-center">
              追加コメント (任意)
            </Text>
            <div className="comment-input-wrapper">
              <textarea
                className="comment-textarea"
                placeholder="フィードバックを入力してください"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
              />
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="submit-button-container">
          <Button 
            variant="accent" 
            fullWidth 
            size="lg"
            className="submit-button"
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? '送信中...' : '送信する'}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Rateyourtrip;
