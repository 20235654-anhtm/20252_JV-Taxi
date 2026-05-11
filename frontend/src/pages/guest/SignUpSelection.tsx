import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import svgPaths from "./svg-opu3ry72jz";

const TRANSLATIONS = {
  JP: {
    title: "新しい旅を始めましょう",
    passengerTitle: "乗客として登録",
    passengerDesc: "ベトナムでの移動を、日本品質の安心と快適さで。",
    driverTitle: "ドライバーとして登録",
    driverDesc: "厳選されたドライバーチームに加わり、最高のおもてなしを。",
    haveAccount: "アカウントをお持ちですか? ",
    login: "ログイン",
    languageLabel: " 日本語",
  },
  VN: {
    title: "Bắt đầu hành trình mới",
    passengerTitle: "Đăng ký làm Hành khách",
    passengerDesc: "Di chuyển tại Việt Nam với sự an tâm và thoải mái chất lượng Nhật Bản.",
    driverTitle: "Đăng ký làm Tài xế",
    driverDesc: "Gia nhập đội ngũ tài xế chọn lọc và mang đến dịch vụ tận tâm nhất.",
    haveAccount: "Bạn đã có tài khoản? ",
    login: "Đăng nhập",
    languageLabel: " Tiếng Việt",
  },
};

function Heading1({ t }: { t: any }) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold','Noto_Sans_JP:Black',sans-serif] font-extrabold h-[103px] justify-center leading-[0] relative shrink-0 text-[#171d17] text-[36px] tracking-[-0.9px] w-full">
        <p className="leading-[40px]">{t.title}</p>
      </div>
    </div>
  );
}

function Container() {
  return <div className="h-[36px] relative shrink-0 w-full" data-name="Container" />;
}

function EditorialHeaderSection({ t }: { t: any }) {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Editorial Header Section">
      <Heading1 t={t} />
      <div className="bg-[#006d37] h-[4px] relative rounded-[9999px] shrink-0 w-[48px]" data-name="Background" />
      <Container />
    </div>
  );
}

function EditorialHeaderSectionMargin({ t }: { t: any }) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Editorial Header Section:margin">
      <EditorialHeaderSection t={t} />
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[25px] relative shrink-0 w-[18.75px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.75 25">
        <g id="Container">
          <path d={svgPaths.p20a1d598} fill="var(--fill-0, #005228)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#7efba4] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[64px]" data-name="Background">
      <Container1 />
    </div>
  );
}

function Heading2({ t }: { t: any }) {
  return (
    <div className="content-stretch flex flex-col items-start mr-[-7.4px] pr-[44.37px] relative shrink-0" data-name="Heading 3">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[64px] justify-center leading-[0] relative shrink-0 text-[#171d17] text-[24px] w-fit max-w-[200px]">
        <p className="leading-[32px]">{t.passengerTitle}</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Container" opacity="0">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #006D37)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ContainerCssTransform() {
  return (
    <div className="content-stretch flex flex-col h-[64px] items-start justify-center py-[20px] relative shrink-0" data-name="Container:css-transform">
      <Container4 />
    </div>
  );
}

function Container3({ t }: { t: any }) {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pr-[10px] relative size-full">
          <Heading2 t={t} />
          <ContainerCssTransform />
        </div>
      </div>
    </div>
  );
}

function Container5({ t }: { t: any }) {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(61,74,63,0.7)] w-full">
        <p className="leading-[22.75px]">{t.passengerDesc}</p>
      </div>
    </div>
  );
}

function Container2({ t }: { t: any }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px relative" data-name="Container">
      <Container3 t={t} />
      <Container5 t={t} />
    </div>
  );
}

function ButtonPassengerCard({ onClick, t }: { onClick: () => void; t: any }) {
  return (
    <button onClick={onClick} className="bg-white relative rounded-[24px] shadow-[0px_0px_0px_1px_rgba(188,202,188,0.15)] shrink-0 w-full text-left hover:brightness-95 transition-all active:scale-[0.98]" data-name="Button - Passenger Card">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[24px] items-center p-[32px] relative size-full">
          <Background />
          <div className="absolute bg-[rgba(0,109,55,0.05)] right-[-64px] rounded-[9999px] size-[128px] top-[-64px]" data-name="Overlay" />
          <Container2 t={t} />
        </div>
      </div>
    </button>
  );
}

function Container6() {
  return (
    <div className="h-[20px] relative shrink-0 w-[22.5px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.5 20">
        <g id="Container">
          <path d={svgPaths.pa032e20} fill="var(--fill-0, #663E00)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#ffddb9] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[64px]" data-name="Background">
      <Container6 />
    </div>
  );
}

function Heading3({ t }: { t: any }) {
  return (
    <div className="content-stretch flex flex-col items-start mr-[-7.4px] pr-[49.4px] relative shrink-0" data-name="Heading 3">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[64px] justify-center leading-[0] relative shrink-0 text-[#171d17] text-[24px] w-fit max-w-[200px]">
        <p className="leading-[32px]">{t.driverTitle}</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[12px] relative shrink-0 w-[7.4px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="Container" opacity="0">
          <path d={svgPaths.p28c84800} fill="var(--fill-0, #865300)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ContainerCssTransform1() {
  return (
    <div className="content-stretch flex flex-col h-[64px] items-start justify-center py-[20px] relative shrink-0" data-name="Container:css-transform">
      <Container9 />
    </div>
  );
}

function Container8({ t }: { t: any }) {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pr-[10px] relative size-full">
          <Heading3 t={t} />
          <ContainerCssTransform1 />
        </div>
      </div>
    </div>
  );
}

function Container10({ t }: { t: any }) {
  return (
    <div className="content-stretch flex flex-col items-start pt-[7.375px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[14px] text-[rgba(61,74,63,0.7)] w-full">
        <p className="leading-[22.75px]">{t.driverDesc}</p>
      </div>
    </div>
  );
}

function Container7({ t }: { t: any }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px relative" data-name="Container">
      <Container8 t={t} />
      <Container10 t={t} />
    </div>
  );
}

function ButtonDriverCard({ onClick, t }: { onClick: () => void; t: any }) {
  return (
    <button onClick={onClick} className="bg-white relative rounded-[24px] shadow-[0px_0px_0px_1px_rgba(188,202,188,0.15)] shrink-0 w-full text-left hover:brightness-95 transition-all active:scale-[0.98]" data-name="Button - Driver Card">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[24px] items-center p-[32px] relative size-full">
          <Background1 />
          <div className="absolute bg-[rgba(255,221,185,0.1)] right-[-64px] rounded-[9999px] size-[128px] top-[-64px]" data-name="Overlay" />
          <Container7 t={t} />
        </div>
      </div>
    </button>
  );
}

function SelectionCardsGrid({ onPassenger, onDriver, t }: { onPassenger: () => void; onDriver: () => void; t: any }) {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Selection Cards Grid">
      <ButtonPassengerCard onClick={onPassenger} t={t} />
      <ButtonDriverCard onClick={onDriver} t={t} />
    </div>
  );
}

function Container11({ onLogin, t }: { onLogin: () => void; t: any }) {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] relative shrink-0 text-[#3d4a3f] text-[14px] text-center w-full">
        <p>
          <span className="leading-[20px]">{t.haveAccount}</span>
          <button onClick={onLogin} className="font-['Plus_Jakarta_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[20px] text-[#006d37] hover:underline">{t.login}</button>
        </p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
        <g id="Container">
          <path d={svgPaths.p388e6c20} fill="var(--fill-0, #3D4A3F)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background2({ t }: { t: any }) {
  return (
    <div className="bg-[#e9f0e6] content-stretch flex gap-[8px] items-center px-[16px] py-[8px] relative rounded-[9999px] shrink-0" data-name="Background">
      <Container13 />
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] relative shrink-0 text-[#3d4a3f] text-[12px] text-center w-fit min-w-[43px]">
        <p className="leading-[16px]">{t.languageLabel}</p>
      </div>
    </div>
  );
}

function Container12({ t }: { t: any }) {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full" data-name="Container">
      <Background2 t={t} />
    </div>
  );
}

function SecondaryActionLanguageToggleArea({ onLogin, t }: { onLogin: () => void; t: any }) {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start pt-[48px] relative shrink-0 w-full" data-name="Secondary Action / Language Toggle Area">
      <Container11 onLogin={onLogin} t={t} />
      <Container12 t={t} />
    </div>
  );
}

function Main({ onPassenger, onDriver, onLogin, t }: { onPassenger: () => void; onDriver: () => void; onLogin: () => void; t: any }) {
  return (
    <div className="max-w-[672px] relative shrink-0 w-full" data-name="Main">
      <div className="content-stretch flex flex-col items-start justify-between max-w-[inherit] pb-[48px] pt-[96px] px-[24px] relative size-full">
        <EditorialHeaderSectionMargin t={t} />
        <SelectionCardsGrid onPassenger={onPassenger} onDriver={onDriver} t={t} />
        <SecondaryActionLanguageToggleArea onLogin={onLogin} t={t} />
      </div>
    </div>
  );
}

function Container15() {
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

function Button({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="content-stretch flex flex-col items-center justify-center p-[8px] relative rounded-[9999px] shrink-0 hover:bg-[rgba(0,109,55,0.05)] transition-all" data-name="Button">
      <Container15 />
    </button>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 1">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#006d37] text-[18px] tracking-[-0.45px] w-[115.45px]">
        <p className="leading-[28px]">JV - Taxi</p>
      </div>
    </div>
  );
}

function Container14({ onBack }: { onBack: () => void }) {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Button onClick={onBack} />
      <Heading />
    </div>
  );
}

function HeaderTopAppBarRenderedBasedOnSharedComponentsJson({ onBack }: { onBack: () => void }) {
  return (
    <div className="absolute backdrop-blur-[12px] bg-[rgba(255,255,255,0.8)] content-stretch flex h-[64px] items-center justify-between left-0 px-[24px] top-0 w-full z-50 border-b border-[rgba(0,0,0,0.05)]" data-name="Header - TopAppBar: Rendered based on Shared Components JSON">
      <Container14 onBack={onBack} />
    </div>
  );
}

export default function SignUpSelection() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const t = TRANSLATIONS[lang];

  const handleBack = () => navigate(-1);
  const handlePassenger = () => navigate("/signup/passenger");
  const handleDriver = () => navigate("/signup/driver");
  const handleLogin = () => navigate("/login");

  return (
    <div className="bg-[#f4fbf1] content-stretch flex flex-col items-start relative size-full min-h-screen" data-name="Sign Up Selection">
      <Main onPassenger={handlePassenger} onDriver={handleDriver} onLogin={handleLogin} t={t} />
      <HeaderTopAppBarRenderedBasedOnSharedComponentsJson onBack={handleBack} />
    </div>
  );
}

