import React from 'react';

import GuestActionButtons from './GuestActionButtons';

interface HeaderProps {
  isGuest: boolean;
  onBackClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ isGuest, onBackClick }) => {
  return (
    <div className="sl-header">
      <div className="sl-header-left">
        <button className="sl-back-btn" onClick={onBackClick} aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h2 className="sl-title">目的地を入力</h2>
      </div>
      {isGuest && <GuestActionButtons />}
    </div>
  );
};

export default Header;
