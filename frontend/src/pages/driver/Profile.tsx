import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Phone, Mail, CarFront, ShieldCheck, 
  Star, Languages, Calendar, IdCard, LogOut, 
  Settings, CheckCircle2
} from "lucide-react";
import { Header } from "../../components/layout/Header";
import { BottomNavBar, type NavTab } from "../../components/layout/BottomNavBar";
import "./Profile.css";

export default function DriverProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('profile');

  useEffect(() => {
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="dp-container">
      {/* HEADER */}
      <Header
        variant="passenger"
        onAvatarClick={() => {}}
        isFixed={false}
      />

      <div className="dp-content">
        {/* MAIN PROFILE CARD */}
        <div className="dp-main-card">
          <div className="dp-avatar-wrapper">
            <img 
              src={user.avatar || "https://randomuser.me/api/portraits/men/32.jpg"} 
              alt="Avatar" 
              className="dp-avatar"
            />
          </div>
          <h1 className="dp-name">{(user.fullName || "山本 健二").split('(')[0].trim()}</h1>
          <p className="dp-experience">2021年からJV-Taxiのパートナー</p>
          
          <div className="dp-badges">
            <div className="dp-badge">
              <Star size={16} fill="#27ae60" className="text-[#27ae60]" />
              <span className="dp-badge-text">4.98</span>
            </div>
            <div className="dp-badge">
              <Languages size={16} className="text-[#006d37]" />
              <span className="dp-badge-text">JLPT N2</span>
            </div>
          </div>
        </div>

        {/* PERSONAL INFO */}
        <div className="dp-section">
          <div className="dp-section-header">
            <div className="dp-section-icon">
              <User size={22} />
            </div>
            <h2 className="dp-section-title">個人情報</h2>
          </div>
          
          <div className="dp-info-item">
            <p className="dp-info-label">電話番号</p>
            <p className="dp-info-value">+84 90 123 4567</p>
          </div>
          <div className="dp-info-item">
            <p className="dp-info-label">メールアドレス</p>
            <p className="dp-info-value">k.yamamoto@zenlink.vn</p>
          </div>
          <div className="dp-info-item">
            <p className="dp-info-label">生年月日</p>
            <p className="dp-info-value">1985年5月12日</p>
          </div>
        </div>

        {/* IDENTIFICATION SECTION */}
        <div className="dp-section">
          <div className="dp-section-header">
            <div className="dp-section-icon">
              <IdCard size={22} />
            </div>
            <h2 className="dp-section-title">身分証明</h2>
          </div>
          
          <div className="dp-id-card">
            <p className="dp-info-label">本人確認書類</p>
            <p className="dp-doc-value">079xxxxxx889</p>
            <div className="dp-status-badge">
              <CheckCircle2 size={16} className="text-[#27ae60]" />
              <span className="dp-status-text">本人確認済み</span>
            </div>
          </div>
        </div>

        {/* VEHICLE SECTION */}
        <div className="mb-6">
          <div className="dp-car-image-card">
            <img 
              src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000" 
              alt="Car" 
              className="dp-car-image"
            />
          </div>
          
          <div className="dp-section">
            <div className="dp-section-header">
              <div className="dp-section-icon">
                <CarFront size={22} />
              </div>
              <h2 className="dp-section-title">車両詳細</h2>
            </div>

            <div className="dp-vehicle-grid">
              <div>
                <p className="dp-grid-label">車種モデル</p>
                <p className="dp-grid-value">Toyota Vios</p>
              </div>
              <div>
                <p className="dp-grid-label">ナンバープレート</p>
                <p className="dp-grid-value">51A-888.88</p>
              </div>
              <div>
                <p className="dp-grid-label">車種タイプ</p>
                <p className="dp-grid-value">Sedan (4名乗り)</p>
              </div>
              <div>
                <p className="dp-grid-label">年</p>
                <p className="dp-grid-value">2022</p>
              </div>
            </div>
          </div>
        </div>

        {/* DOCUMENTS */}
        <div className="dp-section">
          <div className="dp-section-header">
            <div className="dp-section-icon">
              <ShieldCheck size={22} />
            </div>
            <h2 className="dp-section-title">証明書類</h2>
          </div>
          
          <div className="dp-doc-item">
            <p className="dp-info-label">日本語能力</p>
            <p className="dp-doc-value">JLPT N2</p>
          </div>
          <div className="dp-doc-item">
            <p className="dp-info-label">運転免許証</p>
            <p className="dp-doc-value">B2</p>
          </div>
        </div>

        {/* ACCOUNT SETTINGS */}
        <div className="dp-section">
          <div className="dp-section-header">
            <div className="dp-section-icon">
              <Settings size={22} />
            </div>
            <h2 className="dp-section-title">アカウント設定</h2>
          </div>
          
          <button onClick={() => navigate('/driver/profile/edit')} className="dp-edit-btn">
            プロフィール編集
          </button>
          <button onClick={handleLogout} className="dp-logout-btn">
            ログアウト
          </button>
        </div>
      </div>

      <BottomNavBar
        activeTab="profile"
      />
    </div>
  );
}
