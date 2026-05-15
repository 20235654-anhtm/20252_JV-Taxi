import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wifi } from "lucide-react";
import "./AddCard.css";

export default function AddCard() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: ""
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});

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
    const newErrors: Record<string, boolean> = {};
    if (formData.cardNumber.replace(/\s/g, '').length < 14) newErrors.cardNumber = true;
    if (!formData.cardHolder.trim()) newErrors.cardHolder = true;
    if (formData.expiry.length < 5) newErrors.expiry = true;
    if (formData.cvv.length < 3) newErrors.cvv = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    // Simulate API call
    setTimeout(() => {
      alert("カードを登録しました");
      navigate(-1);
    }, 1000);
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
          </div>
        </div>

        <div className="ac-actions">
          <button className="ac-save-btn" onClick={handleSave}>
            保存
          </button>
          <button className="ac-cancel-btn" onClick={() => navigate(-1)}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
