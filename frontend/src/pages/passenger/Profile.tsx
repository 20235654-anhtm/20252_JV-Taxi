import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Mail, CreditCard, LogOut, Edit2 } from "lucide-react";
import { Header } from "../../components/layout/Header";
import { BottomNavBar, type NavTab } from "../../components/layout/BottomNavBar";
import "./Profile.css";

export default function PassengerProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('profile');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="pp-container">
      {/* HEADER */}
      <Header
        variant="passenger"
        userAvatar={user.avatar || "https://i.pravatar.cc/150?img=33"}
        onAvatarClick={() => {}}
        isFixed={false}
      />

      <div className="pp-content">
        {/* PROFILE HEADER */}
        <div className="pp-header-section">
          <div className="pp-avatar-wrapper">
            <img 
              src={user.avatar || "https://i.pravatar.cc/150?img=33"} 
              alt="Avatar" 
              className="pp-avatar"
            />
          </div>
          <h1 className="pp-name">{user.fullName}</h1>
        </div>

        {/* STATS CARDS */}
        <div className="pp-stats-grid">
          <div className="pp-stat-card">
            <p className="pp-stat-value">124</p>
            <p className="pp-stat-label">合計乗車数</p>
          </div>
          <div className="pp-stat-card">
            <p className="pp-stat-value">600,000<span className="text-xs ml-0.5">VND</span></p>
            <p className="pp-stat-label">累計利用金額</p>
          </div>
        </div>

        {/* PERSONAL INFO SECTION */}
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

        {/* PAYMENT SECTION */}
        <div className="pp-section">
          <h2 className="pp-section-title">
            お支払い
          </h2>
          <div className="pp-payment-card">
            <div className="pp-payment-icon">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="pp-payment-method">お支払い方法</p>
              <p className="pp-payment-subtext">Visa •••• 4242</p>
            </div>
            <button 
              onClick={() => navigate('/passenger/add-card')}
              className="pp-payment-edit"
            >
              <Edit2 size={22} />
            </button>
          </div>
        </div>

        {/* ACTIONS */}
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
