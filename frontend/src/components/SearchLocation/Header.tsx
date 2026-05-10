import React from 'react';
import GuestActionButtons from './GuestActionButtons';
import { Heading } from '../ui/Heading';
import { Button } from '../ui/Button';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  isGuest: boolean;
  onBackClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ isGuest, onBackClick }) => {
  return (
    <div className="sl-header">
      <div className="sl-header-left">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBackClick} 
          aria-label="Back"
          className="sl-back-btn"
          icon={ArrowLeft}
          iconPosition="left"
        >
          {null}
        </Button>
        <Heading level={2} className="sl-title">目的地を入力</Heading>
      </div>
      {isGuest && <GuestActionButtons />}
    </div>
  );
};

export default Header;
