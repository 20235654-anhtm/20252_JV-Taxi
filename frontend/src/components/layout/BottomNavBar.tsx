import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Clock, User } from 'lucide-react';

export type NavTab = 'home' | 'history' | 'profile';

export interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange?: (tab: NavTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const navigate = useNavigate();

  const handleTabClick = (tab: NavTab) => {
    if (onTabChange) onTabChange(tab);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    // Map DRIVER -> driver, PASSENGER/other -> passenger
    const role = user?.role === 'DRIVER' ? 'driver' : 'passenger';

    if (tab === 'home') {
      navigate(`/${role}`);
    } else if (tab === 'history') {
      navigate(`/${role}/history`);
    } else if (tab === 'profile') {
      navigate(`/${role}/profile`);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white z-[1020] rounded-tl-[24px] rounded-tr-[24px] drop-shadow-[0px_-8px_12px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around pb-[10px] pt-[8px] px-[16px] max-w-[1280px] mx-auto">
        {/* Home Tab */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex-1 flex flex-col items-center justify-center py-[8px] rounded-[24px] transition-all duration-200 ${
            activeTab === 'home' ? 'bg-[#f0f9f0]' : ''
          }`}
          aria-label="ホーム"
        >
          <Home
            size={22}
            className={activeTab === 'home' ? 'text-[#1a4d2e]' : 'text-[#a1a1aa]'}
          />
          <div className="flex flex-col items-start pt-[4px]">
            <div className={`flex flex-col font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] text-[10px] tracking-[0.5px] uppercase ${
              activeTab === 'home' ? 'text-[#1a4d2e]' : 'text-[#a1a1aa]'
            }`}>
              <p className="leading-[15px]">ホーム</p>
            </div>
          </div>
        </button>

        {/* History Tab */}
        <button
          onClick={() => handleTabClick('history')}
          className={`flex-1 flex flex-col items-center justify-center py-[8px] rounded-[24px] transition-all duration-200 ${
            activeTab === 'history' ? 'bg-[#f0f9f0]' : ''
          }`}
          aria-label="履歴"
        >
          <Clock
            size={20}
            className={activeTab === 'history' ? 'text-[#1a4d2e]' : 'text-[#a1a1aa]'}
          />
          <div className="flex flex-col items-start pt-[4px]">
            <div className={`flex flex-col font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] text-[10px] tracking-[0.5px] uppercase ${
              activeTab === 'history' ? 'text-[#1a4d2e]' : 'text-[#a1a1aa]'
            }`}>
              <p className="leading-[15px]">履歴</p>
            </div>
          </div>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex-1 flex flex-col items-center justify-center py-[8px] rounded-[24px] transition-all duration-200 ${
            activeTab === 'profile' ? 'bg-[#f0f9f0]' : ''
          }`}
          aria-label="プロフィール"
        >
          <User
            size={18}
            className={activeTab === 'profile' ? 'text-[#1a4d2e]' : 'text-[#a1a1aa]'}
          />
          <div className="flex flex-col items-start pt-[4px]">
            <div className={`flex flex-col font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] text-[10px] tracking-[0.5px] uppercase ${
              activeTab === 'profile' ? 'text-[#1a4d2e]' : 'text-[#a1a1aa]'
            }`}>
              <p className="leading-[15px]">プロフィール</p>
            </div>
          </div>
        </button>
      </div>
    </nav>
  );
};
