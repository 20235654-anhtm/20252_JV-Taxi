import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import svgPaths from "./svg-d322lkxk63";

const TRANSLATIONS = {
  JP: {
    welcome: "お帰りなさいませ",
    guide: "サインインしてください",
    idLabel: "電話番号・メール",
    idPlaceholder: "e.g. +84 000 000",
    passLabel: "パスワード",
    passPlaceholder: "••••••••",
    forgotPass: "パスワードを忘れた方?",
    login: "ログイン",
    newUser: "初めてご利用の方はこちら?",
    createAccount: "アカウント作成",
    errorEmpty: "IDを入力してください。",
    errorInvalidId: "有効なメールアドレス（@を含む）または電話番号を入力してください。",
    errorPassShort: "パスワードは8文字以上で入力してください。",
    errorPassAlphanumeric: "パスワードは英数字で入力してください。",
    errorAuth: "パスワードが正しくありません。もう一度お試しください。",
  },
  VN: {
    welcome: "Mừng bạn quay lại",
    guide: "Vui lòng đăng nhập để tiếp tục",
    idLabel: "Số điện thoại hoặc Email",
    idPlaceholder: "VD: +84 000 000",
    passLabel: "Mật khẩu",
    passPlaceholder: "••••••••",
    forgotPass: "Quên mật khẩu?",
    login: "Đăng nhập",
    newUser: "Chưa có tài khoản?",
    createAccount: "Tạo tài khoản",
    errorAuth: "Mật khẩu không chính xác. Vui lòng thử lại.",
  },
};

function Container1() {
  return (
    <div className="h-[25.537px] relative shrink-0 w-[25.564px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25.5643 25.5371">
        <g id="Container">
          <path d={svgPaths.pdcb3700} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background() {
  return (
    <div className="content-stretch flex items-center justify-center py-[20px] relative rounded-[32px] shrink-0 w-[80px] z-10" style={{ backgroundImage: "linear-gradient(140.675deg, rgb(0, 109, 55) 0%, rgb(39, 174, 96) 100%)" }} data-name="Background">
      <div className="-translate-x-1/2 absolute bg-[rgba(255,255,255,0)] bottom-[-0.46px] left-1/2 rounded-[32px] shadow-[0px_20px_25px_-5px_rgba(0,109,55,0.2),0px_8px_10px_-6px_rgba(0,109,55,0.2)] top-0 w-[80px]" data-name="Overlay+Shadow" />
      <Container1 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center pt-[10px] relative shrink-0 w-full z-10" data-name="Heading 1">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold h-[40px] justify-center leading-[0] relative shrink-0 text-[#006d37] text-[36px] text-center tracking-[-1.8px] w-[165.58px]">
        <p className="leading-[40px]">JV - Taxi</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full z-10" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] relative shrink-0 text-[#3d4a3f] text-[16px] text-center tracking-[-0.4px] w-[241.8px]">
        <p className="leading-[24px]">Precision Hospitality • おもてなし</p>
      </div>
    </div>
  );
}

function BrandIdentitySection() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-full mb-[20px]" data-name="Brand Identity Section">
      <Background />
      <Heading />
      <Container2 />
    </div>
  );
}

function IdentityInput({ t, value, onChange, error }: { t: any; value: string; onChange: (v: string) => void; error: boolean }) {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Identity Input">
      <div className="relative shrink-0 w-full" data-name="Label">
        <div className="flex flex-row items-center px-[4px]">
          <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] text-[#3d4a3f] text-[12px] tracking-[1.2px] uppercase">
            <p className="leading-[16px]">{t.idLabel}</p>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
        <div className={`bg-[#e9f0e6] relative rounded-[24px] shrink-0 w-full transition-all duration-200 ${error ? "border border-[#FF0000] bg-[#FFEDED]" : "border border-transparent"}`} data-name="Input">
          <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex items-start justify-center pb-[18px] pl-[48px] pr-[16px] pt-[17px] relative size-full">
              <input
                type="text"
                className="bg-transparent border-none focus:outline-none font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[16px] text-[#3d4a3f] w-full placeholder:text-[rgba(109,122,110,0.6)]"
                placeholder={t.idPlaceholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={1000}
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-[21.33px] left-[19.33px] top-[21.33px] w-[13.333px]" data-name="Icon">
          <div className="absolute inset-[0_0_-8.11%_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 13.3333">
              <path d={svgPaths.pfeb5cc0} fill={error ? "#FF4D4F" : "#6D7A6E"} id="Icon" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordInput({ t, value, onChange, show, onToggleShow, error }: { t: any; value: string; onChange: (v: string) => void; show: boolean; onToggleShow: () => void; error: boolean }) {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Password Input">
      <div className="relative shrink-0 w-full" data-name="Label">
        <div className="flex flex-row items-center px-[4px]">
          <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] text-[#3d4a3f] text-[12px] tracking-[1.2px] uppercase">
            <p className="leading-[16px]">{t.passLabel}</p>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
        <div className={`bg-[#e9f0e6] relative rounded-[24px] shrink-0 w-full transition-all duration-200 ${error ? "border border-[#FF0000] bg-[#FFEDED]" : "border border-transparent"}`} data-name="Input">
          <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
            <div className="content-stretch flex items-start justify-center pb-[18px] pt-[17px] px-[48px] relative size-full">
              <input
                type={show ? "text" : "password"}
                className="bg-transparent border-none focus:outline-none font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal relative shrink-0 text-[16px] text-[#3d4a3f] w-full placeholder:text-[rgba(109,122,110,0.6)]"
                placeholder={t.passPlaceholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-[19.67px] left-[19.33px] top-[18.83px] w-[13.333px]" data-name="Icon">
          <div className="absolute inset-[0_0_-6.06%_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 17.5">
              <path d={svgPaths.p2eed4060} fill={error ? "#FF4D4F" : "#6D7A6E"} id="Icon" />
            </svg>
          </div>
        </div>
        <button type="button" className="absolute bottom-[22.17px] right-[16.83px] top-[21.33px] w-[18.333px]" data-name="Icon" onClick={onToggleShow}>
          <div className="absolute inset-[0_0_-8.7%_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3333 12.5">
              <path d={svgPaths.p2e870a60} fill={show ? "#006d37" : "#6D7A6E"} id="Icon" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}

function LanguageSwitcher({ lang, setLang }: { lang: "JP" | "VN"; setLang: (l: "JP" | "VN") => void }) {
  return (
    <div className="bg-[rgba(244,244,245,0.8)] content-stretch flex items-center p-[5px] relative rounded-[9999px] shrink-0" data-name="Language Switcher">
      <div aria-hidden="true" className="absolute border border-[rgba(192,201,187,0.1)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="bg-[rgba(255,255,255,0.5)] relative rounded-[9999px] shrink-0">
        <div className="flex gap-[2px] items-center p-[2px]">
          <button
            onClick={() => setLang("JP")}
            className={`px-[16px] py-[4px] rounded-[9999px] transition-all ${lang === "JP" ? "bg-[#1b5e20] text-white shadow-sm" : "text-[#41493e]"}`}
          >
            <span className="text-[11px] font-semibold">JP</span>
          </button>
          <button
            onClick={() => setLang("VN")}
            className={`px-[16px] py-[4px] rounded-[9999px] transition-all ${lang === "VN" ? "bg-[#1b5e20] text-white shadow-sm" : "text-[#41493e]"}`}
          >
            <span className="text-[11px] font-semibold">VN</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import { supabase } from "../../config/supabaseClient";

export default function SignIn() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = TRANSLATIONS[lang];

  const handleLogin = async () => {
    setError(null);

    if (!identifier || !password) {
      setError(t.errorAuth);
      return;
    }

    setLoading(true);
    try {
      // Supabase supports signing in with email. 
      // Note: Signing in with phone usually requires a different method or a custom function if phone is used as identifier.
      // For now, we assume email login as primary, or we can try to find the email associated with the phone first.
      
      let loginEmail = identifier;
      
      // Nếu identifier không phải email (không có @), thử tìm email tương ứng với số điện thoại trong bảng profiles
      if (!identifier.includes("@")) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("phone", identifier)
          .single();
        
        if (profileError || !profileData) {
          throw new Error(t.errorAuth);
        }
        
        // Lưu ý: Supabase auth.users không dễ dàng truy vấn email từ public.profiles mà không có admin key.
        // Tuy nhiên, nếu user đăng ký bằng email, họ nên đăng nhập bằng email.
        // Nếu user muốn đăng nhập bằng SĐT, chúng ta cần một cơ chế mapping.
        // Tạm thời để đơn giản, chúng ta thử đăng nhập trực tiếp.
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      if (authError) throw authError;

      // Lấy role từ bảng profiles
      const { data: profile, error: roleError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (roleError) throw roleError;

      console.log("Logged in successfully:", profile.role);

      if (profile.role === "CUSTOMER") {
        navigate("/passenger/home");
      } else if (profile.role === "DRIVER") {
        // Redirection for driver not implemented yet
        console.log("Driver logged in, staying on current page or home");
      }
    } catch (err: any) {
      setError(t.errorAuth);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f4fbf1] content-stretch flex flex-col items-start relative size-full min-h-screen overflow-x-hidden" data-name="Sign In">
      <div className="min-h-screen relative shrink-0 w-full flex flex-col">
        <div className="flex flex-col items-center justify-center p-[24px] pt-[80px] relative w-full flex-1">
          <div className="absolute bg-[rgba(0,109,55,0.05)] blur-[32px] inset-[-10%_70%_70%_-10%] rounded-[9999px]" data-name="Decorative" />
          <div className="absolute bg-[rgba(254,165,32,0.05)] blur-[32px] inset-[60%_-10%_-10%_60%] rounded-[9999px]" data-name="Decorative" />
          
          <div className="content-stretch flex flex-col items-start max-w-[448px] min-w-px relative w-full z-20">
            <BrandIdentitySection />
            
            <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.8)] relative rounded-[24px] shrink-0 w-full shadow-lg border border-[rgba(255,255,255,0.5)]">
              <div className="content-stretch flex flex-col gap-[32px] items-start pb-[32px] pt-[48px] px-[32px] relative size-full">
                <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
                  <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold text-[#171d17] text-[24px] tracking-[-0.6px] w-full">
                    <p className="leading-[32px]">{t.welcome}</p>
                  </div>
                  <div className="text-[#3d4a3f] text-[12px] opacity-70">
                    <p>{t.guide}</p>
                  </div>
                </div>

                <div className="content-stretch flex flex-col gap-[23.5px] items-start relative shrink-0 w-full">
                  <IdentityInput 
                    t={t} 
                    value={identifier} 
                    onChange={setIdentifier} 
                    error={errorField === "id" || errorField === "both"} 
                  />
                  <PasswordInput 
                    t={t} 
                    value={password} 
                    onChange={setPassword} 
                    show={showPassword} 
                    onToggleShow={() => setShowPassword(!showPassword)} 
                    error={errorField === "pass" || errorField === "both"}
                  />
                  
                  {error && (
                    <div className="flex items-start gap-[8px] w-full px-[4px]">
                      <div className="flex items-center gap-[4px]">
                        <span className="text-[#e11d48] text-[14px] leading-[20px] font-bold">ⓘ</span>
                        <p className="text-[#e11d48] text-[13px] font-medium leading-[20px]">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="relative shrink-0 w-full">
                    <div className="flex flex-row items-center justify-center">
                      <button className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] text-[#006d37] text-[12px]">
                        <p className="leading-[16px]">{t.forgotPass}</p>
                      </button>
                    </div>
                  </div>

                  <button onClick={handleLogin} className="bg-gradient-to-r from-[#006d37] to-[#27ae60] relative rounded-[24px] shrink-0 w-full hover:brightness-110 transition-all active:scale-[0.98]">
                    <div className="flex flex-row items-center justify-center p-[16px] gap-[8px]">
                      <span className="font-bold text-white text-[16px]">{t.login}</span>
                      <svg className="size-[14px]" fill="none" viewBox="0 0 13.5 13.5">
                        <path d={svgPaths.pad382c0} fill="white" />
                      </svg>
                    </div>
                  </button>
                </div>

                <div className="content-stretch flex flex-col gap-[16px] items-center pt-[32px] relative shrink-0 w-full border-t border-[rgba(188,202,188,0.15)]">
                  <div className="text-[#3d4a3f] text-[14px]">
                    <p>{t.newUser}</p>
                  </div>
                  <button 
                    onClick={() => navigate("/signup")}
                    className="bg-[#e9f0e6] border border-[rgba(0,109,55,0.1)] px-[33px] py-[13px] rounded-[9999px] text-[#006d37] font-bold text-[14px] hover:bg-[#dfe9dc] transition-all"
                  >
                    {t.createAccount}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute backdrop-blur-[12px] bg-[rgba(244,251,241,0.8)] flex h-[64px] items-center justify-end px-[24px] right-0 top-0 w-fit rounded-bl-[24px] z-50">
            <LanguageSwitcher lang={lang} setLang={setLang} />
          </div>
        </div>
      </div>
    </div>
  );
}
