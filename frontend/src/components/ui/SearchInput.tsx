import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  value: string;
  onValueChange: (value: string) => void;
  onClear?: () => void;
  fullWidth?: boolean;
  inputSize?: 'md' | 'lg';
  rightIcon?: React.ReactNode;
  error?: boolean; // Thêm prop này
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onValueChange,
      onClear,
      placeholder = '目的地を入力...',
      fullWidth = true,
      inputSize = 'lg',
      className = '',
      disabled = false,
      rightIcon,
      error, // Nhận prop
      ...props
    },
    ref
  ) => {
    const handleClear = () => {
      onValueChange('');
      onClear?.();
    };

    const sizeClasses = {
      md: 'h-[48px] py-[13.5px]',
      lg: 'h-[56px] py-[17.5px]',
    };

    const baseClasses = `
      w-full rounded-[24px]
      bg-[#eff6ec]
      text-[#171d17]
      font-['Plus_Jakarta_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold text-[16px] leading-[normal]
      pl-[48px] pr-[48px]
      transition-all
      border-none
      focus:outline-none
      ring-2
      ${error ? 'ring-red-500' : 'focus:ring-[#006d37] ring-transparent'}
      ${sizeClasses[inputSize]}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `;

    const placeholderClasses = 'placeholder:text-[#a1a1aa] placeholder:font-semibold';
    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <div className={`relative ${widthClass}`}>
        {/* Search Icon */}
        <div className="absolute left-[19px] top-1/2 -translate-y-1/2 pointer-events-none">
          <Search size={18} className="text-[#006d37]" />
        </div>

        {/* Input Field */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          className={`${baseClasses} ${placeholderClasses} ${className}`}
          disabled={disabled}
          {...props}
        />

        {/* Right Element (Clear or Custom Icon) */}
        <div className="absolute right-[18px] top-1/2 -translate-y-1/2 flex items-center">
          {value && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              className="hover:opacity-70 transition-opacity"
              aria-label="クリア"
            >
              <X size={20} className="text-[#d4d4d8]" />
            </button>
          ) : (
            rightIcon && <div className="text-[#d4d4d8]">{rightIcon}</div>
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

