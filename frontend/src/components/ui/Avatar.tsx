import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  borderColor?: string;
  size?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt = 'Avatar',
      borderColor = '#27ae60',
      className = ''
    },
    ref
  ) => {
    
    return (
      <div ref={ref} className={`relative rounded-full w-[40px] h-[40px] min-w-[40px] min-h-[40px] flex-shrink-0 overflow-hidden ${className}`.trim()}>
        {/* Image layer - fill entire container */}
        {src && (
          <img 
            alt={alt} 
            className="absolute inset-0 w-full h-full min-w-full min-h-full object-cover" 
            src={src} 
          />
        )}
        
        {/* Border overlay - 2px inset to account for padding */}
        <div
          aria-hidden="true"
          className="absolute border-2 border-solid inset-0 pointer-events-none rounded-full"
          style={{ borderColor }}
        />
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';