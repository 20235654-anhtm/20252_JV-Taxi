import React from 'react';
import type { DocumentCardProps } from '../../types/DriverReviewDetail';
import IconGreenTick from '../../assets/IconGreenTick.svg';

export const DocumentCard: React.FC<DocumentCardProps> = ({
  title,
  isValid,
  documentImage,
  expirationDate,
  categoryOrStatusLabel,
  categoryOrStatusValue,
  isSuccessStatus,
}) => {
  return (
    <div className="w-full p-[4px] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] overflow-hidden rounded-[24px] outline outline-1 outline-[rgba(188,202,188,0.10)] -outline-offset-1 flex flex-col justify-start items-center gap-[4px] mb-[16px]">
      <div className="w-full p-[20px] flex justify-between items-center">
        <div className="flex flex-col justify-start items-start">
          <div className="text-[#171D17] text-[16px] font-[700] leading-[24px] break-words flex flex-col justify-center">{title}</div>
        </div>
        <div className="flex flex-col justify-start items-start">
          {isValid && <img src={IconGreenTick} alt="Valid" className="w-[20px] h-[20px]" />}
        </div>
      </div>
      <div className="w-full h-[192px] max-w-[340px] relative bg-[#EFF6EC] rounded-[20px] flex justify-center items-center">
        <img 
          className="w-full h-full relative opacity-90 rounded-[20px] object-cover" 
          src={documentImage} 
          alt={title} 
        />
      </div>
      <div className="w-full pt-[15px] pb-[16px] px-[16px] flex justify-start items-start gap-[16px]">
        <div className="flex justify-start items-start gap-[4px]">
          <div className="text-[#3D4A3F] text-[11px] font-[500] leading-[16.50px] break-words flex flex-col justify-center">有効期限：</div>
          <div className="text-[#171D17] text-[11px] font-[700] leading-[16.50px] break-words flex flex-col justify-center">{expirationDate}</div>
        </div>
        <div className="flex justify-start items-start gap-[4px]">
          <div className="text-[#3D4A3F] text-[11px] font-[500] leading-[16.50px] break-words flex flex-col justify-center">{categoryOrStatusLabel}：</div>
          <div className={`${isSuccessStatus ? 'text-[#059669]' : 'text-[#171D17]'} text-[11px] font-[700] leading-[16.50px] break-words flex flex-col justify-center`}>{categoryOrStatusValue}</div>
        </div>
      </div>
    </div>
  );
};
