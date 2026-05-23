import { useNavigate } from "react-router-dom";
import svgPaths from "./svg-9fmz9pngew";

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-center pb-[0.75px] relative shrink-0 w-full" data-name="Heading 2">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:ExtraBold','Noto_Sans_JP:Black',sans-serif] font-extrabold h-[75px] justify-center leading-[0] relative shrink-0 text-[#171d17] text-[30px] text-center tracking-[-0.75px] w-[330px]">
        <p className="leading-[37.5px]">パスワードのリセットが完了しました</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[69px] justify-center leading-[0] relative shrink-0 text-[#3d4a3f] text-[14px] text-center w-[246px]">
        <p className="leading-[22.75px]">パスワードの再設定が完了しました。新しいパスワードでログインしてサービスをご利用ください。</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#e9f0e6] relative rounded-[24px] shrink-0 w-full" data-name="Background">
      <div className="content-stretch flex flex-col items-start pb-[16px] pt-[15.25px] px-[32px] relative size-full">
        <Container />
      </div>
    </div>
  );
}

function TypographyCluster() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 top-[-0.75px] w-[330px]" data-name="Typography Cluster">
      <Heading1 />
      <Background />
    </div>
  );
}

function TypographyClusterMargin() {
  return (
    <div className="absolute h-[283.25px] left-[24px] top-[255.62px] w-[342px]" data-name="Typography Cluster:margin">
      <TypographyCluster />
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0 size-[50px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
        <g id="Container">
          <path d={svgPaths.p19573800} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Background1() {
  return (
    <div className="content-stretch flex items-center justify-center relative rounded-[40px] size-[128px]" style={{ backgroundImage: "linear-gradient(45deg, rgb(0, 109, 55) 0%, rgb(39, 174, 96) 100%)" }} data-name="Background">
      <div className="absolute bg-[rgba(255,255,255,0)] left-0 rounded-[40px] shadow-[0px_24px_48px_-12px_rgba(0,109,55,0.3)] size-[128px] top-0" data-name="Overlay+Shadow" />
      <Container1 />
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[20.5px] relative shrink-0 w-[21.55px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.55 20.5">
        <g id="Container">
          <path d={svgPaths.p3a772f00} fill="var(--fill-0, #694000)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function FloatingDecorativeElement() {
  return (
    <div className="bg-[#fea520] content-stretch flex items-center justify-center relative rounded-[16px] size-[48px]" data-name="Floating Decorative Element">
      <div className="absolute bg-[rgba(255,255,255,0)] right-0 rounded-[16px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[48px] top-0" data-name="Floating Decorative Element:shadow" />
      <Container2 />
    </div>
  );
}

function AbstractSuccessVisual() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[-3.26px] top-[-3.27px]" data-name="Abstract Success Visual">
      <div className="absolute flex inset-[-28.73px_-28.74px_-28.75px_-28.74px] items-center justify-center" style={{ containerType: "size" }}>
        <div className="flex-none h-[100cqh] w-[100cqw]">
          <div className="bg-[rgba(39,174,96,0.2)] blur-[32px] relative rounded-[9999px] size-full" data-name="Animated-like background elements using CSS gradients" />
        </div>
      </div>
      <div className="flex items-center justify-center relative shrink-0 size-[134.524px]">
        <div className="flex-none rotate-3">
          <Background1 />
        </div>
      </div>
      <div className="absolute flex items-center justify-center right-[-17.2px] size-[56.931px] top-[-17.2px]">
        <div className="-rotate-12 flex-none">
          <FloatingDecorativeElement />
        </div>
      </div>
    </div>
  );
}

function AbstractSuccessVisualMargin() {
  return (
    <div className="absolute h-[176px] left-[131px] top-[80px] w-[128px]" data-name="Abstract Success Visual:margin">
      <AbstractSuccessVisual />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-[183px]" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[18px] text-center text-white w-[176px]">
        <p className="leading-[28px]">ログイン画面へ戻る</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.p3dbaa380} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate("/login")} className="bg-gradient-to-r content-stretch flex from-[#006d37] gap-[12px] h-[64px] items-center justify-center relative rounded-[24px] shrink-0 to-[#27ae60] w-full hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer" data-name="Button">
      <div className="absolute bg-[rgba(255,255,255,0)] h-[64px] left-0 right-0 rounded-[24px] shadow-[0px_12px_24px_-8px_rgba(0,109,55,0.4)] top-0" data-name="Button:shadow" />
      <Container3 />
      <Container4 />
    </button>
  );
}

function Button1() {
  return (
    <button className="content-stretch flex h-[56px] items-center justify-center pb-[16.5px] pt-[15.5px] relative rounded-[24px] shrink-0 w-full hover:bg-[rgba(0,109,55,0.05)] transition-colors cursor-pointer" data-name="Button">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[24px] justify-center leading-[0] relative shrink-0 text-[#006d37] text-[16px] text-center w-[259.08px]">
        <p className="leading-[24px]">サポートに連絡</p>
      </div>
    </button>
  );
}

function CallToAction() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col gap-[16px] items-start left-[24px] right-[24px] top-[calc(50%+229.25px)]" data-name="Call to Action">
      <Button />
      <Button1 />
    </div>
  );
}

function MainContentCanvas() {
  return (
    <div className="h-[726px] max-w-[512px] relative shrink-0 w-full" data-name="Main Content Canvas">
      <TypographyClusterMargin />
      <AbstractSuccessVisualMargin />
      <CallToAction />
    </div>
  );
}

function Container6() {
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

function Button2() {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate("/login")} className="content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[40px] hover:bg-[rgba(0,0,0,0.05)] transition-colors cursor-pointer" data-name="Button">
      <Container6 />
    </button>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 1">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#006d37] text-[18px] w-[192.34px]">
        <p className="leading-[28px]">完了</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Button2 />
      <Heading />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#065f46] text-[20px] w-[84px]">
        <p className="leading-[28px]">JV - Taxi</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container8 />
    </div>
  );
}

function HeaderTopAppBarFragmentTransactionalState() {
  return (
    <div className="absolute backdrop-blur-[12px] bg-[rgba(244,251,241,0.8)] content-stretch flex h-[64px] items-center justify-between left-0 px-[24px] top-0 w-full z-10" data-name="Header - TopAppBar Fragment (Transactional State)">
      <div className="absolute bg-[rgba(255,255,255,0.8)] h-[64px] left-0 shadow-[0px_32px_32px_-4px_rgba(23,29,23,0.06)] top-0 w-full" data-name="Header - TopAppBar Fragment (Transactional State):shadow" />
      <Container5 />
      <Container7 />
    </div>
  );
}

export default function ForgotPasswordSuccess() {
  return (
    <div className="bg-[#f4fbf1] content-stretch flex flex-col items-center justify-center pt-[64.38px] relative size-full min-h-screen" data-name="Forgot Password: Success">
      <MainContentCanvas />
      <HeaderTopAppBarFragmentTransactionalState />
    </div>
  );
}
