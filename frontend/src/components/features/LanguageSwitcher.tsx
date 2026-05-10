import React from 'react';

export type Language = 'jp' | 'vn';

export interface LanguageSwitcherProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLang,
  onLanguageChange,
}) => {
  return (
    <div className="bg-[rgba(244,244,245,0.8)] content-stretch flex items-center p-[5px] relative rounded-[9999px]">
      {/* Border overlay */}
      <div aria-hidden="true" className="absolute border border-[rgba(192,201,187,0.1)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      
      {/* Overlay */}
      <div className="bg-[rgba(255,255,255,0.5)] relative rounded-[9999px] shrink-0">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[2px] items-center p-[2px] relative size-full">
          {/* JP Button */}
          <button
            onClick={() => onLanguageChange('jp')}
            className={`content-stretch flex flex-col items-center justify-center px-[16px] py-[4px] relative rounded-[9999px] shrink-0 w-[33px] ${
              currentLang === 'jp' 
                ? 'bg-[#1b5e20] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]' 
                : ''
            }`}
            aria-label="日本語に切り替え"
            aria-pressed={currentLang === 'jp'}
          >
            <div className={`flex flex-col h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-center tracking-[-0.275px] w-[12.92px] ${
              currentLang === 'jp'
                ? "font-['Inter:Semi_Bold',sans-serif] font-semibold text-white"
                : "font-['Inter:Medium',sans-serif] font-medium text-[#41493e]"
            }`}>
              <p className="leading-[16.5px]">JP</p>
            </div>
          </button>

          {/* VN Button */}
          <button
            onClick={() => onLanguageChange('vn')}
            className={`content-stretch flex flex-col items-center justify-center px-[16px] py-[4px] relative rounded-[9999px] shrink-0 w-[32px] ${
              currentLang === 'vn' 
                ? 'bg-[#1b5e20] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]' 
                : ''
            }`}
            aria-label="ベトナム語に切り替え"
            aria-pressed={currentLang === 'vn'}
          >
            <div className={`flex flex-col h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[11px] text-center tracking-[-0.275px] w-[15.58px] ${
              currentLang === 'vn'
                ? "font-['Inter:Semi_Bold',sans-serif] font-semibold text-white"
                : "font-['Inter:Medium',sans-serif] font-medium text-[#41493e]"
            }`}>
              <p className="leading-[16.5px]">VN</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};