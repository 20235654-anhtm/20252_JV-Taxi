import React from 'react';
import type { ReviewsCardProps } from '../../types/DriverDetail';
import IconStar from '../../assets/IconStar.svg';

export const ReviewsCard: React.FC<ReviewsCardProps> = ({
  totalReviews,
  averageScore,
  stats,
  comments,
}) => {
  return (
    <div className="w-full p-[24px] bg-white rounded-[32px] flex flex-col justify-start items-start gap-[24px] !mt-[50px]">
      <div className="w-full flex justify-between items-end">
        <div className="flex flex-col justify-start items-start">
          <div className="text-[#171D17] text-[18px] font-[700] leading-[22.50px] break-words flex flex-col justify-center">評価</div>
          <div className="text-[#3D4A3F] text-[12px] font-[400] leading-[16px] break-words flex flex-col justify-center mt-[1px]">{totalReviews.toLocaleString()}件以上の乗車に基づく</div>
        </div>
        <div className="flex flex-col justify-start items-end gap-[4px]">
          <div className="text-[#006D37] text-[36px] font-[800] leading-[36px] text-right break-words flex flex-col justify-center">{averageScore.toFixed(2)}</div>
          <div className="flex justify-end items-start gap-[2px]">
            {[1, 2, 3, 4, 5].map(i => (
              <img key={i} src={IconStar} alt="Star" className="w-[10px] h-[9.50px] text-[#006D37]" />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full pb-[8px] flex flex-col justify-start items-start gap-[12px]">
        {stats.map((stat, idx) => (
          <div key={idx} className="w-full flex flex-col justify-start items-start gap-[4px]">
            <div className="w-full flex justify-between items-start">
              <div className="text-[#171D17] text-[10px] font-[700] uppercase leading-[15px] tracking-[0.50px] break-words flex flex-col justify-center">{stat.label}</div>
              <div className="text-[#171D17] text-[10px] font-[700] uppercase leading-[15px] tracking-[0.50px] break-words flex flex-col justify-center">{stat.score}</div>
            </div>
            <div className="w-full h-[6px] bg-[#E9F0E6] overflow-hidden rounded-[9999px] flex flex-col justify-center items-start">
              <div className="h-full bg-[#27AE60]" style={{ width: stat.width }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full max-h-[240px] overflow-y-auto flex flex-col gap-[16px] pr-1 pb-1">
        {comments.map((comment, idx) => (
          <div key={idx} className="w-full p-[16px] bg-[#EFF6EC] rounded-[16px] flex flex-col justify-start items-start gap-[8px] shrink-0">
            <div className="w-full flex justify-between items-center">
              <div className="text-[#171D17] text-[12px] font-[700] leading-[16px] break-words flex flex-col justify-center">{comment.reviewerName}</div>
              <div className="text-[#3D4A3F] text-[10px] font-[400] leading-[15px] break-words flex flex-col justify-center">{comment.timeAgo}</div>
            </div>
            <div className="text-[#3D4A3F] text-[14px] font-[400] leading-[22.75px] break-words" dangerouslySetInnerHTML={{ __html: comment.comment }} />
          </div>
        ))}
      </div>
    </div>
  );
};
