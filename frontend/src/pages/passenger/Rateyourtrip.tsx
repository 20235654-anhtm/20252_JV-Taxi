import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Heading } from '../../components/ui/Heading';
import { Text } from '../../components/ui/Text';
import './Rateyourtrip.css';

const API_BASE_URL = 'http://localhost:5000/api';

const Rateyourtrip: React.FC = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState<number>(0); // Initial rating 0
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
      // Gọi trực tiếp API
      const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment,
          // Có thể thêm driverId hoặc bookingId từ context nếu cần
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }
      
      // Navigate to Home
      navigate('/passenger');
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('評価の送信に失敗しました。もう một lần thử lại.');
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
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=driver" 
                className="!w-[64px] !h-[64px]"
                borderColor="transparent"
              />
              <div className="driver-details">
                <Text variant="label" weight="bold" className="!text-[12px] !tracking-[1.2px] !text-[#006D37] mb-1">
                  担当ドライバー
                </Text>
                <Heading level={2} className="!text-[18px] mb-1">Nguyen Tan</Heading>
                <div className="driver-rating">
                  <Star size={14} fill="currentColor" />
                  <span>4.9</span>
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
                <Heading level={1} className="!text-[24px] !font-extrabold !font-['Plus_Jakarta_Sans']">₫145,000</Heading>
              </div>
              <div className="car-details">
                <Text variant="label" weight="bold" color="secondary" className="!text-[12px] !tracking-[1.2px] !font-['Plus_Jakarta_Sans'] mb-1">
                  TOYOTA CAMRY
                </Text>
                <Text variant="body" weight="medium" color="secondary" className="!text-[14px] !font-['Plus_Jakarta_Sans']">
                  51H-123.45
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
