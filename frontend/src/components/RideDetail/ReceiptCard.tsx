import React from 'react';
import type { ReceiptCardProps } from '../../types/TripDetail';

export const ReceiptCard: React.FC<ReceiptCardProps> = ({
  distanceFee,
  bookingFee,
  total,
  distanceLabel
}) => {
  return (
    <div className="w-full p-[32px] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[24px] flex flex-col justify-start items-start gap-[24px]">
      <div className="w-full flex flex-col justify-start items-start">
        <div className="w-full flex flex-col justify-center text-[rgba(61,74,63,0.60)] text-[10px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] uppercase leading-[15px] tracking-[1px] break-words">
          領収書の詳細
        </div>
      </div>
      
      <div className="w-full flex flex-col justify-start items-start gap-[15px]">
        {/* Distance Fee */}
        <div className="w-full flex justify-between items-center">
          <div className="h-[24px] flex flex-col justify-center text-[#3D4A3F] text-[16px] font-['Plus_Jakarta_Sans',sans-serif] font-[400] leading-[24px] break-words">
            {distanceLabel}
          </div>
          <div className="h-[24px] flex flex-col justify-center text-[#171D17] text-[16px] font-['Plus_Jakarta_Sans',sans-serif] font-[500] leading-[24px] break-words text-right">
            {distanceFee}
          </div>
        </div>

        {/* Booking Fee */}
        <div className="w-full flex justify-between items-center">
          <div className="h-[24px] flex flex-col justify-center text-[#3D4A3F] text-[16px] font-['Plus_Jakarta_Sans',sans-serif] font-[400] leading-[24px] break-words">
            指名料
          </div>
          <div className="h-[24px] flex flex-col justify-center text-[#171D17] text-[16px] font-['Plus_Jakarta_Sans',sans-serif] font-[500] leading-[24px] break-words text-right">
            {bookingFee}
          </div>
        </div>

        {/* Total */}
        <div className="w-full pt-[24px] border-t border-[rgba(188,202,188,0.15)] flex justify-between items-end mt-[8px]">
          <div className="w-full flex flex-col justify-start items-start">
            <div className="h-[15px] flex flex-col justify-center text-[rgba(61,74,63,0.60)] text-[14px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] uppercase leading-[15px] tracking-[1px] break-words">
              合計金額
            </div>
            <div className="h-[36px] flex flex-col justify-center text-[#171D17] text-[30px] font-['Plus_Jakarta_Sans',sans-serif] font-[800] leading-[36px] break-words">
              {total}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
