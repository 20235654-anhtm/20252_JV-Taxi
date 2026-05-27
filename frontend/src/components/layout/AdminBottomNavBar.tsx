import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UsersRound, ShieldCheck } from 'lucide-react';
import svgPaths from '../../pages/driver/svg-paths';
import './BottomNavBar.css';

interface AdminNavItem {
  icon: (active: boolean) => React.ReactNode;
  label: string;
  path: string;
  badge?: string | number;
}

const adminNavs: AdminNavItem[] = [
  {
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 16.5 16.5">
        <path d={svgPaths.pb46e100} fill={active ? '#006D37' : '#A1A1AA'} />
      </svg>
    ),
    label: '概要',
    path: '/admin/dashboard',
  },
  {
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 18 16">
        <path d={svgPaths.p2d32e900} fill={active ? '#006D37' : '#A1A1AA'} />
      </svg>
    ),
    label: 'ドライバー',
    path: '/admin/driver-management',
  },
  {
    icon: (active: boolean) => (
      <UsersRound size={24} color={active ? '#006D37' : '#A1A1AA'} />
    ),
    label: '顧客',
    path: '/admin/passenger-management',
  },
  {
    icon: (active: boolean) => (
      <ShieldCheck size={24} color={active ? '#006D37' : '#A1A1AA'} />
    ),
    label: '承認',
    path: '/admin/driver-approve',
  },
];

const AdminBottomNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isTabActive = (itemPath: string) => {
    const currentPath = location.pathname;
    if (itemPath === '/admin/driver-approve') {
      return currentPath.startsWith('/admin/driver-approve') || currentPath.startsWith('/admin/driver/approval') || currentPath.startsWith('/admin/driver-approval-list');
    }
    return currentPath === itemPath;
  };

  return (
    <nav className="bottom-nav-bar">
      {adminNavs.map((item) => {
        const active = isTabActive(item.path);
        return (
          <button
            key={item.label}
            type="button"
            className={`nav-item${active ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
              padding: '0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1
            }}
          >
            <div className="icon-wrapper">
              {item.icon(active)}
              {item.badge && (
                <span className="badge">{item.badge}</span>
              )}
            </div>
            <div className="label">{item.label}</div>
          </button>
        );
      })}
    </nav>
  );
};

export default AdminBottomNavBar;
