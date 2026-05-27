import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, User, CarFront, ShieldCheck, Pen, Languages, IdCard } from "lucide-react";
import "./ProfileEdit.css";
import { showToast } from "../../components/ui/Toast";

interface DriverInfo {
  fullName: string;
  email: string;
  phone: string;
  licensePlate: string;
  carType: string;
  carModel: string;
  avatar: string;
  carImage: string;
  jlptCertificate: string;
  driverLicense: string;
}

export default function ProfileEdit() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<DriverInfo>({
    fullName: "山本 健二",
    email: "k.yamamoto@zenlink.vn",
    phone: "+84 90 123 4567",
    licensePlate: "51A-888.88",
    carType: "エグゼクティブ Sedan",
    carModel: "Toyota Camry 2024",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    carImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000",
    jlptCertificate: "日本語能力試験",
    driverLicense: "運転免許証"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      if (userData.fullName) {
        setFormData(prev => ({
          ...prev,
          fullName: userData.fullName,
          email: userData.email || prev.email,
          phone: userData.phone || prev.phone
        }));
      }
    }
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

    if (user?.role === 'driver') {
      if (!formData.licensePlate.trim()) newErrors.licensePlate = "無効な形式";
      if (!formData.carType.trim()) newErrors.carType = "無効な形式";
      if (!formData.carModel.trim()) newErrors.carModel = "無効な形式";
    }

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

  const handleSave = () => {
    if (!validate()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      if (user?.role === 'driver' || user?.role === 'DRIVER') {
        showToast("編集リクエストを送信しました", "success");
        const originalPlate = "51A-888.88";
        if (formData.licensePlate !== originalPlate) {
          localStorage.setItem('driverReviewStatus', 'pending');
          sessionStorage.setItem('driverReviewStatus', 'pending');
        }
      } else {
        const updated = JSON.stringify({ ...user, ...formData });
        sessionStorage.setItem('user', updated);
        localStorage.setItem('user', updated);
      }
      setIsSubmitting(false);
      navigate(-1);
    }, 1000);
  };

  return (
    <div className="pe-container">
      <header className="pe-header">
        <button className="pe-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={26} strokeWidth={2.5} />
        </button>
        <h1 className="pe-title">プロフィール編集</h1>
      </header>

      <div className="pe-scroll-content">
        <div className="pe-avatar-section">
          <div className="pe-avatar-wrapper">
            <img src={formData.avatar} alt="Avatar" className="pe-avatar" />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*"
            />
            <div className="pe-avatar-edit-btn" onClick={handleAvatarClick}>
              <Pen size={18} fill="white" />
            </div>
          </div>
        </div>

        {/* PERSONAL INFO */}
        <div className="pe-section">
          <h2 className="pe-section-title">
            <User size={22} strokeWidth={2.5} /> 個人情報
          </h2>

          <div className={`pe-input-card ${errors.fullName ? 'pe-invalid' : ''}`}>
            <label className="pe-label">氏名</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="pe-input"
            />
          </div>
          {errors.fullName && <p className="pe-error-msg">{errors.fullName}</p>}

          <div className={`pe-input-card ${errors.email ? 'pe-invalid' : ''}`}>
            <label className="pe-label">メールアドレス</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="pe-input"
            />
          </div>
          {errors.email && <p className="pe-error-msg">{errors.email}</p>}

          <div className={`pe-input-card ${errors.phone ? 'pe-invalid' : ''}`}>
            <label className="pe-label">電話番号</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="pe-input"
            />
          </div>
          {errors.phone && <p className="pe-error-msg">{errors.phone}</p>}
        </div>

        {/* VEHICLE INFO */}
        <div className="pe-section">
          <h2 className="pe-section-title">
            <CarFront size={22} strokeWidth={2.5} /> 車労詳細
          </h2>

          <div className={`pe-input-card ${errors.licensePlate ? 'pe-invalid' : ''}`}>
            <label className="pe-label">ナンバープレート</label>
            <input
              type="text"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleInputChange}
              className="pe-input"
            />
          </div>
          {errors.licensePlate && <p className="pe-error-msg">{errors.licensePlate}</p>}

          <div className={`pe-input-card ${errors.carType ? 'pe-invalid' : ''}`}>
            <label className="pe-label">車種タイプ</label>
            <input
              type="text"
              name="carType"
              value={formData.carType}
              onChange={handleInputChange}
              className="pe-input"
            />
          </div>
          {errors.carType && <p className="pe-error-msg">{errors.carType}</p>}

          <div className={`pe-input-card ${errors.carModel ? 'pe-invalid' : ''}`}>
            <label className="pe-label">車種モデル</label>
            <input
              type="text"
              name="carModel"
              value={formData.carModel}
              onChange={handleInputChange}
              className="pe-input"
            />
          </div>
          {errors.carModel && <p className="pe-error-msg">{errors.carModel}</p>}
        </div>

        {/* DOCUMENTS */}
        <div className="pe-section">
          <h2 className="pe-section-title">
            <ShieldCheck size={22} strokeWidth={2.5} /> 証明書類
          </h2>

          <div className="pe-docs-grid">
            <div className="pe-doc-card">
              <IdCard className="pe-doc-icon" size={32} strokeWidth={1.5} />
              <span className="pe-doc-name">{formData.driverLicense}</span>
              <span className="pe-doc-btn">アップロード</span>
            </div>
            <div className="pe-doc-card">
              <Languages className="pe-doc-icon" size={32} strokeWidth={1.5} />
              <span className="pe-doc-name">{formData.jlptCertificate}</span>
              <span className="pe-doc-btn">変更</span>
            </div>
          </div>

          <div className="pe-car-image-container">
            <img src={formData.carImage} alt="Car" className="pe-car-image" />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="pe-actions">
          <button className="pe-save-btn" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存"}
          </button>
          <button className="pe-cancel-btn" onClick={() => navigate(-1)}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
