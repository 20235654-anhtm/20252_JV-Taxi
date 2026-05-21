import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Clock, User } from 'lucide-react';
import svgPaths from '../../pages/driver/svg-paths';

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

    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const role = user?.role === 'DRIVER' || user?.role === 'driver' ? 'driver' : 'passenger';

    if (tab === 'home') {
      navigate(`/${role}`);
    } else if (tab === 'history') {
      navigate(`/${role}/history`);
    } else if (tab === 'profile') {
      navigate(`/${role}/profile`);
    }
  };

  const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role === 'DRIVER' || user?.role === 'driver' ? 'driver' : 'passenger';

  if (role === 'driver') {
    return (
      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-[1000] pointer-events-none">
        <nav className="pointer-events-auto w-full max-w-[480px] bg-white/90 backdrop-blur-md h-[90px] rounded-t-[32px] shadow-[0px_-10px_20px_rgba(0,0,0,0.05)] flex justify-around items-center px-[16px]">
          <button onClick={() => handleTabClick('home')} className={`flex flex-col items-center gap-[4px] p-[12px] ${activeTab === 'home' ? 'bg-[#f0fdf4] rounded-[20px] text-[#006d37]' : ''}`}>
            <svg className="size-[20px]" fill="none" viewBox="0 0 16.5 16.5">
              <path d={svgPaths.pb46e100} fill={activeTab === 'home' ? 'currentColor' : '#A1A1AA'} />
            </svg>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'home' ? 'text-[#006d37]' : 'text-[#A1A1AA]'}`}>ホーム</span>
          </button>
          
          <button onClick={() => handleTabClick('history')} className={`flex flex-col items-center gap-[4px] p-[12px] ${activeTab === 'history' ? 'bg-[#f0fdf4] rounded-[20px] text-[#006d37]' : ''}`}>
            <svg className="size-[20px]" fill="none" viewBox="0 0 16.5 16.5">
              <path d={svgPaths.p73de340} fill={activeTab === 'history' ? 'currentColor' : '#A1A1AA'} />
            </svg>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'history' ? 'text-[#006d37]' : 'text-[#A1A1AA]'}`}>履歴</span>
          </button>
          
          <button onClick={() => handleTabClick('profile')} className={`flex flex-col items-center gap-[4px] p-[12px] ${activeTab === 'profile' ? 'bg-[#f0fdf4] rounded-[20px] text-[#006d37]' : ''}`}>
            <svg className="size-[20px]" fill="none" viewBox="0 0 16 16">
              <path d={svgPaths.p85bff00} fill={activeTab === 'profile' ? 'currentColor' : '#A1A1AA'} />
            </svg>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'profile' ? 'text-[#006d37]' : 'text-[#A1A1AA]'}`}>プロフィール</span>
          </button>
        </nav>
      </div>
    );
  }

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

