import React, { useState } from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  borderColor?: string;
  size?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = 'Avatar',
      name,
      borderColor = '#27ae60',
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const [imgError, setImgError] = useState(false);

    // Consider src invalid if empty, placeholder, or failed to load
    const hasValidSrc = src && 
                        !src.includes('pravatar.cc') && 
                        !src.includes('avatar.iran.liara.run/public') && 
                        !src.includes('placehold.co') && 
                        !imgError;

    const displayName = name || alt;
    const initial = (displayName && displayName.trim() ? displayName.trim().charAt(0) : 'U').toUpperCase();

    // Default classes to keep it round and centered (unless overridden by rounded- class or custom avatar/squircle classes)
    const hasRounded = /rounded-/.test(className) || /avatar/.test(className) || /squircle/.test(className);
    const roundedClass = hasRounded ? '' : 'rounded-full';
    const defaultClasses = `relative flex-shrink-0 overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#006d37] to-[#21a45d] text-white font-black select-none ${roundedClass}`.trim();
    
    // Check if custom width/height is provided in className (e.g. w-[64px] or w-10 etc)
    const hasSize = /\b[wh]-/.test(className);
    const sizeClasses = hasSize ? '' : 'w-[40px] h-[40px] min-w-[40px] min-h-[40px]';

    return (
      <div 
        ref={ref} 
        className={`${defaultClasses} ${sizeClasses} ${className}`.trim()}
        style={style}
        {...props}
      >
        {hasValidSrc ? (
          <img 
            alt={alt} 
            className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover rounded-[inherit]" 
            src={src} 
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-[inherit]">{initial}</span>
        )}
        
        {/* Border overlay */}
        {borderColor && borderColor !== 'none' && borderColor !== 'transparent' && (
          <div
            aria-hidden="true"
            className="absolute border-2 border-solid inset-0 pointer-events-none rounded-[inherit]"
            style={{ borderColor }}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';