import React from 'react';
import type { CarDetailsCardProps } from '../../types/DriverReviewDetail';
import IconCar2 from '../../assets/IconCar2.svg';

export const CarDetailsCard: React.FC<CarDetailsCardProps> = ({
  carImage,
  model,
  year,
  plateNumber,
}) => {
  return (
    <div className="w-full bg-[#E9F0E6] rounded-[24px] pt-[24px] pb-[40px] px-[24px] flex flex-col justify-start items-start gap-[16px]">
      <div className="w-full flex justify-between items-start">
        <div className="text-[#171D17] text-[16px] font-[800] leading-[24px] break-words flex flex-col justify-center">車両詳細</div>
        <div className="w-[18px] h-[24px] flex justify-center items-center">
          <img src={IconCar2} alt="Car" className="w-[18px] h-[24px] text-[#006D37]" />
        </div>
      </div>
      <div className="w-full p-[16px] bg-white rounded-[16px] flex flex-col justify-start items-start gap-[16px]">
        <img 
          src={carImage} 
          alt="Car" 
          className="w-full h-[128px] object-cover rounded-[12px] relative" 
        />
        <div className="w-full grid grid-cols-2 pb-[4px]">
          <div className="flex flex-col justify-start items-start">
            <div className="text-[#3D4A3F] text-[10px] font-[700] uppercase leading-[15px] break-words flex flex-col justify-center">モデル</div>
            <div className="text-[#171D17] text-[14px] font-[700] leading-[20px] break-words flex flex-col justify-center">{model}<br/>{year}</div>
          </div>
          <div className="flex flex-col justify-start items-start">
            <div className="text-[#3D4A3F] text-[10px] font-[700] uppercase leading-[15px] break-words flex flex-col justify-center">ナンバー</div>
            <div className="text-[#171D17] text-[14px] font-[700] leading-[20px] break-words flex flex-col justify-center">{plateNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
