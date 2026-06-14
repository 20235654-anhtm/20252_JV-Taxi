import React from 'react';
import IconEmptyMess from '../../assets/IconEmptyMess.svg';
import IconBrownStar from '../../assets/IconBrownStar.svg';
import type { DriverInfoCardProps } from '../../types/TripDetail';
import { Avatar } from '../ui/Avatar';

export const DriverInfoCard: React.FC<DriverInfoCardProps> = ({
  driverName,
  driverAvatar,
  carModel,
  driverNameKana,
  onMessageClick
}) => {
  return (
    <div className="w-full p-[24px] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[24px] flex justify-between items-center">
      <div className="flex justify-start items-center gap-[16px]">
        <div className="relative flex flex-col justify-start items-start">
          <Avatar 
            src={driverAvatar} 
            name={driverName} 
            className="w-[62px] h-[64px] rounded-[16px] text-lg" 
            borderColor="none" 
          />
          <div className="absolute right-[-8px] bottom-[-4px] p-[4px] bg-[#FEA520] rounded-[8px] flex flex-col justify-start items-start shadow-sm">
            <img src={IconBrownStar} alt="Star" className="w-[10px] h-[10px]" />
          </div>
        </div>
        <div className="flex flex-col justify-start items-start">
          <div className="flex flex-col justify-start items-start">
            <div className="h-[28px] flex flex-col justify-center text-[#171D17] text-[18px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] leading-[28px] break-words">{driverName}</div>
          </div>
          <div className="flex flex-col justify-start items-start">
            <div className="flex flex-col justify-center text-[#3D4A3F] text-[14px] font-['Plus_Jakarta_Sans',sans-serif] font-[400] leading-[20px] break-words whitespace-pre-line">
              {carModel}
            </div>
          </div>
          <div className="pt-[4px] flex flex-col justify-start items-start">
            <div className="h-[15px] flex flex-col justify-center text-[rgba(61,74,63,0.60)] text-[10px] font-['WenQuanYi_Zen_Hei',sans-serif] font-[700] uppercase leading-[15px] tracking-[1px] break-words">
              {driverNameKana}
            </div>
          </div>
        </div>
      </div>
      <div 
        className="p-[16px] bg-[#E9F0E6] rounded-[16px] flex flex-col justify-start items-start cursor-pointer hover:bg-[#d5e2d1] transition-colors"
        onClick={onMessageClick}
      >
        <div className="flex justify-center items-start">
          <img src={IconEmptyMess} alt="Message" className="w-[20px] h-[20px]" />
        </div>
      </div>
    </div>
  );
};
