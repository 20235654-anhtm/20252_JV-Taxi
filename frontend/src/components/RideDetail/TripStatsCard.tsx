import React from 'react';
import IconClock from '../../assets/IconClock.svg';
import IconCard from '../../assets/IconCard.svg';
import IconGreenLoca from '../../assets/IconGreenLoca.svg';
import type { TripStatsCardProps } from '../../types/TripDetail';

export const TripStatsCard: React.FC<TripStatsCardProps> = ({
  duration,
  distance,
  paymentMethod
}) => {
  return (
    <div className="w-full p-[24px] bg-[#E3EAE0] rounded-[24px] flex flex-col justify-start items-start">
      <div className="w-full flex flex-col justify-start items-start gap-[16px]">
        
        {/* Duration */}
        <div className="w-full flex justify-start items-center gap-[12px]">
          <div className="w-[40px] h-[40px] bg-white rounded-full flex justify-center items-center">
            <img src={IconClock} alt="Clock" className="w-[20px] h-[20px]" />
          </div>
          <div className="flex flex-col justify-start items-start">
            <div className="flex flex-col justify-start items-start">
              <div className="h-[15px] flex flex-col justify-center text-[rgba(61,74,63,0.60)] text-[10px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] uppercase leading-[15px] tracking-[1px] break-words">乗車時間</div>
            </div>
            <div className="flex flex-col justify-start items-start">
              <div className="h-[28px] flex flex-col justify-center text-[#171D17] text-[18px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] leading-[28px] break-words">{duration}</div>
            </div>
          </div>
        </div>

        {/* Distance */}
        <div className="w-full flex justify-start items-center gap-[12px]">
          <div className="w-[40px] h-[40px] bg-white rounded-full flex justify-center items-center">
            <img src={IconGreenLoca} alt="Location" className="w-[14px] h-[20px]" />
          </div>
          <div className="flex flex-col justify-start items-start">
            <div className="flex flex-col justify-start items-start">
              <div className="h-[15px] flex flex-col justify-center text-[rgba(61,74,63,0.60)] text-[10px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] uppercase leading-[15px] tracking-[1px] break-words">走行距離</div>
            </div>
            <div className="flex flex-col justify-start items-start">
              <div className="h-[28px] flex flex-col justify-center text-[#171D17] text-[18px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] leading-[28px] break-words">{distance}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="w-full pt-[16px] flex flex-col justify-start items-start mt-[16px] border-t border-[rgba(188,202,188,0.15)]">
        <div className="w-full flex justify-start items-center gap-[8px]">
          <img src={IconCard} alt="Card" className="w-[16px] h-[16px]" />
          <div className="h-[16px] flex flex-col justify-center text-[#3D4A3F] text-[12px] font-['Plus_Jakarta_Sans',sans-serif] font-[500] leading-[16px] break-words">
            お支払い方法： {paymentMethod}
          </div>
        </div>
      </div>
    </div>
  );
};
