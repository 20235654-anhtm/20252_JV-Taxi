import React, { useState } from 'react';
import { type LucideIcon, Eye, EyeOff } from 'lucide-react';

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  helperText?: string;
  fullWidth?: boolean;
  inputSize?: 'md' | 'lg';
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      error,
      icon: Icon,
      iconPosition = 'left',
      helperText,
      fullWidth = true,
      inputSize = 'lg',
      type = 'text',
      className = '',
      disabled = false,
      required = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const sizeClasses = {
      md: 'h-[48px] px-4 text-[14px]',
      lg: 'h-[56px] px-5 text-[16px]',
    };

    const baseInputClasses = `
      input-base
      w-full rounded-[24px]
      bg-[--color-bg-secondary]
      text-[--color-text-primary]
      placeholder:text-[--color-text-tertiary]
      transition-all
      border-2 border-transparent
      ${sizeClasses[inputSize]}
      ${Icon && iconPosition === 'left' ? 'pl-12' : ''}
      ${Icon && iconPosition === 'right' ? 'pr-12' : ''}
      ${isPassword ? 'pr-12' : ''}
      ${error ? 'border-[--color-error] bg-[--color-error-bg]' : ''}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `;

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <div className={`flex flex-col gap-2 ${widthClass}`}>
        {/* Label */}
        {label && (
          <label className="flex items-center gap-1 px-1 font-bold text-[12px] text-[--color-text-primary] tracking-[0.35px] uppercase">
            {label}
            {required && <span className="text-[--color-error]">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {Icon && iconPosition === 'left' && (
            <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon size={18} className="text-[--color-text-secondary]" />
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={inputType}
            className={`${baseInputClasses} ${className}`}
            disabled={disabled}
            required={required}
            {...props}
          />

          {/* Right Icon or Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff size={18} className="text-[--color-text-secondary]" />
              ) : (
                <Eye size={18} className="text-[--color-text-secondary]" />
              )}
            </button>
          )}

          {Icon && iconPosition === 'right' && !isPassword && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon size={18} className="text-[--color-text-secondary]" />
            </div>
          )}
        </div>

        {/* Helper Text or Error */}
        {(helperText || error) && (
          <p
            className={`px-1 text-[12px] ${
              error ? 'text-[--color-error]' : 'text-[--color-text-secondary]'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';

