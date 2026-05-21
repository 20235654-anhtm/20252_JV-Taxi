import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pen, User, Mail, Phone } from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import { showToast } from "../../components/ui/Toast";
import { getCache, setCache, CACHE_KEYS } from "../../services/cacheService";
import "./ProfileEdit.css";

// Avatar component: shows image if available, otherwise first letter of name
function AvatarEditDisplay({ src, name }: { src?: string | null; name?: string }) {
  const [imgError, setImgError] = useState(false);
  const hasValidSrc = src && !src.includes('pravatar.cc') && !imgError;
  const initial = (name || "U").charAt(0).toUpperCase();

  if (hasValidSrc) {
    return (
      <img
        src={src}
        alt="Avatar"
        className="ppe-avatar"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className="ppe-avatar ppe-avatar-initial"
    >
      {initial}
    </div>
  );
}

export default function PassengerProfileEdit() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatar: null as string | null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    // Try cache first (instant), then sessionStorage fallback
    const cached = getCache<any>(CACHE_KEYS.USER_PROFILE);
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    const userData = cached || (userStr ? JSON.parse(userStr) : null);
    if (userData) {
      setUser(userData);
      setFormData({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        avatar: userData.avatar || userData.driverProfile?.avatarPicture || null
      });
    }
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "無効な形式";
    if (!formData.email.includes('@')) newErrors.email = "無効な形式";
    if (!formData.phone.trim()) newErrors.phone = "無効な形式";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const body = new FormData();
      body.append('fullName', formData.fullName);
      body.append('email', formData.email);
      body.append('phone', formData.phone);
      if (avatarFile) {
        body.append('avatar', avatarFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/profile/update`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.message || 'Cập nhật thất bại');
      }

      const resData = await response.json();
      const updatedUser = resData.user;
      // Sync to both cache and sessionStorage
      setCache(CACHE_KEYS.USER_PROFILE, updatedUser);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      showToast('プロフィールを更新しました！', 'success');
      navigate('/passenger/profile');
    } catch (error: any) {
      console.error('Save profile error:', error);
      showToast(error.message || 'Cập nhật thất bại', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="ppe-container">
      <header className="ppe-header">
        <button className="ppe-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={26} strokeWidth={2.5} />
        </button>
        <h1 className="ppe-title">プロフィール</h1>
      </header>

      <div className="ppe-scroll-content">
        <div className="ppe-avatar-section">
          <div className="ppe-avatar-wrapper">
            <AvatarEditDisplay src={formData.avatar} name={formData.fullName} />
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              accept="image/*"
            />
            <div className="ppe-avatar-edit-btn" onClick={handleAvatarClick}>
              <Pen size={18} fill="white" />
            </div>
          </div>
        </div>

        <h2 className="ppe-main-title">プロフィールを編集</h2>

        <div className="ppe-form">
          <div className="mb-6">
            <label className="ppe-label ml-5 mb-2">氏名</label>
            <div className={`ppe-input-card ${errors.fullName ? 'ppe-invalid' : ''}`}>
              <div className="ppe-field-content">
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="ppe-input"
                  placeholder="Emiko Tanaka"
                />
              </div>
              <User className="ppe-input-icon" size={20} />
            </div>
            {errors.fullName && <p className="ppe-error-msg">{errors.fullName}</p>}
          </div>

          <div className="mb-6">
            <label className="ppe-label ml-5 mb-2">メールアドレス</label>
            <div className={`ppe-input-card ${errors.email ? 'ppe-invalid' : ''}`}>
              <div className="ppe-field-content">
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="ppe-input"
                  placeholder="emiko.tanaka@zen-nav.jp"
                />
              </div>
              <Mail className="ppe-input-icon" size={20} />
            </div>
            {errors.email && <p className="ppe-error-msg">{errors.email}</p>}
          </div>

          <div className="mb-6">
            <label className="ppe-label ml-5 mb-2">電話番号</label>
            <div className={`ppe-input-card ${errors.phone ? 'ppe-invalid' : ''}`}>
              <div className="ppe-field-content">
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="ppe-input"
                  placeholder="+84 90 123 4567"
                />
              </div>
              <Phone className="ppe-input-icon" size={20} />
            </div>
            {errors.phone && <p className="ppe-error-msg">{errors.phone}</p>}
          </div>
        </div>

        <div className="ppe-actions">
          <button className="ppe-save-btn" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "変更を保存"}
          </button>
          <button className="ppe-cancel-btn" onClick={() => navigate(-1)}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
