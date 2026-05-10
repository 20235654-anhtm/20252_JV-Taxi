import React from 'react';
import { Home, Clock, User } from 'lucide-react';

export type NavTab = 'home' | 'history' | 'profile';

export interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white z-[999] rounded-tl-[24px] rounded-tr-[24px] drop-shadow-[0px_-8px_12px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between pb-[10px] pt-[8px] px-[16px] max-w-[1280px] mx-auto">
        {/* Home Tab */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center px-[20px] py-[8px] rounded-[24px] ${
            activeTab === 'home' ? 'bg-[#d1fae5]' : ''
          }`}
          aria-label="ホーム"
        >
          <Home
            size={20}
            className={activeTab === 'home' ? 'text-[#064e3b]' : 'text-[#a1a1aa]'}
          />
          <div className="flex flex-col items-start pt-[4px]">
            <div className={`flex flex-col font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] text-[10px] tracking-[0.5px] uppercase ${
              activeTab === 'home' ? 'text-[#064e3b]' : 'text-[#a1a1aa]'
            }`}>
              <p className="leading-[15px]">ホーム</p>
            </div>
          </div>
        </button>

        {/* History Tab */}
        <button
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center justify-center px-[20px] py-[8px] rounded-[24px] ${
            activeTab === 'history' ? 'bg-[#d1fae5]' : ''
          }`}
          aria-label="履歴"
        >
          <Clock
            size={18}
            className={activeTab === 'history' ? 'text-[#064e3b]' : 'text-[#a1a1aa]'}
          />
          <div className="flex flex-col items-start pt-[4px]">
            <div className={`flex flex-col font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] text-[10px] tracking-[0.5px] uppercase ${
              activeTab === 'history' ? 'text-[#064e3b]' : 'text-[#a1a1aa]'
            }`}>
              <p className="leading-[15px]">履歴</p>
            </div>
          </div>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center px-[20px] py-[8px] rounded-[24px] ${
            activeTab === 'profile' ? 'bg-[#d1fae5]' : ''
          }`}
          aria-label="プロフィール"
        >
          <User
            size={16}
            className={activeTab === 'profile' ? 'text-[#064e3b]' : 'text-[#a1a1aa]'}
          />
          <div className="flex flex-col items-start pt-[4px]">
            <div className={`flex flex-col font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] text-[10px] tracking-[0.5px] uppercase ${
              activeTab === 'profile' ? 'text-[#064e3b]' : 'text-[#a1a1aa]'
            }`}>
              <p className="leading-[15px]">プロフィール</p>
            </div>
          </div>
        </button>
      </div>
    </nav>
  );
};

