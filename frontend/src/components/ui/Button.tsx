import React from 'react';
import type { LucideIcon } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'lg',
      icon: Icon,
      iconPosition = 'right',
      fullWidth = false,
      className = '',
      children,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'btn-base inline-flex items-center justify-center gap-3 rounded-full font-bold transition-all';

    const variantClasses = {
      primary: 'gradient-primary text-white shadow-[--shadow-green] hover:opacity-90',
      secondary: 'bg-[--color-bg-secondary] text-[--color-text-primary] hover:bg-[--color-bg-tertiary]',
      accent: 'bg-[--color-accent-orange] text-[--color-warning] hover:opacity-90',
      ghost: 'bg-transparent text-[--color-text-primary] hover:bg-[--color-bg-secondary]',
    };

    const sizeClasses = {
      sm: 'h-[40px] px-5 text-sm',
      md: 'h-[56px] px-6 text-base',
      lg: 'h-[64px] px-8 text-lg',
      xl: 'h-[72px] px-10 text-xl',
    };

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
    const widthClasses = fullWidth ? 'w-full' : '';

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${widthClasses} ${className}`.trim();

    return (
      <button ref={ref} className={classes} disabled={disabled} {...props}>
        {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />}
        <span>{children}</span>
        {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 16 : size === 'md' ? 18 : 20} />}
      </button>
    );
  }
);

Button.displayName = 'Button';

