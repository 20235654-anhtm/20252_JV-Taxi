import React from 'react';
import type { RouteTimelineCardProps } from '../../types/TripDetail';

export const RouteTimelineCard: React.FC<RouteTimelineCardProps> = ({
  startLocationName,
  startLocationAddress,
  endLocationName,
  endLocationAddress,
  startTime,
  endTime
}) => {
  return (
    <div className="w-full p-[24px] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[24px] flex flex-col justify-start items-start">
      <div className="w-full flex justify-start items-start gap-[16px]">
        
        {/* Timeline Graphic */}
        <div className="pt-[4px] flex flex-col justify-start items-center">
          <div className="w-[10px] h-[10px] rounded-full border-[2px] border-[#006D37]"></div>
          <div className="w-[2px] h-[48px] bg-[#DDE5DB]"></div>
          <div className="w-[10px] h-[10px] bg-[#FEA520] rounded-full"></div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-start items-start gap-[24px]">
          {/* Start Point */}
          <div className="w-full flex flex-col justify-start items-start">
            <div className="w-full flex justify-start items-start">
              <div className="flex flex-col justify-center text-[rgba(61,74,63,0.60)] text-[10px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] uppercase leading-[15px] tracking-[1px] break-words">
                出発地 • {startTime}
              </div>
            </div>
            <div className="w-full flex flex-col justify-start items-start">
              <div className="w-full flex flex-col justify-center text-[#171D17] text-[14px] font-['Plus_Jakarta_Sans',sans-serif] font-[600] leading-[20px] break-words">
                {startLocationName}
              </div>
            </div>
            <div className="w-full flex flex-col justify-start items-start">
              <div className="w-full flex flex-col justify-center text-[#3D4A3F] text-[12px] font-['Plus_Jakarta_Sans',sans-serif] font-[400] leading-[16px] break-words">
                {startLocationAddress}
              </div>
            </div>
          </div>

          {/* End Point */}
          <div className="w-full flex flex-col justify-start items-start">
            <div className="w-full flex justify-start items-start">
              <div className="flex flex-col justify-center text-[rgba(61,74,63,0.60)] text-[10px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] uppercase leading-[15px] tracking-[1px] break-words">
                目的地 • {endTime}
              </div>
            </div>
            <div className="w-full flex flex-col justify-start items-start">
              <div className="w-full flex flex-col justify-center text-[#171D17] text-[14px] font-['Plus_Jakarta_Sans',sans-serif] font-[600] leading-[20px] break-words">
                {endLocationName}
              </div>
            </div>
            <div className="w-full flex flex-col justify-start items-start">
              <div className="w-full flex flex-col justify-center text-[#3D4A3F] text-[12px] font-['Plus_Jakarta_Sans',sans-serif] font-[400] leading-[16px] break-words">
                {endLocationAddress}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
