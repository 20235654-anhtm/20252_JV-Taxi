import React from 'react';

export type TextVariant = 'body' | 'caption' | 'label' | 'small';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextColor = 'primary' | 'secondary' | 'tertiary' | 'success' | 'error' | 'warning';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  weight = 'regular',
  color = 'secondary',
  className = '',
  children,
  ...props
}) => {
  const variantClasses = {
    body: 'text-[--text-md] leading-[20px]',
    caption: 'text-[--text-sm] leading-[15px]',
    label: 'text-[--text-base] leading-[16px] uppercase tracking-[--tracking-wide]',
    small: 'text-[--text-xs] leading-[12px]',
  };

  const weightClasses = {
    regular: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const colorClasses = {
    primary: 'text-[--color-text-primary]',
    secondary: 'text-[--color-text-secondary]',
    tertiary: 'text-[--color-text-tertiary]',
    success: 'text-[--color-success]',
    error: 'text-[--color-error]',
    warning: 'text-[--color-warning]',
  };

  const classes = `${variantClasses[variant]} ${weightClasses[weight]} ${colorClasses[color]} ${className}`.trim();

  return (
    <p className={classes} {...props}>
      {children}
    </p>
  );
};

