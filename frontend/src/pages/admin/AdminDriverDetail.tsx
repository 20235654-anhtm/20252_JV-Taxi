import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { API_BASE_URL } from '../../config/api';

import { ProfileCard } from '../../components/DriverDetail/ProfileCard';
import { CarDetailsCard } from '../../components/DriverDetail/CarDetailsCard';
import { DocumentCard } from '../../components/DriverDetail/DocumentCard';
import { ReviewsCard } from '../../components/DriverDetail/ReviewsCard';

interface DriverDetails {
  userId: string;
  vehicleType: string;
  vehicleInfor: string;
  drivingLicenseInfor: string;
  japaneseCerInfor: string;
  avatarPicture: string | null;
  profile: {
    fullName: string;
    email: string;
    phone: string;
    avatar?: string | null;
  };
  status?: 'ACTIVE' | 'BANNED' | 'INACTIVE';
  isApproved?: boolean;
  reviews?: Array<{
    id: string;
    starReview: number | null;
    commentReview: string | null;
    createdAt: string;
    reviewer: {
      fullName: string;
      avatar?: string | null;
    } | null;
  }>;
  averageRating?: number | null;
}

export default function AdminDriverDetail() {
  const navigate = useNavigate();
  const location = useLocation();

  // Load initial driver from location state
  const initialDriver: DriverDetails = location.state?.driver || {
    userId: '',
    vehicleType: '',
    vehicleInfor: '{}',
    drivingLicenseInfor: '',
    japaneseCerInfor: '',
    avatarPicture: null,
    profile: { fullName: 'Unknown', email: '', phone: '', avatar: null },
    status: 'ACTIVE',
    isApproved: false,
    reviews: []
  };

  const [driver, setDriver] = useState<DriverDetails>(initialDriver);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  // Fetch freshest data from database on mount
  useEffect(() => {
    if (!driver.userId) return;

    let isMounted = true;
    const fetchLatestDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/drivers/${driver.userId}`);
        const data = await response.json();
        
        if (data.success && data.data && isMounted) {
          const d = data.data;
          setDriver({
            userId: d.id,
            vehicleType: d.driverProfile?.vehicleType || '',
            vehicleInfor: d.driverProfile?.vehicleInfor || '{}',
            drivingLicenseInfor: d.driverProfile?.drivingLicenseInfor || '',
            japaneseCerInfor: d.driverProfile?.japaneseCerInfor || '',
            avatarPicture: d.driverProfile?.avatarPicture || null,
            profile: {
              fullName: d.fullName || 'Unknown',
              email: d.email || '',
              phone: d.phone || '',
              avatar: d.avatar || null
            },
            status: d.status || 'ACTIVE',
            isApproved: d.driverProfile?.isApproved || false,
            reviews: d.reviews || [],
            averageRating: d.driverProfile?.averageRating ? parseFloat(Number(d.driverProfile.averageRating).toFixed(2)) : null
          });
        }
      } catch (error) {
        console.error('Error fetching driver details from database:', error);
      }
    };

    fetchLatestDetails();
    return () => {
      isMounted = false;
    };
  }, [driver.userId]);

  // Handle blocking/unblocking accounts
  const handleBlockToggle = async () => {
    if (submitting || !driver.userId) return;
    setSubmitting(true);
    
    const isBlocked = driver.status === 'BANNED';
    const action = isBlocked ? 'unblock' : 'block';
    
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${driver.userId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        showToast(isBlocked ? '✅ アカウントのロックを解除しました。' : '🔒 アカウントをブロックしました。');
        setDriver(prev => ({
          ...prev,
          status: isBlocked ? 'ACTIVE' : 'BANNED'
        }));
      } else {
        showToast(`❌ 操作に失敗しました: ${data.message || ''}`);
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
      showToast('❌ サーバーへの接続に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to format relative time in Japanese
  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const past = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - past.getTime();
      if (isNaN(diffMs) || diffMs < 0) return '以前';
      
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'たった今';
      if (diffMins < 60) return `${diffMins}分前`;
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 24) return `${diffHours}時間前`;
      
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 30) return `${diffDays}日前`;
      
      const y = past.getFullYear();
      const m = past.getMonth() + 1;
      const d = past.getDate();
      return `${y}/${m}/${d}`;
    } catch (e) {
      return '';
    }
  };

  // Parse vehicle info
  let vehicle = { model: '', plate: '', year: '', image: null, documents: [] as string[] };
  try {
    if (driver.vehicleInfor) {
      const parsed = JSON.parse(driver.vehicleInfor);
      vehicle = {
        model: parsed.model || '未登録',
        plate: parsed.plate || '未登録',
        year: parsed.year || '未登録',
        image: parsed.image || null,
        documents: parsed.documents || []
      };
    }
  } catch (e) {
    // fallback
  }

  // Set Profile Card Props
  const profileData = {
    name: driver.profile.fullName,
    subName: driver.profile.fullName,
    avatarUrl: driver.avatarPicture || driver.profile.avatar || "",
    email: driver.profile.email || '未登録',
    phone: driver.profile.phone || '未登録',
    isVerified: driver.isApproved || false
  };

  // Set Car Details Props
  const carData = {
    carImage: vehicle.image || "",
    model: vehicle.model,
    year: vehicle.year,
    plateNumber: vehicle.plate
  };

  // Set License Props
  const licenseData = {
    title: "運転免許証",
    isValid: !!driver.drivingLicenseInfor && driver.drivingLicenseInfor !== "N/A",
    documentImage: vehicle.documents?.[0] || "",
    expirationDate: "未登録",
    categoryOrStatusLabel: "区分",
    categoryOrStatusValue: driver.drivingLicenseInfor && driver.drivingLicenseInfor !== "N/A" ? driver.drivingLicenseInfor : "未登録",
    isSuccessStatus: false
  };

  // Set JLPT Props
  const jlptData = {
    title: "JLPT証明書",
    isValid: !!driver.japaneseCerInfor && driver.japaneseCerInfor !== "未提出" && driver.japaneseCerInfor !== "N/A",
    documentImage: vehicle.documents?.[1] || "",
    expirationDate: "未登録",
    categoryOrStatusLabel: "ステータス",
    categoryOrStatusValue: driver.japaneseCerInfor && driver.japaneseCerInfor !== "N/A" ? driver.japaneseCerInfor : "未提出",
    isSuccessStatus: true
  };

  // Set Reviews Props matching actual database ratings
  const realReviews = driver.reviews || [];
  const totalReviews = realReviews.length;
  const averageScore = driver.averageRating || 0.0;

  const overallScoreStr = averageScore > 0 ? averageScore.toFixed(1) : "0.0";
  const overallWidthStr = averageScore > 0 ? `${(averageScore / 5) * 100}%` : "0%";

  const stats = [
    { label: "コミュニケーション", score: overallScoreStr, width: overallWidthStr },
    { label: "安全", score: overallScoreStr, width: overallWidthStr },
    { label: "態度", score: overallScoreStr, width: overallWidthStr }
  ];

  const comments = realReviews.map((r: any) => ({
    reviewerName: r.reviewer?.fullName || '匿名の乗客',
    timeAgo: formatTimeAgo(r.createdAt),
    comment: r.commentReview || 'コメントなし'
  }));

  const reviewsData = {
    totalReviews,
    averageScore,
    stats,
    comments
  };

  const isBanned = driver.status === 'BANNED';

  return (
    <div className="min-h-screen bg-[--color-bg-primary] pb-32 relative">
      <Header
        showBackButton
        title="運転手アカウント管理"
        hideBrandName
        hideLanguageToggle
        onBackClick={() => navigate(-1)}
      />

      <div className="pt-24 px-4 space-y-6 max-w-lg mx-auto">
        <ProfileCard {...profileData} />
        <CarDetailsCard {...carData} />

        {/* Documents Section */}
        <div className="w-full flex items-center gap-[16px] mt-[26px] mb-[16px]">
          <div className="text-[#171D17] text-[20px] font-[800] leading-[28px] break-words">書類</div>
        </div>

        <DocumentCard {...licenseData} />
        <DocumentCard {...jlptData} />
        
        <ReviewsCard {...reviewsData} />

        {/* Dynamic Block / Unblock Action Button */}
        <div className="pt-6 pb-2">
          <Button 
            variant="ghost"
            fullWidth 
            onClick={handleBlockToggle}
            disabled={submitting}
            className={`!rounded-[24px] !py-[16px] !h-auto hover:opacity-90 shadow-none !text-[18px] !font-[700] !leading-[28px] tracking-[0.45px] ${
              isBanned 
                ? '!bg-[#E7F7E9] !text-[#006D37]' 
                : '!bg-[#FFDAD6] !text-[#93000A]'
            }`}
          >
            {submitting 
              ? '更新中...' 
              : isBanned 
                ? 'アカウントのブロックを解除する' 
                : 'アカウントをブロックする'
            }
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#171D17',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 2000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap'
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
