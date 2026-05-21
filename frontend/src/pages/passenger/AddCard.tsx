import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Wifi } from "lucide-react";
import { showToast } from "../../components/ui/Toast";
import { API_BASE_URL } from "../../config/api";
import { getCache, setCache, CACHE_KEYS } from "../../services/cacheService";
import "./AddCard.css";

export default function AddCard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: ""
  });
  
  useEffect(() => {
    if (location.state?.cardDetails) {
      const [cardNumber, cardHolder, expiry, cvv] = location.state.cardDetails.split('|');
      setFormData({
        cardNumber: cardNumber || "",
        cardHolder: cardHolder || "",
        expiry: expiry || "",
        cvv: cvv || ""
      });
    }
  }, [location.state]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    if (name === 'cardNumber') {
      value = formatCardNumber(value).substring(0, 19);
    } else if (name === 'cardHolder') {
      value = value.toUpperCase();
    } else if (name === 'expiry') {
      value = value.replace(/\D/g, '');
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      value = value.substring(0, 5);
    } else if (name === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 4);
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.cardNumber.replace(/\s/g, '').length < 14) newErrors.cardNumber = "有効なカード番号を入力してください";
    if (!formData.cardHolder.trim()) newErrors.cardHolder = "カード名義人を入力してください";
    if (formData.expiry.length < 5) newErrors.expiry = "有効期限を正しく入力してください";
    if (formData.cvv.length < 3) newErrors.cvv = "セキュリティコードを入力してください";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

      const response = await fetch(`${API_BASE_URL}/api/auth/profile/payment-method`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          cardHolder: formData.cardHolder,
          expiry: formData.expiry,
          cvv: formData.cvv
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.message || 'エラーが発生しました');
      }

      showToast("カードを登録しました", "success");
      
      // Fetch latest profile to update cache and sessionStorage so Profile page reflects instantly
      const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        sessionStorage.setItem('user', JSON.stringify(meData.user));
        setCache(CACHE_KEYS.USER_PROFILE, meData.user);
      }
      
      navigate(-1);
    } catch (error: any) {
      console.error('Save card error:', error);
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ac-container">
      <header className="ac-header">
        <button className="ac-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={26} strokeWidth={2.5} />
        </button>
        <h1 className="ac-title">カードを追加</h1>
      </header>

      <div className="ac-content">
        {/* CARD PREVIEW */}
        <div className="ac-card-preview">
          <div className="ac-card-chip">
            <Wifi size={24} className="rotate-90" />
          </div>
          <div className="ac-card-vendor">VISA</div>
          
          <div className="ac-card-number">
            {formData.cardNumber || "0000 0000 0000 0000"}
          </div>

          <div className="ac-card-details">
            <div>
              <div className="ac-card-label">CARD HOLDER</div>
              <div className="ac-card-value">{formData.cardHolder || "YOUR NAME"}</div>
            </div>
            <div>
              <div className="ac-card-label">EXPIRES</div>
              <div className="ac-card-value">{formData.expiry || "MM/YY"}</div>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="ac-form-grid">
          <div className="ac-input-group ac-full-width">
            <label className="ac-input-label">カード番号</label>
            <div className={`ac-input-wrapper ${errors.cardNumber ? 'ac-invalid' : ''}`}>
              <input 
                type="text" 
                name="cardNumber"
                placeholder="0000 0000 0000 0000"
                value={formData.cardNumber}
                onChange={handleInputChange}
                className="ac-input"
              />
            </div>
            {errors.cardNumber && <span className="text-red-500 text-xs font-medium mt-1">{errors.cardNumber}</span>}
          </div>

          <div className="ac-input-group ac-full-width">
            <label className="ac-input-label">カード名義人</label>
            <div className={`ac-input-wrapper ${errors.cardHolder ? 'ac-invalid' : ''}`}>
              <input 
                type="text" 
                name="cardHolder"
                placeholder="氏名"
                value={formData.cardHolder}
                onChange={handleInputChange}
                className="ac-input"
              />
            </div>
            {errors.cardHolder && <span className="text-red-500 text-xs font-medium mt-1">{errors.cardHolder}</span>}
          </div>

          <div className="ac-input-group">
            <label className="ac-input-label">有効期限</label>
            <div className={`ac-input-wrapper ${errors.expiry ? 'ac-invalid' : ''}`}>
              <input 
                type="text" 
                name="expiry"
                placeholder="MM/YY"
                value={formData.expiry}
                onChange={handleInputChange}
                className="ac-input"
              />
            </div>
            {errors.expiry && <span className="text-red-500 text-xs font-medium mt-1">{errors.expiry}</span>}
          </div>

          <div className="ac-input-group">
            <label className="ac-input-label">セキュリティコード</label>
            <div className={`ac-input-wrapper ${errors.cvv ? 'ac-invalid' : ''}`}>
              <input 
                type="text" 
                name="cvv"
                placeholder="123"
                value={formData.cvv}
                onChange={handleInputChange}
                className="ac-input"
              />
            </div>
            {errors.cvv && <span className="text-red-500 text-xs font-medium mt-1">{errors.cvv}</span>}
          </div>
        </div>

        <div className="ac-actions">
          <button className="ac-save-btn" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "処理中..." : "保存"}
          </button>
          <button className="ac-cancel-btn" onClick={() => navigate(-1)} disabled={isSubmitting}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
