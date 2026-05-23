import React from 'react';
import { UsersRound, ShieldCheck } from 'lucide-react';
import svgPaths from '../../pages/driver/svg-paths';
import './BottomNavBar.css';

interface AdminNavItem {
  icon: (active: boolean) => React.ReactNode;
  label: string;
  active: boolean;
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
    active: false,
  },
  {
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 18 16">
        <path d={svgPaths.p2d32e900} fill={active ? '#006D37' : '#A1A1AA'} />
      </svg>
    ),
    label: 'ドライバー',
    active: false,
  },
  {
    icon: (active: boolean) => (
      <UsersRound size={24} color={active ? '#006D37' : '#A1A1AA'} />
    ),
    label: '顧客',
    active: false,
  },
  {
    icon: (active: boolean) => (
      <ShieldCheck size={24} color={active ? '#006D37' : '#A1A1AA'} />
    ),
    label: '承認',
    active: true,
  },
];

const AdminBottomNavBar: React.FC = () => (
  <nav className="bottom-nav-bar">
    {adminNavs.map((item) => (
      <div
        key={item.label}
        className={`nav-item${item.active ? ' active' : ''}`}
        style={{ position: 'relative' }}
      >
        <div className="icon-wrapper">
          {item.icon(item.active)}
          {item.badge && (
            <span className="badge">{item.badge}</span>
          )}
        </div>
        <div className="label">{item.label}</div>
      </div>
    ))}
  </nav>
);

export default AdminBottomNavBar;
