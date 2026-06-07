import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, CreditCard, LogOut, Edit2 } from "lucide-react";
import { Header } from "../../components/layout/Header";
import { BottomNavBar, type NavTab } from "../../components/layout/BottomNavBar";
import { API_BASE_URL } from "../../config/api";
import { getCache, setCache, clearAllCache, CACHE_KEYS } from "../../services/cacheService";
import "./Profile.css";
import { socketService } from "../../services/socketService";
import { Avatar } from "../../components/ui/Avatar";

// Avatar component: shows image if available, otherwise first letter of name
function AvatarDisplay({ src, name, size = 100 }: { src?: string | null; name?: string; size?: number }) {
  return (
    <Avatar 
      src={src} 
      name={name} 
      className="pp-avatar"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      borderColor="none"
    />
  );
}

export default function PassengerProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(() => {
    // Initialize from cache immediately — no loading spinner if cache exists
    return getCache(CACHE_KEYS.USER_PROFILE) || null;
  });
  const [activeTab, setActiveTab] = useState<NavTab>('profile');
  const [loading, setLoading] = useState(!user); // Skip loading if cache hit

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setUser(data.user);
        // Save to cache for instant load next time
        setCache(CACHE_KEYS.USER_PROFILE, data.user);
        // Keep sessionStorage in sync for ProtectedRoute & other pages
        sessionStorage.setItem('user', JSON.stringify(data.user));
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to sessionStorage if no cache
        if (!user) {
          const userStr = sessionStorage.getItem('user');
          if (userStr) {
            setUser(JSON.parse(userStr));
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    socketService.disconnect();
    clearAllCache();
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Format number with commas (e.g. 600000 -> 600,000)
  const formatNumber = (num: number) => {
    return num.toLocaleString('ja-JP');
  };

  // Get masked card details display
  const getPaymentDisplay = () => {
    if (!user?.paymentMethods || user.paymentMethods.length === 0) {
      return { method: "未登録", subtext: "カードを追加してください" };
    }
    const defaultCard = user.paymentMethods.find((pm: any) => pm.isDefault) || user.paymentMethods[0];
    const cardDetailsString = defaultCard.cardDetails || "";
    const [cardNumber] = cardDetailsString.split('|');
    
    if (!cardNumber) {
      return { method: "未登録", subtext: "カードを追加してください" };
    }
    
    const last4 = cardNumber.slice(-4);
    const cardType = cardNumber.startsWith('4') ? 'Visa' :
                     cardNumber.startsWith('5') ? 'Mastercard' :
                     cardNumber.startsWith('3') ? 'JCB' : 'カード';
    return { method: "お支払い方法", subtext: `${cardType} •••• ${last4}`, fullDetails: cardDetailsString };
  };

  if (loading) {
    return (
      <div className="pp-container">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006d37]"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const paymentInfo = getPaymentDisplay();
  const avatarUrl = user.avatar || user.driverProfile?.avatarPicture || null;

  return (
    <div className="pp-container">
      <Header
        variant="passenger"
        userAvatar={avatarUrl || undefined}
        onAvatarClick={() => {}}
      />

      <div className="pp-content">
        <div className="pp-header-section">
          <div className="pp-avatar-wrapper">
            <AvatarDisplay src={avatarUrl} name={user.fullName} size={100} />
          </div>
          <h1 className="pp-name">{user.fullName}</h1>
        </div>

        <div className="pp-stats-grid">
          <div className="pp-stat-card">
            <p className="pp-stat-value">{user.totalRides ?? 0}</p>
            <p className="pp-stat-label">合計乗車数</p>
          </div>
          <div className="pp-stat-card">
            <p className="pp-stat-value">{formatNumber(user.totalSpent ?? 0)}<span className="text-xs ml-0.5">VND</span></p>
            <p className="pp-stat-label">累計利用金額</p>
          </div>
        </div>

        <div className="pp-section">
          <h2 className="pp-section-title">
            <User size={20} strokeWidth={3} /> 個人情報
          </h2>
          <div className="pp-info-card">
            <p className="pp-info-label">氏名</p>
            <p className="pp-info-value">{user.fullName}</p>
          </div>
          <div className="pp-info-card">
            <p className="pp-info-label">メールアドレス</p>
            <p className="pp-info-value">{user.email}</p>
          </div>
          <div className="pp-info-card">
            <p className="pp-info-label">電話番号</p>
            <p className="pp-info-value">{user.phone}</p>
          </div>
        </div>

        <div className="pp-section">
          <h2 className="pp-section-title">
            お支払い
          </h2>
          <div className="pp-payment-card">
            <div className="pp-payment-icon">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="pp-payment-method">{paymentInfo.method}</p>
              <p className="pp-payment-subtext">{paymentInfo.subtext}</p>
            </div>
            <button 
              onClick={() => navigate('/passenger/add-card', { state: { cardDetails: (paymentInfo as any).fullDetails } })}
              className="pp-payment-edit"
            >
              <Edit2 size={22} />
            </button>
          </div>
        </div>

        <div className="pp-actions">
          <button onClick={() => navigate('/passenger/profile/edit')} className="pp-edit-btn">
            プロフィールを編集
          </button>
          <button onClick={handleLogout} className="pp-logout-btn">
            <LogOut size={22} strokeWidth={3} /> ログアウト
          </button>
        </div>
      </div>

      <BottomNavBar
        activeTab="profile"
      />
    </div>
  );
}
