import React from 'react';
import { Home, Briefcase, MapPin, Clock } from 'lucide-react';

export type LocationIconType = 'home' | 'work' | 'location' | 'recent';

export interface LocationItemProps {
  title: string;
  address: string;
  icon?: LocationIconType;
  onClick: () => void;
  className?: string;
}

export const LocationItem: React.FC<LocationItemProps> = ({
  title,
  address,
  icon = 'location',
  onClick,
  className = '',
}) => {
  const iconConfig = {
    home: { Icon: Home, size: 20 },
    work: { Icon: Briefcase, size: 20 },
    location: { Icon: MapPin, size: 20 },
    recent: { Icon: Clock, size: 20 },
  };

  const config = iconConfig[icon];
  const { Icon } = config;

  return (
    <button
      onClick={onClick}
      className={`
        w-full bg-[#eff6ec] rounded-[24px]
        p-[16px] flex items-center gap-[20px]
        hover:bg-[#e9f0e6]
        transition-all duration-200
        ${className}
      `}
    >
      {/* Icon Container */}
      <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] flex items-center justify-center rounded-[24px] shrink-0 size-[48px]">
        <Icon size={config.size} className="text-[#006d37]" />
      </div>

      {/* Text Content */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] text-[#171d17] text-[16px]">
          <p className="leading-[24px] truncate">{title}</p>
        </div>
        <div className="flex flex-col font-['Plus_Jakarta_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal justify-center leading-[0] text-[#3d4a3f] text-[14px]">
          <p className="leading-[20px] line-clamp-2">{address}</p>
        </div>
      </div>

      {/* Clock Icon */}
      <div className="shrink-0">
        <Clock size={18} className="text-[#bccabc]" />
      </div>
    </button>
  );
};

