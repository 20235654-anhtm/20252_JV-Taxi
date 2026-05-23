import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import svgPaths from "./svg-8ue7f4xm4b";

function Container() {
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
    <div className="bg-[#e3eae0] content-stretch flex items-center justify-center py-[20px] relative rounded-[24px] shrink-0 w-[80px]" data-name="Background">
      <Container />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-center pt-[16px] relative shrink-0 w-full" data-name="Heading 2">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:ExtraBold','Noto_Sans_JP:Black',sans-serif] font-extrabold h-[36px] justify-center leading-[0] relative shrink-0 text-[#171d17] text-[30px] text-center tracking-[-0.75px] w-[310.75px]">
        <p className="leading-[36px]">パスワードの再設定</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-center pt-[8px] relative shrink-0 w-full" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[48px] justify-center leading-[0] relative shrink-0 text-[#3d4a3f] text-[16px] text-center w-[328px]">
        <p className="leading-[24px]">安全のため、過去に使用したパスワードとは</p>
      </div>
    </div>
  );
}

function HeroHeader() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full" data-name="Hero Header">
      <Background />
      <Heading1 />
      <Container1 />
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex flex-col items-start px-[4px] relative shrink-0" data-name="Label">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[#171d17] text-[14px] w-[114px]">
        <p className="leading-[20px]">新しいパスワード</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Container">
      <Label />
    </div>
  );
}

function Input({ value, onChange, showPassword, onTogglePassword }: {
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
}) {
  return (
    <div className="bg-white h-[56px] relative rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center px-[16px] py-[17.5px] relative size-full">
          <input
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-[1_0_0] min-w-px font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal text-[16px] text-[#171d17] bg-transparent border-none outline-none"
            placeholder="••••••••"
          />
        </div>
      </div>
    </div>
  );
}

function Container3({ value, onChange, showPassword, onTogglePassword }: {
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
}) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Input value={value} onChange={onChange} showPassword={showPassword} onTogglePassword={onTogglePassword} />
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute bottom-[37.5%] right-[17.02px] top-[35.71%] w-[22px] cursor-pointer bg-transparent border-none"
        data-name="Icon"
      >
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
          <path d={svgPaths.p3e801e80} fill={showPassword ? "var(--fill-0, #006D37)" : "var(--fill-0, #6D7A6E)"} id="Icon" />
        </svg>
      </button>
    </div>
  );
}

function Container5({ strength }: { strength: number }) {
  return (
    <div className="content-stretch flex gap-[6px] h-[6px] items-start justify-center relative shrink-0 w-full" data-name="Container">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className={`flex-[1_0_0] h-full min-w-px relative rounded-[9999px] ${
            index < strength ? 'bg-[#006d37]' : 'bg-[#dde5db]'
          }`}
          data-name="Background"
        />
      ))}
    </div>
  );
}

function Container7({ strength }: { strength: number }) {
  const labels = ['パスワード強度：', 'パスワード強度：弱', 'パスワード強度：中', 'パスワード強度：強', 'パスワード強度：最強'];
  const colors = ['text-[#3d4a3f]', 'text-[#dc2626]', 'text-[#f59e0b]', 'text-[#84cc16]', 'text-[#006d37]'];

  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className={`[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[16px] justify-center leading-[0] relative shrink-0 ${colors[strength]} text-[12px] w-[126px]`}>
        <p className="leading-[16px]">{labels[strength]}</p>
      </div>
    </div>
  );
}

function Container6({ strength }: { strength: number }) {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container7 strength={strength} />
    </div>
  );
}

function PasswordStrengthIndicator({ strength }: { strength: number }) {
  return (
    <div className="relative shrink-0 w-full" data-name="Password Strength Indicator">
      <div className="content-stretch flex flex-col gap-[8px] items-start pt-[8px] px-[4px] relative size-full">
        <Container5 strength={strength} />
        <Container6 strength={strength} />
      </div>
    </div>
  );
}

function NewPasswordField({ value, onChange, showPassword, onTogglePassword, strength }: {
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  strength: number;
}) {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="New Password Field">
      <Container2 />
      <Container3 value={value} onChange={onChange} showPassword={showPassword} onTogglePassword={onTogglePassword} />
      <PasswordStrengthIndicator strength={strength} />
    </div>
  );
}

function Label1({ error }: { error?: boolean }) {
  return (
    <div className="content-stretch flex flex-col items-start px-[4px] relative shrink-0" data-name="Label">
      <div className={`[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 ${error ? 'text-red-500' : 'text-[#171d17]'} text-[14px] w-[158.31px]`}>
        <p className="leading-[20px]">パスワードの再入力</p>
      </div>
    </div>
  );
}

function Container9() {
  return <div className="h-[15px] relative shrink-0 w-[85.17px]" data-name="Container" />;
}

function Container8({ error }: { error?: boolean }) {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full" data-name="Container">
      <Label1 error={error} />
      <Container9 />
    </div>
  );
}

function Input1({ value, onChange, showPassword, onTogglePassword, error }: {
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  error?: boolean;
}) {
  return (
    <div className={`bg-white h-[56px] relative rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-full ${error ? 'border border-red-500' : ''}`} data-name="Input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center px-[16px] py-[17.5px] relative size-full">
          <input
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-[1_0_0] min-w-px font-['Plus_Jakarta_Sans:Regular',sans-serif] font-normal text-[16px] text-[#171d17] bg-transparent border-none outline-none"
            placeholder="••••••••"
          />
        </div>
      </div>
    </div>
  );
}

function Container10({ value, onChange, showPassword, onTogglePassword, error }: {
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  error?: boolean;
}) {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Input1 value={value} onChange={onChange} showPassword={showPassword} onTogglePassword={onTogglePassword} error={error} />
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute bottom-[37.5%] right-[17.02px] top-[35.71%] w-[22px] cursor-pointer bg-transparent border-none"
        data-name="Icon"
      >
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 15">
          <path d={svgPaths.p3e801e80} fill={showPassword ? "var(--fill-0, #006D37)" : "var(--fill-0, #6D7A6E)"} id="Icon" />
        </svg>
      </button>
    </div>
  );
}

function ConfirmPasswordField({ value, onChange, showPassword, onTogglePassword, error }: {
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  error?: boolean;
}) {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Confirm Password Field">
      <Container8 error={error} />
      <Container10 value={value} onChange={onChange} showPassword={showPassword} onTogglePassword={onTogglePassword} error={error} />
      {error && <span className="text-red-500 text-sm px-1 font-['Plus_Jakarta_Sans:Medium',sans-serif]">パスワードが一致しません</span>}
    </div>
  );
}

function Heading2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#3d4a3f] text-[12px] tracking-[1.2px] uppercase w-full">
        <p className="leading-[16px]">パスワードの要件</p>
      </div>
    </div>
  );
}

function Container14({ isValid }: { isValid: boolean }) {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
        <g id="Container">
          <path d={isValid ? svgPaths.p3cf2be00 : svgPaths.p24dc5920} fill={isValid ? "var(--fill-0, #006D37)" : "var(--fill-0, #3D4A3F)"} fillOpacity={isValid ? "1" : "0.4"} id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container15({ isValid }: { isValid: boolean }) {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[74.19px]" data-name="Container">
      <div className={`-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium h-[17px] justify-center leading-[0] left-0 ${isValid ? 'text-[#006d37]' : 'text-[rgba(61,74,63,0.4)]'} text-[11px] top-[7.5px] w-[74.19px]`}>
        <p className="leading-[16.5px]">8文字以上</p>
      </div>
    </div>
  );
}

function Container13({ isValid }: { isValid: boolean }) {
  return (
    <div className="col-1 content-stretch flex gap-[8px] h-[20px] items-center justify-self-stretch relative row-1 shrink-0" data-name="Container">
      <Container14 isValid={isValid} />
      <Container15 isValid={isValid} />
    </div>
  );
}

function Container17({ isValid }: { isValid: boolean }) {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
        <g id="Container">
          <path d={isValid ? svgPaths.p3cf2be00 : svgPaths.p24dc5920} fill={isValid ? "var(--fill-0, #006D37)" : "var(--fill-0, #3D4A3F)"} fillOpacity={isValid ? "1" : "0.4"} id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container18({ isValid }: { isValid: boolean }) {
  return (
    <div className="h-[16px] relative shrink-0 w-[113px]" data-name="Container">
      <div className={`-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium h-[17px] justify-center leading-[0] left-[0.33px] ${isValid ? 'text-[#006d37]' : 'text-[rgba(61,74,63,0.4)]'} text-[11px] top-[7.5px] w-[84px]`}>
        <p className="leading-[16.5px]">数字1文字以上</p>
      </div>
    </div>
  );
}

function Container16({ isValid }: { isValid: boolean }) {
  return (
    <div className="col-2 content-stretch flex gap-[8px] h-[20px] items-center justify-self-stretch relative row-1 shrink-0" data-name="Container">
      <Container17 isValid={isValid} />
      <Container18 isValid={isValid} />
    </div>
  );
}

function Container20({ isValid }: { isValid: boolean }) {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
        <g id="Container">
          <path d={isValid ? svgPaths.p3cf2be00 : svgPaths.p24dc5920} fill={isValid ? "var(--fill-0, #006D37)" : "var(--fill-0, #3D4A3F)"} fillOpacity={isValid ? "1" : "0.4"} id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container21({ isValid }: { isValid: boolean }) {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[65.09px]" data-name="Container">
      <div className={`-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium h-[17px] justify-center leading-[0] left-0 ${isValid ? 'text-[#006d37]' : 'text-[rgba(61,74,63,0.4)]'} text-[11px] top-[7.5px] w-[65.09px]`}>
        <p className="leading-[16.5px]">記号1文字以上</p>
      </div>
    </div>
  );
}

function Container19({ isValid }: { isValid: boolean }) {
  return (
    <div className="col-1 content-stretch flex gap-[8px] h-[20px] items-center justify-self-stretch relative row-2 shrink-0" data-name="Container">
      <Container20 isValid={isValid} />
      <Container21 isValid={isValid} />
    </div>
  );
}

function Container23({ isValid }: { isValid: boolean }) {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
        <g id="Container">
          <path d={isValid ? svgPaths.p3cf2be00 : svgPaths.p24dc5920} fill={isValid ? "var(--fill-0, #006D37)" : "var(--fill-0, #3D4A3F)"} fillOpacity={isValid ? "1" : "0.4"} id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container24({ isValid }: { isValid: boolean }) {
  return (
    <div className="h-[16.5px] relative shrink-0 w-[77px]" data-name="Container">
      <div className={`-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium h-[17px] justify-center leading-[0] left-[0.33px] text-[11px] ${isValid ? 'text-[#006d37]' : 'text-[rgba(61,74,63,0.4)]'} top-[7.75px] w-[111px]`}>
        <p className="leading-[16.5px]">大文字と小文字を区別</p>
      </div>
    </div>
  );
}

function Container22({ isValid }: { isValid: boolean }) {
  return (
    <div className="col-2 content-stretch flex gap-[8px] h-[20px] items-center justify-self-stretch relative row-2 shrink-0" data-name="Container">
      <Container23 isValid={isValid} />
      <Container24 isValid={isValid} />
    </div>
  );
}

function Container12({ requirements }: { requirements: { hasLength: boolean; hasNumber: boolean; hasSpecial: boolean; hasMixedCase: boolean } }) {
  return (
    <div className="gap-x-[12px] gap-y-[12px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[__20px_20px] relative shrink-0 w-full" data-name="Container">
      <Container13 isValid={requirements.hasLength} />
      <Container16 isValid={requirements.hasNumber} />
      <Container19 isValid={requirements.hasSpecial} />
      <Container22 isValid={requirements.hasMixedCase} />
    </div>
  );
}

function PasswordRequirementsBentoStyleInfo({ requirements }: { requirements: { hasLength: boolean; hasNumber: boolean; hasSpecial: boolean; hasMixedCase: boolean } }) {
  return (
    <div className="bg-[#eff6ec] relative rounded-[24px] shrink-0 w-full" data-name="Password Requirements - Bento Style Info">
      <div className="content-stretch flex flex-col gap-[12px] items-start p-[20px] relative size-full">
        <Heading2 />
        <Container12 requirements={requirements} />
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p1a406200} fill="var(--fill-0, #694000)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function ResetButton({ onSubmit, isLoading }: { onSubmit: () => void, isLoading: boolean }) {
  return (
    <button onClick={onSubmit} disabled={isLoading} className={`bg-[#fea520] content-stretch flex gap-[12px] h-[64px] items-center justify-center pb-[18.5px] pt-[17.5px] relative rounded-[24px] shrink-0 w-full transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-110 active:scale-[0.98] cursor-pointer'}`} data-name="Reset Button">
      <div className="absolute bg-[rgba(255,255,255,0)] h-[64px] left-0 right-0 rounded-[24px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] top-0" data-name="Reset Button:shadow" />
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#694000] text-[18px] text-center w-[185px]">
        <p className="leading-[28px]">{isLoading ? '送信中...' : 'パスワードを更新する'}</p>
      </div>
      <Container25 />
    </button>
  );
}

function FormSection({
  newPassword,
  confirmPassword,
  showNewPassword,
  showConfirmPassword,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onToggleNewPassword,
  onToggleConfirmPassword,
  strength,
  requirements,
  onSubmit,
  error,
  isLoading
}: {
  newPassword: string;
  confirmPassword: string;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onToggleNewPassword: () => void;
  onToggleConfirmPassword: () => void;
  strength: number;
  requirements: { hasLength: boolean; hasNumber: boolean; hasSpecial: boolean; hasMixedCase: boolean };
  onSubmit: () => void;
  error: boolean;
  isLoading: boolean;
}) {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Form Section">
      <NewPasswordField
        value={newPassword}
        onChange={onNewPasswordChange}
        showPassword={showNewPassword}
        onTogglePassword={onToggleNewPassword}
        strength={strength}
      />
      <ConfirmPasswordField
        value={confirmPassword}
        onChange={onConfirmPasswordChange}
        showPassword={showConfirmPassword}
        onTogglePassword={onToggleConfirmPassword}
        error={error}
      />
      <PasswordRequirementsBentoStyleInfo requirements={requirements} />
      <ResetButton onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
}

function Main({
  newPassword,
  confirmPassword,
  showNewPassword,
  showConfirmPassword,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onToggleNewPassword,
  onToggleConfirmPassword,
  strength,
  requirements,
  onSubmit,
  error,
  isLoading
}: {
  newPassword: string;
  confirmPassword: string;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onToggleNewPassword: () => void;
  onToggleConfirmPassword: () => void;
  strength: number;
  requirements: { hasLength: boolean; hasNumber: boolean; hasSpecial: boolean; hasMixedCase: boolean };
  onSubmit: () => void;
  error: boolean;
  isLoading: boolean;
}) {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-start max-w-[448px] pb-[16px] relative shrink-0 w-full" data-name="Main">
      <HeroHeader />
      <FormSection
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        showNewPassword={showNewPassword}
        showConfirmPassword={showConfirmPassword}
        onNewPasswordChange={onNewPasswordChange}
        onConfirmPasswordChange={onConfirmPasswordChange}
        onToggleNewPassword={onToggleNewPassword}
        onToggleConfirmPassword={onToggleConfirmPassword}
        strength={strength}
        requirements={requirements}
        onSubmit={onSubmit}
        error={error}
        isLoading={isLoading}
      />
    </div>
  );
}

function Container28() {
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
      <Container28 />
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

function Container27() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Button />
      <Heading />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Container">
      <Container27 />
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="[word-break:break-word] flex flex-col font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#065f46] text-[20px] w-[84px]">
        <p className="leading-[28px]">JV - Taxi</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container31 />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container30 />
    </div>
  );
}

function HeaderTopNavigation() {
  return (
    <div className="absolute backdrop-blur-[12px] bg-[rgba(244,251,241,0.8)] content-stretch flex h-[64px] items-center justify-between left-0 px-[24px] top-0 w-full z-10" data-name="Header - Top Navigation">
      <div className="absolute bg-[rgba(255,255,255,0.8)] h-[64px] left-0 shadow-[0px_32px_32px_-4px_rgba(23,29,23,0.06)] top-0 w-full" data-name="Header - Top Navigation:shadow" />
      <Container26 />
      <Container29 />
    </div>
  );
}

export default function ForgotPasswordReset() {
  const location = useLocation();
  const email = location.state?.email;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  // Check password requirements
  const hasLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const hasMixedCase = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);

  const requirements = {
    hasLength,
    hasNumber,
    hasSpecial,
    hasMixedCase
  };

  // Calculate strength (0-4 based on requirements met)
  const strength = [hasLength, hasNumber, hasSpecial, hasMixedCase].filter(Boolean).length;

  const error = isSubmitted && newPassword !== confirmPassword;

  const handleSubmit = async () => {
    setIsSubmitted(true);
    if (newPassword && newPassword === confirmPassword) {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword })
        });
        
        if (response.ok) {
          navigate('/forgot-password/success');
        } else {
          const data = await response.json();
          alert(data.message || 'エラーが発生しました。');
        }
      } catch (err) {
        console.error('Reset password error:', err);
        alert('エラーが発生しました。もう一度お試しください。');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-[#f4fbf1] content-stretch flex flex-col items-center pb-[48px] pt-[96px] px-[24px] relative size-full min-h-screen" data-name="Forgot Password: Reset">
      <div className="absolute bg-[rgba(0,109,55,0.05)] blur-[32px] bottom-[20px] right-[-96px] rounded-[9999px] size-[384px] pointer-events-none" data-name="Illustrative Background Element" />
      <div className="absolute bg-[rgba(254,165,32,0.05)] blur-[32px] left-[-96px] rounded-[9999px] size-[256px] top-[96px] pointer-events-none" data-name="Overlay+Blur" />
      <Main
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        showNewPassword={showNewPassword}
        showConfirmPassword={showConfirmPassword}
        onNewPasswordChange={setNewPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onToggleNewPassword={() => setShowNewPassword(!showNewPassword)}
        onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
        strength={strength}
        requirements={requirements}
        onSubmit={handleSubmit}
        error={error}
        isLoading={isLoading}
      />
      <HeaderTopNavigation />
    </div>
  );
}
