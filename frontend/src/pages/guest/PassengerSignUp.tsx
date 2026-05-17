import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { Eye, EyeOff } from 'lucide-react';
import svgPaths from "./svg-6rrnxvk6hs";

const TRANSLATIONS = {
  JP: {
    headerTitle: "JV - Taxi",
    mainTitle: "新規登録",
    nameLabel: "氏名",
    namePlaceholder: "氏名を入力",
    emailLabel: "メールアドレス",
    emailPlaceholder: "メールアドレスを入力",
    phoneLabel: "電話番号",
    phonePlaceholder: "電話番号を入力",
    passLabel: "パスワード",
    passPlaceholder: "最小8文字以上",
    agreeLabel: "利用規約とプライバシーポリシーへの同意を確認する",
    btnSubmit: "登録",
    haveAccount: "アカウントをお持ちの方はこちら ",
    login: "ログイン",
    errorEmail: "有効なメールアドレスを入力してください",
    errorPhone: "数字のみ入力してください",
    errorPass: "最小8文字以上入力してください",
    errorAgree: "利用規約に同意してください",
  },
  VN: {
    headerTitle: "JV - Taxi",
    mainTitle: "Đăng ký mới",
    nameLabel: "Họ và tên",
    namePlaceholder: "Nhập họ và tên",
    emailLabel: "Địa chỉ Email",
    emailPlaceholder: "Nhập email",
    phoneLabel: "Số điện thoại",
    phonePlaceholder: "Nhập số điện thoại",
    passLabel: "Mật khẩu",
    passPlaceholder: "Tối thiểu 8 ký tự",
    agreeLabel: "Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật",
    btnSubmit: "Đăng ký",
    haveAccount: "Bạn đã có tài khoản? ",
    login: "Đăng nhập",
    errorEmail: "Vui lòng nhập email hợp lệ",
    errorPhone: "Vui lòng chỉ nhập số",
    errorPass: "Vui lòng nhập tối thiểu 8 ký tự",
    errorAgree: "Vui lòng đồng ý với điều khoản",
  },
};

function HeaderTopAppBar({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="absolute backdrop-blur-[12px] bg-[rgba(255,255,255,0.8)] content-stretch flex h-[64px] items-center left-0 px-[24px] top-0 w-full z-50 border-b border-[rgba(0,0,0,0.05)]">
      <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
        <button onClick={onBack} className="p-[8px] rounded-full hover:bg-[rgba(0,109,55,0.05)] transition-all">
          <div className="size-[16px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
              <path d={svgPaths.p300a1100} fill="var(--fill-0, #006D37)" />
            </svg>
          </div>
        </button>
        <div className="font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold text-[#006d37] text-[18px]">{title}</div>
      </div>
    </div>
  );
}

export default function PassengerSignUp() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  const [form, setForm] = useState({ name: "", email: "", phone: "", pass: "", agree: false });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^\+?[0-9]{10,15}$/;

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!form.name) newErrors.name = true;
    if (!emailRegex.test(form.email)) newErrors.email = true;
    if (!phoneRegex.test(form.phone)) newErrors.phone = true;
    if (form.pass.length < 8) newErrors.pass = true;
    if (!form.agree) newErrors.agree = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isInvalid = (field: string) => {
    if (errors[field]) return true;
    const val = field === 'email' ? form.email : form.phone;
    if (val !== "") {
      if (field === 'email') return !emailRegex.test(val);
      if (field === 'phone') return !phoneRegex.test(val);
    }
    return false;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: form.email, 
          phone: form.phone, 
          password: form.pass, 
          fullName: form.name,
          role: 'CUSTOMER'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Đăng ký thất bại');
      }

      // Lưu token và user giống như login (tùy chọn)
      // localStorage.setItem('authToken', data.token);
      // localStorage.setItem('user', JSON.stringify(data.user));
      
      navigate("/login");
    } catch (err: any) {
      console.error("Signup error:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f4fbf1] content-stretch flex flex-col items-center relative size-full min-h-screen overflow-x-hidden">
      <HeaderTopAppBar onBack={() => navigate(-1)} title={t.headerTitle} />
      
      <div className="max-w-[576px] w-full px-[24px] pt-[96px] pb-[48px] flex flex-col gap-[30px]">
        {/* Main Title Area */}
        <div className="content-stretch flex flex-col gap-[8px] items-center py-[10px] relative shrink-0 w-full">
          <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold','Noto_Sans_JP:Black',sans-serif] font-extrabold h-[40px] justify-center leading-[0] relative shrink-0 text-[#171d17] text-[24px] text-center tracking-[-0.9px] w-full">
            <p className="leading-[40px]">{t.mainTitle}</p>
          </div>
          <div className="bg-[#006d37] h-[4px] relative rounded-[9999px] shrink-0 w-[64px]" />
        </div>

        {/* Signup Form Container */}
        <div className="bg-white p-[32px] rounded-[24px] shadow-lg flex flex-col gap-[32px]">
          {/* Full Name */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex justify-between items-center px-[4px]">
              <label className="font-bold text-[14px] text-[#171d17] uppercase">{t.nameLabel}</label>
            </div>
            <div className={`bg-[#eff6ec] relative rounded-[24px] flex items-center p-[16px] gap-[12px] border ${errors.name ? "border-red-500" : "border-transparent"}`}>
              <div className="size-[16px] shrink-0">
                <svg className="block size-full" fill="none" viewBox="0 0 16 16">
                  <path d={svgPaths.p85bff00} fill="#6D7A6E" />
                </svg>
              </div>
              <input 
                type="text" 
                placeholder={t.namePlaceholder}
                className="bg-transparent border-none outline-none w-full text-[16px] text-[#171d17] placeholder-[#bccabc]"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex justify-between items-center px-[4px]">
              <label className="font-bold text-[14px] text-[#171d17] uppercase">{t.emailLabel}</label>
            </div>
            <div className={`bg-[#eff6ec] relative rounded-[24px] flex items-center p-[16px] gap-[12px] border ${isInvalid('email') ? "border-red-500" : "border-transparent"}`}>
              <div className="size-[20px] shrink-0">
                <svg className="block size-full" fill="none" viewBox="0 0 20 16">
                  <path d={svgPaths.p13e73800} fill="#6D7A6E" />
                </svg>
              </div>
              <input 
                type="email" 
                placeholder={t.emailPlaceholder}
                className="bg-transparent border-none outline-none w-full text-[16px] text-[#171d17] placeholder-[#bccabc]"
                value={form.email}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({ ...form, email: val });
                  if (emailRegex.test(val)) setErrors((prev) => ({ ...prev, email: false }));
                }}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex justify-between items-center px-[4px]">
              <label className="font-bold text-[14px] text-[#171d17] uppercase">{t.phoneLabel}</label>
            </div>
            <div className={`bg-[#eff6ec] relative rounded-[24px] flex items-center p-[16px] gap-[12px] border ${isInvalid('phone') ? "border-red-500" : "border-transparent"}`}>
              <div className="size-[18px] shrink-0">
                <svg className="block size-full" fill="none" viewBox="0 0 18 18">
                  <path d={svgPaths.p143e1930} fill="#6D7A6E" />
                </svg>
              </div>
              <input 
                type="tel" 
                placeholder={t.phonePlaceholder}
                className="bg-transparent border-none outline-none w-full text-[16px] text-[#171d17] placeholder-[#bccabc]"
                value={form.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9+]/g, '');
                  setForm({ ...form, phone: val });
                  if (phoneRegex.test(val)) setErrors((prev) => ({ ...prev, phone: false }));
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex justify-between items-center px-[4px]">
              <label className="font-bold text-[14px] text-[#171d17] uppercase">{t.passLabel}</label>
            </div>
            <div className={`bg-[#eff6ec] relative rounded-[24px] flex items-center p-[16px] gap-[12px] border ${errors.pass ? "border-red-500" : "border-transparent"}`}>
              <div className="size-[16px] shrink-0">
                <svg className="block size-full" fill="none" viewBox="0 0 16 21">
                  <path d={svgPaths.p12930f00} fill="#6D7A6E" />
                </svg>
              </div>
              <input 
                type={showPass ? "text" : "password"} 
                placeholder={t.passPlaceholder}
                className="bg-transparent border-none outline-none w-full text-[16px] text-[#171d17] placeholder-[#bccabc]"
                value={form.pass}
                onChange={(e) => setForm({ ...form, pass: e.target.value })}
              />
              <button onClick={() => setShowPass(!showPass)} className="shrink-0 flex items-center justify-center text-[#6D7A6E] hover:text-[#006d37] transition-colors outline-none focus:outline-none">
                {showPass ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="flex gap-[12px] items-start py-[8px]">
            <button 
              onClick={() => setForm({ ...form, agree: !form.agree })}
              className={`size-[20px] rounded-[6px] shrink-0 border-2 transition-all flex items-center justify-center ${form.agree ? "bg-[#006d37] border-[#006d37]" : "bg-white border-[#bccabc]"}`}
            >
              {form.agree && (
                <svg className="size-[12px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <div className={`text-[14px] leading-[20px] ${errors.agree ? "text-red-500" : "text-[#171d17]"}`}>
              {t.agreeLabel}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-[16px] rounded-[24px] shadow-lg text-white font-bold text-[18px] transition-all active:scale-[0.98] hover:brightness-105 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            style={{ backgroundImage: "linear-gradient(141.147deg, rgb(0, 109, 55) 0%, rgb(39, 174, 96) 100%)" }}
          >
            {loading ? "..." : t.btnSubmit}
          </button>

          {/* Footer Link */}
          <div className="flex flex-col items-center gap-[4px]">
            <p className="text-[#3d4a3f] text-[16px]">{t.haveAccount}</p>
            <button onClick={() => navigate("/login")} className="text-[#006d37] font-bold text-[16px] hover:underline">{t.login}</button>
          </div>
        </div>
      </div>

      <div className="absolute bg-[rgba(39,174,96,0.2)] blur-[50px] right-[40px] rounded-[9999px] size-[128px] top-[80px] pointer-events-none" />
      <div className="absolute bg-[rgba(254,165,32,0.1)] blur-[60px] bottom-[80px] left-[40px] rounded-[9999px] size-[192px] pointer-events-none" />
    </div>
  );
}