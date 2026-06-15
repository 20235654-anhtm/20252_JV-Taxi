import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Clock, User } from 'lucide-react';
import svgPaths from '../../pages/driver/svg-paths';
import GrayDoashboard from '../../assets/GrayDoashboard.svg';
import GreenDoashboard from '../../assets/GreenDoashboard.svg';
import GrayHistory from '../../assets/GrayHistory.svg';
import GreenHistory from '../../assets/GreenHistory.svg';
import GrayPeople from '../../assets/GrayPeople.svg';
import GreenPeople from '../../assets/GreenPeople.svg';

export type NavTab = 'home' | 'history' | 'profile';

export interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange?: (tab: NavTab) => void;
  role?: 'driver' | 'passenger';
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  role: propRole,
}) => {
  const navigate = useNavigate();

  const handleTabClick = (tab: NavTab) => {
    if (onTabChange) onTabChange(tab);

    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const currentRole = propRole || (user?.role === 'DRIVER' || user?.role === 'driver' ? 'driver' : 'passenger');

    if (tab === 'home') {
      navigate(`/${currentRole}`);
    } else if (tab === 'history') {
      navigate(`/${currentRole}/history`);
    } else if (tab === 'profile') {
      navigate(`/${currentRole}/profile`);
    }
  };

  const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = propRole || (user?.role === 'DRIVER' || user?.role === 'driver' ? 'driver' : 'passenger');

  if (role === 'driver') {
    return (
      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-[1000] pointer-events-none">
        <div style={{ pointerEvents: 'auto', width: 390, height: 89, position: 'relative', background: 'rgba(255, 255, 255, 0.90)', boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.05)', borderTopLeftRadius: 24, borderTopRightRadius: 24, backdropFilter: 'blur(8px)' }}>
          
          <div onClick={() => handleTabClick('home')} style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 8, paddingBottom: 8, left: 10, top: 20, position: 'absolute', background: activeTab === 'home' ? '#F0FDF4' : 'transparent', borderRadius: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex', cursor: 'pointer' }}>
            <div style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
              <img src={activeTab === 'home' ? GreenDoashboard : GrayDoashboard} style={{ width: 16.5, height: 16.5 }} alt="Home" />
            </div>
            <div style={{ height: 17, paddingTop: 4, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
              <div style={{ width: 99, height: 17, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: activeTab === 'home' ? '#15803D' : '#A1A1AA', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', textTransform: 'uppercase', lineHeight: '16.5px', letterSpacing: 0.55, wordWrap: 'break-word' }}>ダッシュボード</div>
            </div>
          </div>

          <div onClick={() => handleTabClick('history')} style={{ width: 130, paddingLeft: 20, paddingRight: 20, paddingTop: 8, paddingBottom: 8, left: 132, top: 17.75, position: 'absolute', background: activeTab === 'history' ? '#F0FDF4' : 'transparent', borderRadius: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex', cursor: 'pointer' }}>
            <div style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
              <img src={activeTab === 'history' ? GreenHistory : GrayHistory} style={{ width: 16.5, height: 16.5 }} alt="History" />
            </div>
            <div style={{ paddingTop: 4, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
              <div style={{ width: 51.03, height: 17, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: activeTab === 'history' ? '#15803D' : '#A1A1AA', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', textTransform: 'uppercase', lineHeight: '16.5px', letterSpacing: 0.55, wordWrap: 'break-word' }}>履歴</div>
            </div>
          </div>

          <div onClick={() => handleTabClick('profile')} style={{ width: 100, paddingLeft: 10, paddingRight: 10, paddingTop: 8, paddingBottom: 8, right: 15, top: 20, position: 'absolute', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', display: 'inline-flex', cursor: 'pointer' }}>
            <div style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
              <img src={activeTab === 'profile' ? GreenPeople : GrayPeople} style={{ width: 16, height: 16 }} alt="Profile" />
            </div>
            <div style={{ paddingTop: 4, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
              <div style={{ whiteSpace: 'nowrap', height: 15, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: activeTab === 'profile' ? '#15803D' : '#A1A1AA', fontSize: 11, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', textTransform: 'uppercase', lineHeight: '15px', letterSpacing: 0.50 }}>プロフィール</div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white z-[1020] rounded-tl-[24px] rounded-tr-[24px] drop-shadow-[0px_-8px_12px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around pb-[10px] pt-[8px] px-[16px] max-w-[1280px] mx-auto">
        {/* Home Tab */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex-1 flex flex-col items-center justify-center py-[8px] rounded-[24px] transition-all duration-200 ${activeTab === 'home' ? 'bg-[#f0f9f0]' : ''
            }`}
          aria-label="ホーム"
        >
          <Home
            size={26}
            strokeWidth={activeTab === 'home' ? 2.5 : 2}
            className={activeTab === 'home' ? 'text-[#1a4d2e]' : 'text-[#a1a1aa]'}
          />
          <div className="flex flex-col items-start pt-[6px]">
            <div className={`flex flex-col font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-extrabold h-[15px] justify-center leading-[0] text-[12px] tracking-[0.5px] uppercase ${activeTab === 'home' ? 'text-[#1a4d2e]' : 'text-[#a1a1aa]'
              }`}>
              <p className="leading-[15px]">ホーム</p>
            </div>
          </div>
        </button>

        {/* History Tab */}
        <button
          onClick={() => handleTabClick('history')}
          className={`flex-1 flex flex-col items-center justify-center py-[8px] rounded-[24px] transition-all duration-200 ${activeTab === 'history' ? 'bg-[#f0f9f0]' : ''
            }`}
          aria-label="履歴"
        >
          <Clock
            size={24}
            strokeWidth={activeTab === 'history' ? 2.5 : 2}
            className={activeTab === 'history' ? 'text-[#1a4d2e]' : 'text-[#a1a1aa]'}
          />
          <div className="flex flex-col items-start pt-[6px]">
            <div className={`flex flex-col font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-extrabold h-[15px] justify-center leading-[0] text-[12px] tracking-[0.5px] uppercase ${activeTab === 'history' ? 'text-[#1a4d2e]' : 'text-[#a1a1aa]'
              }`}>
              <p className="leading-[15px]">履歴</p>
            </div>
          </div>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex-1 flex flex-col items-center justify-center py-[8px] rounded-[24px] transition-all duration-200 ${activeTab === 'profile' ? 'bg-[#f0f9f0]' : ''
            }`}
          aria-label="プロフィール"
        >
          <User
            size={24}
            strokeWidth={activeTab === 'profile' ? 2.5 : 2}
            className={activeTab === 'profile' ? 'text-[#1a4d2e]' : 'text-[#a1a1aa]'}
          />
          <div className="flex flex-col items-start pt-[6px]">
            <div className={`flex flex-col font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-extrabold h-[15px] justify-center leading-[0] text-[12px] tracking-[0.5px] uppercase ${activeTab === 'profile' ? 'text-[#1a4d2e]' : 'text-[#a1a1aa]'
              }`}>
              <p className="leading-[15px]">プロフィール</p>
            </div>
          </div>
        </button>
      </div>
    </nav>
  );
};

