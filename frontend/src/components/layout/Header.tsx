import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  variant?: 'passenger' | 'driver' | 'guest' | 'auth';
  showBackButton?: boolean;
  title?: string;
  userAvatar?: string | null;
  userName?: string;
  currentLang?: 'jp' | 'vn';
  onBackClick?: () => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onLanguageChange?: (lang: 'jp' | 'vn') => void;
  onAvatarClick?: () => void;
  rightContent?: React.ReactNode;
  isFixed?: boolean;
  hideBrandName?: boolean;
  hideLanguageToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  variant = 'passenger',
  showBackButton = false,
  title,
  userAvatar,
  userName = 'U',
  currentLang = 'jp',
  onBackClick,
  onLoginClick,
  onSignupClick,
  onLanguageChange,
  onAvatarClick,
  rightContent,
  isFixed = true,
  hideBrandName = false,
  hideLanguageToggle = false,
}) => {
  return (
    <header className={`${isFixed ? 'fixed' : 'absolute'} top-0 left-0 right-0 h-16 z-[1000] bg-white border-b border-gray-100`}>
      <div className="flex items-center justify-between h-full px-6 max-w-[1280px] mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {showBackButton && (
            <button 
              onClick={onBackClick}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          
          <div className="flex items-center">
            {!hideBrandName && (
              <span className="text-[20px] font-black text-[#1a4d2e] tracking-tight">
                JV – Taxi
              </span>
            )}
            {title && (
              <>
                {!hideBrandName && <div className="w-[1px] h-4 bg-gray-300 mx-3" />}
                <span className={`${hideBrandName ? 'text-[18px] text-[#1a4d2e] font-black tracking-tight' : 'text-sm font-bold text-gray-700'}`}>
                  {title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Language Toggle (Clean pill design from image) */}
          {(variant === 'passenger' || variant === 'auth') && !hideLanguageToggle && (
            <div className="flex items-center bg-[#f5f5f5] rounded-full p-1 min-w-[86px] relative h-[36px]">
              <button 
                onClick={() => onLanguageChange?.('jp')} 
                className={`relative z-10 w-1/2 h-full flex justify-center items-center text-[10px] font-black transition-all duration-300 ${currentLang === 'jp' ? 'text-white' : 'text-[#8e8e8e]'}`}
              >
                JP
              </button>
              <button 
                onClick={() => onLanguageChange?.('vn')} 
                className={`relative z-10 w-1/2 h-full flex justify-center items-center text-[10px] font-black transition-all duration-300 ${currentLang === 'vn' ? 'text-white' : 'text-[#8e8e8e]'}`}
              >
                VN
              </button>
              {/* Sliding Indicator */}
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#1a4d2e] rounded-full transition-all duration-300 shadow-sm ${currentLang === 'jp' ? 'left-1' : 'left-[calc(50%+3px)]'}`}
              />
            </div>
          )}

          {/* Avatar (Only for 'auth' variant) */}
          {variant === 'auth' && (
            <button 
              onClick={onAvatarClick}
              className="w-9 h-9 rounded-full border-2 border-[#1a4d2e] p-0.5 hover:scale-105 transition-transform overflow-hidden"
            >
              {(userAvatar && !userAvatar.includes('pravatar.cc')) ? (
                <img 
                  src={userAvatar} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#006d37] to-[#21a45d] text-white flex items-center justify-center font-black text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          )}

          {/* Guest Buttons */}
          {variant === 'guest' && (
            <div className="flex items-center gap-2">
              <button 
                onClick={onLoginClick}
                className="px-5 py-2 text-sm font-bold text-white bg-[#1a4d2e] rounded-full hover:bg-[#0e2b1a] transition-all shadow-md"
              >
                ログイン
              </button>
              <button 
                onClick={onSignupClick}
                className="px-5 py-2 text-sm font-black text-white bg-[#1a4d2e] rounded-full hover:bg-[#0e2b1a] transition-all shadow-md"
              >
                サインアップ
              </button>
            </div>
          )}
          
          {rightContent}
        </div>
      </div>
    </header>
  );
};
