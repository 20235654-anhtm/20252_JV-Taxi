import React from 'react';
import type { ProfileCardProps } from '../../types/DriverDetail';

import IconMail from '../../assets/IconMail.svg';
import IconCall2 from '../../assets/IconCall2.svg';
import IconBrownTick from '../../assets/IconBrownTick.svg';

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  subName,
  avatarUrl,
  email,
  phone,
  isVerified,
}) => {
  return (
    <div className="w-full flex flex-col items-center bg-white shadow-[0px_4px_20px_rgba(0,0,0,0.02)] rounded-[24px] pt-[32px] pb-[32px]">
      {/* Avatar Section */}
      <div className="relative mb-[24px] w-[160px] h-[160px]">
        <div className="w-full h-full relative transform rotate-3 bg-[#2b6469] shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10),0px_20px_25px_-5px_rgba(0,0,0,0.10)] overflow-hidden rounded-[32px]">
          <img
            className="absolute left-[-4px] top-[5px] w-[168px] h-[168px] transform -rotate-3 object-cover"
            src={avatarUrl}
            alt="Avatar"
          />
        </div>
        {/* Tick Badge */}
        {isVerified && (
          <div className="absolute -bottom-1 -right-1 w-[46px] h-[45px] bg-[#FEA520] rounded-[16px] shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10),0px_10px_15px_-3px_rgba(0,0,0,0.10)] flex justify-center items-center z-10">
            <img src={IconBrownTick} alt="Verified" className="w-[22px] h-[21px]" />
          </div>
        )}
      </div>

      {/* Name & Subname */}
      <div className="text-center text-[#171D17] text-[24px] font-[800] leading-[32px] break-words w-auto px-4">{name}</div>
      <div className="text-center text-[#3D4A3F] text-[10.40px] font-normal leading-[15.60px] break-words mt-[4px]">{subName}</div>

      {/* Contact Info */}
      <div className="w-[294px] border-t border-[rgba(188,202,188,0.15)] mt-[9px] pt-[24px] flex flex-col gap-[12px]">
        <div className="flex justify-start items-center gap-[12px]">
          <div className="w-[16px] flex justify-center items-center">
            <img src={IconMail} alt="Mail" className="w-[15px] h-[12px] text-[#006D37]" />
          </div>
          <div className="flex flex-col">
            <div className="text-[#171D17] text-[12px] font-[700] leading-[15px] break-words">{email}</div>
            <div className="text-[#3D4A3F] text-[10.40px] font-normal leading-[15.60px] break-words">メールアドレス</div>
          </div>
        </div>
        <div className="flex justify-start items-center gap-[12px]">
          <div className="w-[16px] flex justify-center items-center">
            <img src={IconCall2} alt="Call" className="w-[13.5px] h-[13.5px] text-[#006D37]" />
          </div>
          <div className="flex flex-col">
            <div className="text-[#171D17] text-[12px] font-[700] leading-[15px] break-words">{phone}</div>
            <div className="text-[#3D4A3F] text-[10.40px] font-normal leading-[15.60px] break-words">電話番号</div>
          </div>
        </div>
      </div>
    </div>
  );
};
