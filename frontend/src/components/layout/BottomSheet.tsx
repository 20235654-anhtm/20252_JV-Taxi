import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showHandle?: boolean;
  showCloseButton?: boolean;
  maxHeight?: string;
  snapPoints?: number[];
  className?: string;
  zIndex?: number;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showHandle = true,
  showCloseButton = false,
  //maxHeight = '90vh',
  snapPoints = [40, 70, 90], // Default snap points in vh
  className = '',
  zIndex,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [currentSnapIndex, setCurrentSnapIndex] = useState(1); // Start at middle snap point
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setCurrentY(clientY);
  };

  // Handle drag move
  const handleDragMove = React.useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDragging) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setCurrentY(clientY);
  }, [isDragging]);

  // Handle drag end
  const handleDragEnd = React.useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const delta = currentY - startY;
    const threshold = 50; // pixels

    if (delta > threshold) {
      // Dragged down - go to smaller snap point or close
      if (currentSnapIndex > 0) {
        setCurrentSnapIndex(currentSnapIndex - 1);
      } else {
        onClose();
      }
    } else if (delta < -threshold) {
      // Dragged up - go to larger snap point
      if (currentSnapIndex < snapPoints.length - 1) {
        setCurrentSnapIndex(currentSnapIndex + 1);
      }
    }

    setStartY(0);
    setCurrentY(0);
  }, [isDragging, currentY, startY, currentSnapIndex, onClose, snapPoints.length]);

  // Add drag event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleDragMove);
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('touchend', handleDragEnd);
      document.addEventListener('mouseup', handleDragEnd);

      return () => {
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('touchend', handleDragEnd);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate drag offset
  const dragOffset = isDragging ? currentY - startY : 0;
  const currentHeight = snapPoints[currentSnapIndex];

  return (
    <div
      className={`fixed inset-0 flex items-end justify-center ${!zIndex ? 'z-[--z-modal]' : ''}`}
      style={zIndex ? { zIndex } : {}}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`
          relative w-full max-w-[672px] bg-white
          rounded-tl-[32px] rounded-tr-[32px]
          shadow-[--shadow-sheet]
          ${isDragging ? '' : 'transition-all duration-300'}
          ${className}
        `}
        style={{
          height: `${currentHeight}vh`,
          transform: isDragging ? `translateY(${Math.max(0, dragOffset)}px)` : 'translateY(0)',
        }}
      >
        {/* Handle - Draggable */}
        {showHandle && (
          <div
            className="flex justify-center pt-4 pb-3 cursor-grab active:cursor-grabbing"
            onTouchStart={handleDragStart}
            onMouseDown={handleDragStart}
          >
            <div className="w-12 h-[6px] bg-[#dde5db] rounded-full shadow-sm" />
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 pt-2 pb-2">
            {title && (
              <h2 className="font-bold text-[18px] sm:text-[20px] text-[--color-text-primary] tracking-[-0.5px]">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[--color-bg-secondary] transition-colors"
                aria-label="閉じる"
              >
                <X size={20} className="text-[--color-text-secondary]" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto px-4 sm:px-6 pb-6" style={{ height: 'calc(100% - 80px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

