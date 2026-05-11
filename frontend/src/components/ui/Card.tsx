import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      rounded = 'xl',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'bg-white transition-all';

    const variantClasses = {
      default: 'shadow-[--shadow-sm]',
      elevated: 'shadow-[--shadow-lg]',
      outlined: 'border border-[--color-border-lighter]',
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const roundedClasses = {
      none: 'rounded-none',
      md: 'rounded-2xl',
      lg: 'rounded-[24px]',
      xl: 'rounded-[32px]',
      '2xl': 'rounded-[40px]',
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${roundedClasses[rounded]} ${className}`.trim();

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

