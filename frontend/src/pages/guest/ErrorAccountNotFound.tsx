import { useNavigate } from "react-router-dom";
import svgPaths from "./svg-5qcrm89s9m";

function Container1() {
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
    <button onClick={() => navigate(-1)} className="content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px] hover:bg-[rgba(0,0,0,0.05)] transition-colors cursor-pointer" data-name="Button">
      <Container1 />
    </button>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 1">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#006d37] text-[18px] w-[192.34px]">
        <p className="leading-[28px]">エラー</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Button />
      <Heading />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#065f46] text-[20px] w-[84px]">
        <p className="leading-[28px]">JV - Taxi</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container3 />
    </div>
  );
}

function HeaderTopAppBarFragmentTransactionalState() {
  return (
    <div className="absolute backdrop-blur-[12px] bg-[rgba(244,251,241,0.8)] content-stretch flex h-[64px] items-center justify-between left-0 px-[24px] top-0 w-full z-10" data-name="Header - TopAppBar Fragment (Transactional State)">
      <div className="absolute bg-[rgba(255,255,255,0.8)] h-[64px] left-0 shadow-[0px_32px_32px_-4px_rgba(23,29,23,0.06)] top-0 w-full" data-name="Header - TopAppBar Fragment (Transactional State):shadow" />
      <Container />
      <Container2 />
    </div>
  );
}

function Heading2TypographyContent() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-0 top-[34px]" data-name="Heading 2 - Typography Content">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold justify-center leading-[0] relative shrink-0 text-[#171d17] text-[30px] text-center tracking-[-0.75px] w-[272px]">
        <p className="leading-[37.5px]">アカウントが見つかりません</p>
      </div>
    </div>
  );
}

function Heading2TypographyContentMargin() {
  return (
    <div className="absolute h-[53.5px] left-[35px] top-[118px] w-[271.27px]" data-name="Heading 2 - Typography Content:margin">
      <Heading2TypographyContent />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['WenQuanYi_Zen_Hei:Medium',sans-serif] h-[40px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(61,74,63,0.7)] text-center w-[326.92px]">
        <p className="leading-[20px] mb-0">アカウントが見つかりません。入力内容を確認する</p>
        <p className="leading-[20px]">か、新しくアカウントを作成してください。</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[326.92px]" data-name="Container">
      <Container6 />
    </div>
  );
}

function Margin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[8px] pb-[48px] top-[267px]" data-name="Margin">
      <Container5 />
    </div>
  );
}

function Container7() {
  return (
    <div className="h-[52px] relative shrink-0 w-[54.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 54.6667 52">
        <g id="Container">
          <path d={svgPaths.p10347700} fill="var(--fill-0, #BA1A1A)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ErrorIconContainerWithGlassmorphism() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center p-[24px] relative rounded-[40px] shrink-0" data-name="Error Icon Container with Glassmorphism">
      <div className="absolute bg-[rgba(255,255,255,0)] inset-[0_-0.33px_0_0] rounded-[40px] shadow-[0px_24px_48px_-12px_rgba(0,0,0,0.08)]" data-name="Error Icon Container with Glassmorphism:shadow" />
      <Container7 />
      <div className="absolute bg-[rgba(186,26,26,0.05)] inset-[0_-0.33px_0_0] rounded-[40px]" data-name="Overlay" />
    </div>
  );
}

function ErrorIconContainerWithGlassmorphismMargin() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[115px] pb-[32px] top-0" data-name="Error Icon Container with Glassmorphism:margin">
      <ErrorIconContainerWithGlassmorphism />
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p3e942640} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ButtonPrimaryActionTryAgain() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate("/forgot-password")} className="bg-gradient-to-r from-[#006d37] relative rounded-[12px] shrink-0 to-[#27ae60] w-full hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer" data-name="Button - Primary Action: Try Again">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center px-[24px] py-[16px] relative size-full">
          <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" data-name="Button - Primary Action: Try Again:shadow" />
          <Container8 />
          <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[18px] text-center text-white w-[125px]">
            <p className="leading-[28px]">もう一度試す</p>
          </div>
        </div>
      </div>
    </button>
  );
}

function Container9() {
  return (
    <div className="h-[16px] relative shrink-0 w-[22px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 16">
        <g id="Container">
          <path d={svgPaths.pe7a2f00} fill="var(--fill-0, #694000)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ButtonSecondaryActionCreateAccount() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate("/signup")} className="bg-[#fea520] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] relative rounded-[12px] shrink-0 w-full hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer" data-name="Button - Secondary Action: Create Account">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[7.99px] items-center justify-center px-[24px] py-[16px] relative size-full">
          <Container9 />
          <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#694000] text-[18px] text-center w-[175px]">
            <p className="leading-[28px]">新規アカウント作成</p>
          </div>
        </div>
      </div>
    </button>
  );
}

function ButtonTertiaryLink() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate("/forgot-password")} className="content-stretch flex flex-col items-center justify-center px-[50px] py-[8px] relative shrink-0 w-[338px] hover:bg-[rgba(0,0,0,0.05)] transition-colors rounded-[12px] cursor-pointer" data-name="Button - Tertiary Link">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[#006d37] text-[14px] text-center w-[238px]">
        <p className="leading-[20px]">パスワードをお忘れですか？</p>
      </div>
    </button>
  );
}

function ButtonTertiaryLinkMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[16px] relative shrink-0" data-name="Button - Tertiary Link:margin">
      <ButtonTertiaryLink />
    </div>
  );
}

function ActionCluster() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 right-0 top-[360px]" data-name="Action Cluster">
      <ButtonPrimaryActionTryAgain />
      <ButtonSecondaryActionCreateAccount />
      <ButtonTertiaryLinkMargin />
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[564px] max-w-[448px] relative shrink-0 w-full" data-name="Container">
      <Heading2TypographyContentMargin />
      <Margin />
      <ErrorIconContainerWithGlassmorphismMargin />
      <ActionCluster />
    </div>
  );
}

function Main() {
  return (
    <div className="min-h-screen relative shrink-0 w-full" data-name="Main">
      <div className="flex flex-col items-center justify-center min-h-[inherit] overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-center justify-center min-h-[inherit] pb-[176px] pt-[144px] px-[24px] relative size-full">
          <div className="absolute bg-[rgba(0,109,55,0.05)] blur-[60px] inset-[-10%_70%_70%_-10%] rounded-[9999px]" data-name="Subtle Zen Background Textures" />
          <div className="absolute bg-[rgba(254,165,32,0.1)] blur-[60px] inset-[60%_-10%_-10%_60%] rounded-[9999px]" data-name="Overlay+Blur" />
          <Container4 />
        </div>
      </div>
    </div>
  );
}

export default function ErrorAccountNotFound() {
  return (
    <div className="bg-[#f4fbf1] content-stretch flex flex-col items-start relative size-full min-h-screen" data-name="Error: Account Not Found">
      <HeaderTopAppBarFragmentTransactionalState />
      <Main />
    </div>
  );
}
