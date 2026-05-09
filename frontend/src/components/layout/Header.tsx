import React from 'react';
import { ChevronLeft } from 'lucide-react';
import {Avatar} from '../ui/Avatar';

export type HeaderVariant = 'guest' | 'passenger' | 'auth';

export interface HeaderProps {
  variant?: HeaderVariant;
  showBackButton?: boolean;
  title?: string;
  userAvatar?: string;
  currentLang?: 'jp' | 'vn';
  onBackClick?: () => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onLanguageChange?: (lang: 'jp' | 'vn') => void;
}

export const Header: React.FC<HeaderProps> = ({
  variant = 'passenger',
  showBackButton = false,
  title,
  userAvatar,
  currentLang = 'jp',
  onBackClick,
  onLoginClick,
  onSignupClick,
  onLanguageChange,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-[1000] backdrop-blur-[6px] bg-[rgba(255,255,255,0.8)] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between h-full px-6 max-w-[1280px] mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Back Button */}
          {showBackButton && (
            <button
              onClick={onBackClick}
              className="flex flex-col items-center justify-center p-2 rounded-full"
              aria-label="戻る"
            >
              <ChevronLeft size={16} className="text-[#064e3b]" />
            </button>
          )}

          {/* Avatar (Passenger variant) */}
          {variant === 'passenger' && !showBackButton && userAvatar && (
            <Avatar 
              src={userAvatar} 
              alt="User avatar" 
              borderColor="#27ae60"
            />
          )}

          {/* Logo: Guest variant → bên TRÁI */}
          {variant === 'guest' && !title && (
            <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold h-7 justify-center leading-[0] text-[#064e3b] text-xl tracking-[-0.5px]">
              <p className="leading-7">JV – Taxi</p>
            </div>
          )}

          {/* Title (if provided) */}
          {title && (
            <div className="flex flex-col items-start">
              <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-7 justify-center leading-[0] text-[#064e3b] text-lg tracking-[-0.45px]">
                <p className="leading-7">{title}</p>
              </div>
            </div>
          )}
        </div>

        {/* Center Section - Logo: Passenger/Auth variant → GIỮA tuyệt đối */}
        {!title && variant !== 'guest' && (
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold',sans-serif] font-extrabold h-7 justify-center leading-[0] text-[#064e3b] text-xl tracking-[-0.5px]">
              <p className="leading-7">JV – Taxi</p>
            </div>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Login/Signup Buttons (Guest variant) */}
          {variant === 'guest' && (
            <div className="flex items-center gap-2">
              <button
                onClick={onLoginClick}
                className="bg-[#006d37] font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold text-sm text-white px-5 py-1.5 rounded-full shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap"
              >
                ログイン
              </button>
              <button
                onClick={onSignupClick}
                className="bg-[#006d37] font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold text-sm text-white px-5 py-1.5 rounded-full shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap"
              >
                サインアップ
              </button>
            </div>
          )}

          {/* Language Switcher (Passenger variant) */}
          {variant === 'passenger' && onLanguageChange && (
            <div className="bg-[rgba(244,244,245,0.8)] flex items-center p-[5px] rounded-full">
              <div aria-hidden="true" className="absolute border border-[rgba(192,201,187,0.1)] border-solid inset-0 pointer-events-none rounded-full" />
              <div className="bg-[rgba(255,255,255,0.5)] rounded-full">
                <div className="flex gap-0.5 items-center p-0.5">
                  <button
                    onClick={() => onLanguageChange('jp')}
                    className={`flex flex-col items-center justify-center px-4 py-1 rounded-full w-[33px] ${
                      currentLang === 'jp'
                        ? 'bg-[#1b5e20] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]'
                        : ''
                    }`}
                  >
                    <div className={`flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[17px] justify-center leading-[0] not-italic text-[11px] text-center tracking-[-0.275px] ${
                      currentLang === 'jp' ? 'text-white' : 'text-[#41493e]'
                    }`}>
                      <p className="leading-[16.5px]">JP</p>
                    </div>
                  </button>

                  <button
                    onClick={() => onLanguageChange('vn')}
                    className={`flex flex-col items-center justify-center px-4 py-1 rounded-full w-[32px] ${
                      currentLang === 'vn'
                        ? 'bg-[#1b5e20] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]'
                        : ''
                    }`}
                  >
                    <div className={`flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[17px] justify-center leading-[0] not-italic text-[11px] text-center tracking-[-0.275px] ${
                      currentLang === 'vn' ? 'text-white' : 'text-[#41493e]'
                    }`}>
                      <p className="leading-[16.5px]">VN</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
