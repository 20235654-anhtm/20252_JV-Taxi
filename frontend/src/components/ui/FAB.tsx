import React from 'react';
import fabIcon from '../../assets/fabicon.svg';

export interface FABProps {
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
}

export const FAB: React.FC<FABProps> = ({
  onClick,
  ariaLabel = '再センタリング',
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        fixed z-[900]
        bg-white flex items-center justify-center rounded-full w-[48px] h-[48px]
        shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]
        transition-all duration-200
        hover:scale-105
        active:scale-95
        ${className || 'top-[96px] right-4'}
      `}
      aria-label={ariaLabel}
    >
      {/* Icon from SVG file */}
      <img 
        src={fabIcon} 
        alt="" 
        className="w-[22px] h-[22px]"
        aria-hidden="true"
      />
    </button>
  );
};
