import React from 'react';
import IconYellowStar from '../../assets/IconYellowStar.svg';
import type { ReviewCardProps } from '../../types/TripDetail';

export const ReviewCard: React.FC<ReviewCardProps> = ({
  rating,
  comment
}) => {
  return (
    <div className="w-full p-[24px] bg-white shadow-[0px_8px_32px_rgba(23,29,23,0.04)] rounded-[24px] outline outline-1 outline-[rgba(0,109,55,0.05)] -outline-offset-1 flex flex-col justify-start items-start gap-[20px]">
      <div className="w-full max-w-[308px] px-[12px] py-[12px] bg-[rgba(233,240,230,0.30)] rounded-[16px] flex justify-center items-center">
        <div className="flex justify-start items-start gap-[4px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col justify-start items-start">
              <img 
                src={IconYellowStar} 
                alt="Star" 
                className={`w-[20px] h-[19px] ${i < rating ? '' : 'opacity-30 grayscale'}`} 
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="w-full pl-[24px] border-l-[4px] border-[rgba(0,109,55,0.20)] flex flex-col justify-start items-start">
        <div className="w-full flex flex-col justify-center text-[#171D17] text-[16px] font-['Plus_Jakarta_Sans',sans-serif] font-[500] leading-[26px] break-words whitespace-pre-line">
          {comment}
        </div>
      </div>
    </div>
  );
};
