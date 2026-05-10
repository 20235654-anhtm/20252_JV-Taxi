import React from 'react';

export type HeadingLevel = 1 | 2 | 3 | 4;
export type HeadingWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  weight?: HeadingWeight;
  children: React.ReactNode;
}

export const Heading: React.FC<HeadingProps> = ({
  level = 1,
  weight,
  className = '',
  children,
  ...props
}) => {
  const Tag = `h${level}` as React.ElementType;

  const levelClasses = {
    1: "font-['Plus_Jakarta_Sans:ExtraBold','Noto_Sans_JP:Black',sans-serif] font-extrabold text-[24px] leading-[32px] tracking-[-0.6px]",
    2: "font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold text-[18px] leading-[28px] tracking-[-0.45px]",
    3: "font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold text-[16px] leading-[24px]",
    4: "font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold text-[14px] leading-[20px]",
  };

  const classes = `text-[#171d17] ${levelClasses[level]} ${className}`.trim();

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
};

