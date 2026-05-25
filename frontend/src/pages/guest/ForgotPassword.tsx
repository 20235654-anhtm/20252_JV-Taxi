import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import svgPaths from "./svg-clvlrot69p";
import imgBackground from "./forgot-password-bg.png";

function Container2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p300a1100} fill="var(--fill-0, #006D37)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(-1)} className="content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px] hover:bg-[rgba(0,0,0,0.05)] transition-colors" data-name="Button">
      <Container2 />
    </button>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 1">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#006d37] text-[18px] w-[82px]">
        <p className="leading-[28px]">再設定</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Button />
      <Heading />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <Container1 />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#065f46] text-[20px] w-[84px]">
        <p className="leading-[28px]">JV - Taxi</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container5 />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container4 />
    </div>
  );
}

function HeaderTopNavigation() {
  return (
    <div className="backdrop-blur-[12px] bg-[rgba(244,251,241,0.8)] content-stretch flex h-[64px] items-center justify-between px-[24px] relative shrink-0 w-[390px]" data-name="Header - Top Navigation">
      <div className="absolute bg-[rgba(255,255,255,0.8)] h-[64px] left-0 shadow-[0px_32px_32px_-4px_rgba(23,29,23,0.06)] top-0 w-[390px]" data-name="Header - Top Navigation:shadow" />
      <Container />
      <Container3 />
    </div>
  );
}

function BackgroundIllustration() {
  return (
    <div className="flex-[1_0_0] min-h-px mix-blend-overlay opacity-60 relative w-full" data-name="Background Illustration">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[178.12%] left-0 max-w-none top-[-39.06%] w-full" src={imgBackground} />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0 size-[30px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="Container">
          <path d={svgPaths.p38da4c00} fill="var(--fill-0, #006D37)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background() {
  return (
    <div className="absolute bg-white content-stretch flex inset-[56px_131px] items-center justify-center rounded-[9999px]" data-name="Background">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[rgba(255,255,255,0)] left-1/2 rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[80px] top-1/2" data-name="Overlay+Shadow" />
      <Container7 />
    </div>
  );
}

function HeroIllustrationVisualAnchor() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex flex-col h-[192px] items-start justify-center overflow-clip relative rounded-[24px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-name="Hero Illustration/Visual Anchor">
      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(150.69deg, rgba(0, 109, 55, 0.2) 0%, rgba(39, 174, 96, 0.1) 100%)" }} data-name="Gradient" />
      <BackgroundIllustration />
      <Background />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 1">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:ExtraBold','Noto_Sans_JP:Black',sans-serif] font-extrabold justify-center leading-[0] relative shrink-0 text-[#171d17] text-[30px] tracking-[-0.75px] w-full">
        <p className="leading-[36px]">パスワードの再設定</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#3d4a3f] text-[14px] w-full">
        <p className="leading-[20px]">登録済みのメールアドレスを入力してください</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-60 relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#3d4a3f] text-[14px] w-full">
        <p className="leading-[20px]">パスワード再設定用のリンクをメールで送信します</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Container10 />
    </div>
  );
}

function ContentHeader() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start pt-[8px] relative shrink-0 w-full" data-name="Content Header">
      <Heading1 />
      <Container8 />
    </div>
  );
}

function Label() {
  return (
    <div className="relative shrink-0 w-full" data-name="Label">
      <div className="flex flex-row items-end size-full">
        <div className="content-stretch flex items-end pb-[2px] pt-[5px] px-[4px] relative size-full">
          <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[17px] justify-center leading-[0] relative shrink-0 text-[#3d4a3f] text-[11px] tracking-[1.1px] uppercase w-[101.67px]">
            <p className="leading-[16.5px]">メールアドレス</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[16px] text-[rgba(109,122,110,0.5)] w-full">
        <p className="leading-[normal]">your@email.com</p>
      </div>
    </div>
  );
}

function Input({ email, setEmail }: { email: string, setEmail: (val: string) => void }) {
  return (
    <div className="bg-[#eff6ec] relative rounded-[12px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center pb-[18px] pt-[17px] px-[24px] relative size-full">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com" 
            className="bg-transparent border-none outline-none w-full text-[16px] text-[#171d17] placeholder-[#bccabc]"
          />
        </div>
      </div>
    </div>
  );
}

function Container12({ email, setEmail }: { email: string, setEmail: (val: string) => void }) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Input email={email} setEmail={setEmail} />
      <div className="absolute bottom-[35.71%] right-[18.02px] top-[35.71%] w-[20px]" data-name="Icon">
        <div className="absolute inset-[0_0_-1.82%_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 16">
            <path d={svgPaths.p13e73800} fill="var(--fill-0, #6D7A6E)" fillOpacity="0.4" id="Icon" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container11({ email, setEmail }: { email: string, setEmail: (val: string) => void }) {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Container">
      <Label />
      <Container12 email={email} setEmail={setEmail} />
    </div>
  );
}

function Container15({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] relative shrink-0 text-[16px] text-center text-white w-[186px]">
        <p className="leading-[24px]">{isLoading ? '送信中...' : 'リセットリンクを送信'}</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[13.333px] relative shrink-0 w-[15.833px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.8333 13.3333">
        <g id="Container">
          <path d={svgPaths.pf594000} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ButtonPrimaryCta({ onSubmit, isLoading }: { onSubmit: () => void, isLoading: boolean }) {
  return (
    <button 
      onClick={onSubmit} 
      disabled={isLoading}
      className={`bg-gradient-to-r content-stretch flex from-[#006d37] gap-[8px] items-center justify-center py-[16px] relative rounded-[12px] shrink-0 to-[#27ae60] w-full transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-110 active:scale-[0.98] cursor-pointer'}`} 
      data-name="Button - Primary CTA"
    >
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(0,109,55,0.1),0px_4px_6px_-4px_rgba(0,109,55,0.1)] pointer-events-none" data-name="Button - Primary CTA:shadow" />
      <Container15 isLoading={isLoading} />
      <Container16 />
    </button>
  );
}

function Container14({ onSubmit, isLoading }: { onSubmit: () => void, isLoading: boolean }) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <ButtonPrimaryCta onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
}

function FormSection({ email, setEmail, onSubmit, isLoading }: { email: string, setEmail: (val: string) => void, onSubmit: () => void, isLoading: boolean }) {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full" data-name="Form Section">
      <Container11 email={email} setEmail={setEmail} />
      <Container14 onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
}

function Container6({ email, setEmail, onSubmit, isLoading }: { email: string, setEmail: (val: string) => void, onSubmit: () => void, isLoading: boolean }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[40px] items-start max-w-[448px] min-w-px relative" data-name="Container">
      <HeroIllustrationVisualAnchor />
      <ContentHeader />
      <FormSection email={email} setEmail={setEmail} onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
}

function Main({ email, setEmail, onSubmit, isLoading }: { email: string, setEmail: (val: string) => void, onSubmit: () => void, isLoading: boolean }) {
  return (
    <div className="min-h-screen relative shrink-0 w-full" data-name="Main">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center pb-[48px] pt-[80px] px-[24px] relative size-full">
          <Container6 email={email} setEmail={setEmail} onSubmit={onSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email) {
      alert("メールアドレスを入力してください。");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        navigate('/forgot-password/reset', { state: { email } });
      } else {
        navigate('/forgot-password/error');
      }
    } catch (error) {
      console.error('Error checking email:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f4fbf1] content-stretch flex flex-col items-start relative size-full min-h-screen" data-name="Forgot Password">
      <div className="absolute bg-[rgba(0,109,55,0.05)] blur-[32px] right-[-80px] rounded-[9999px] size-[256px] top-[191.75px]" data-name="Background Decoration for Zen Feel" />
      <div className="absolute bg-[rgba(254,165,32,0.05)] blur-[32px] bottom-[-7px] left-[-80px] rounded-[9999px] size-[320px]" data-name="Overlay+Blur" />
      <HeaderTopNavigation />
      <Main email={email} setEmail={setEmail} onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
