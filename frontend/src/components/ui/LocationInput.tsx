import React from 'react';

export type LocationInputType = 'pickup' | 'destination';

export interface LocationInputProps {
  type: LocationInputType;
  label: string;
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  showConnector?: boolean;
  onClick?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  type,
  label,
  value,
  placeholder = '',
  readOnly = false,
  showConnector = false,
  onClick,
  onChange,
  className = '',
}) => {
  const isPickup = type === 'pickup';

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Icon/Marker Column */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        {/* Marker */}
        {isPickup ? (
          // Pickup: Circle với border xanh
          <div className="relative rounded-full shrink-0 size-[12px]">
            <div
              aria-hidden="true"
              className="absolute border-2 border-[#006d37] border-solid inset-0 pointer-events-none rounded-full"
            />
          </div>
        ) : (
          // Destination: Square màu cam
          <div className="bg-[#fea520] relative rounded-[2px] shrink-0 size-[12px]" />
        )}

        {/* Connector Line (vertical divider) */}
        {showConnector && (
          <div className="bg-[#dde5db] h-[32px] relative shrink-0 w-[2px]" />
        )}
      </div>

      {/* Text Content */}
      <div
        className={`flex-1 flex flex-col ${readOnly && onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        {/* Label */}
        <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] shrink-0 text-[12px] tracking-[0.6px] uppercase w-full">
          <p
            className={`leading-[16px] ${
              isPickup ? 'text-[#3d4a3f]' : 'text-[#865300]'
            }`}
          >
            {label}
          </p>
        </div>

        {/* Value/Input */}
        {readOnly || onClick ? (
          // Display mode
          <div className="flex flex-col font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] shrink-0 w-full">
            <p
              className={`${
                isPickup ? 'text-[16px] leading-[24px]' : 'text-[18px] leading-[normal]'
              } ${
                value
                  ? 'text-[#171d17]'
                  : 'text-[rgba(61,74,63,0.4)] font-semibold'
              }`}
            >
              {value || placeholder}
            </p>
          </div>
        ) : (
          // Input mode
          <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`flex flex-col font-['Plus_Jakarta_Sans:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium justify-center leading-[0] shrink-0 w-full bg-transparent border-none outline-none ${
              isPickup ? 'text-[16px] leading-[24px]' : 'text-[18px] leading-[normal]'
            } ${
              value ? 'text-[#171d17]' : ''
            } placeholder:text-[rgba(61,74,63,0.4)] placeholder:font-semibold`}
          />
        )}
      </div>
    </div>
  );
};

