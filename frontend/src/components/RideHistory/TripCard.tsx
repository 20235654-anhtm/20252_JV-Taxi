import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TripData } from '../../types/RideHistory';
import IconBrownLocation from '../../assets/IconBrownLocation.svg';
import IconNext from '../../assets/IconNext.svg';
import IconFab from '../../assets/IconFab.svg';

export const TripCard: React.FC<TripData> = ({
  id,
  driverName,
  driverAvatar,
  price,
  status,
  startLocationName,
  startLocationAddress,
  endLocationName,
  endLocationAddress,
  date,
  time,
}) => {
  const navigate = useNavigate();
  return (
    <div className="w-full p-[24px] bg-white rounded-[24px] flex flex-col justify-start items-start gap-[24px]">
      {/* Header */}
      <div className="w-full flex justify-between items-start">
        <div className="flex-1 flex justify-start items-center gap-[16px] mr-[16px] min-w-0">
          <div className="w-[52px] h-[56px] bg-[#E9F0E6] overflow-hidden rounded-full flex justify-center items-center shrink-0">
            <img className="w-full h-full object-cover" src={driverAvatar} alt="Driver" />
          </div>
          <div className="flex-1">
            <div className="text-[#171D17] text-[18px] font-[700] leading-[28px] break-words">
              {driverName}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center items-end shrink-0">
          <div className="text-[#006D37] text-[20px] font-[800] leading-[28px]">{price}</div>
          <div className="px-[12px] py-[4px] bg-[rgba(39,174,96,0.10)] rounded-full flex justify-start items-center mt-[4px]">
            <div className="text-[#27AE60] text-[10px] font-[700] uppercase leading-[15px] tracking-[1px] text-right">{status}</div>
          </div>
        </div>
      </div>

      {/* Body: Timeline */}
      <div className="w-full relative flex flex-col justify-start items-start gap-[16px]">
        {/* Vertical Line */}
        <div className="w-[2px] h-[128px] absolute left-[11px] top-[12px] bg-[#E3EAE0]"></div>
        
        {/* Start Location */}
        <div className="w-full flex justify-start items-start gap-[16px]">
          <div className="w-[24px] h-[24px] bg-[#006D37] rounded-full flex justify-center items-center z-10 shrink-0">
            <img src={IconFab} alt="Start Location" className="w-[13px] h-[13px]" />
          </div>
          <div className="flex-1 flex flex-col justify-start items-start">
            <div className="w-full text-[#3D4A3F] text-[12px] font-[700] uppercase leading-[16px] tracking-[1.2px] break-words">出発地</div>
            <div className="w-full text-[#171D17] text-[16px] font-[600] leading-[24px] break-words">{startLocationName}</div>
            <div className="w-full text-[#3D4A3F] text-[12px] font-[400] leading-[16px] break-words">{startLocationAddress}</div>
          </div>
        </div>

        {/* End Location */}
        <div className="w-full flex justify-start items-start gap-[16px]">
          <div className="w-[24px] h-[24px] bg-[#FEA520] rounded-full flex justify-center items-center z-10 shrink-0">
            <img src={IconBrownLocation} alt="Location" className="w-[9.33px] h-[11.67px]" />
          </div>
          <div className="flex-1 flex flex-col justify-start items-start">
            <div className="w-full text-[#3D4A3F] text-[12px] font-[700] uppercase leading-[16px] tracking-[1.2px] break-words">目的地</div>
            <div className="w-[181px] text-[#171D17] text-[16px] font-[600] leading-[24px] break-words">{endLocationName}</div>
            <div className="w-full text-[#3D4A3F] text-[12px] font-[400] leading-[16px] break-words">{endLocationAddress}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="w-full h-[67px] pt-[24px] pb-[12px] px-[16px] bg-[rgba(233,240,230,0.30)] rounded-[24px] flex justify-between items-center cursor-pointer hover:bg-[rgba(233,240,230,0.60)] transition-colors"
        onClick={() => navigate(`/passenger/history/${id}`)}
      >
        
        {/* Left Section (Date & Time) */}
        <div className="w-[209px] flex justify-start items-center gap-[21px]">
          {/* Date */}
          <div className="w-[98px] flex flex-col justify-start items-start">
            <div className="w-full h-[9px] flex flex-col justify-start items-start">
              <div className="w-[25.09px] h-[15px] flex flex-col justify-center text-[#3D4A3F] text-[10px] font-[700] uppercase leading-[15px] break-words">日付</div>
            </div>
            <div className="w-full flex flex-col justify-start items-start">
              <div className="w-[110px] h-[40px] flex flex-col justify-center text-[#171D17] text-[14px] font-[700] leading-[20px] break-words">{date}</div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="w-[0.95px] h-[24px] bg-[rgba(188,202,188,0.30)] shrink-0"></div>
          
          {/* Time */}
          <div className="w-[72px] flex flex-col justify-start items-start">
            <div className="w-full h-[9px] flex flex-col justify-start items-start">
              <div className="w-[23.09px] h-[15px] flex flex-col justify-center text-[#3D4A3F] text-[10px] font-[700] uppercase leading-[15px] break-words">時間</div>
            </div>
            <div className="w-full flex flex-col justify-start items-start">
              <div className="w-[81px] h-[40px] flex flex-col justify-center text-[#171D17] text-[14px] font-[700] leading-[20px] break-words">{time}</div>
            </div>
          </div>
        </div>

        {/* Right Section (Shousai & Arrow) */}
        <div className="w-[49.50px] h-[21px] relative shrink-0">
          <div className="absolute left-[0.50px] top-[-3px] px-[5.22px] flex flex-col justify-start items-center">
            <div className="w-[26.74px] h-[13.45px] text-[#006D37] text-[12px] font-[700] leading-[16px] flex items-center justify-center">詳細</div>
          </div>
          <div className="absolute left-[45.50px] top-[1px] flex flex-col justify-start items-center">
            <img src={IconNext} alt="Next" className="w-[4.32px] h-[7px]" />
          </div>
        </div>

      </div>
    </div>
  );
};
