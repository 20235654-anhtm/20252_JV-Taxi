import React, { useState, useRef } from 'react';
import { Card } from '../ui/Card';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { SearchInput } from '../ui/SearchInput';
import { Button } from '../ui/Button';
import { Clock, ArrowRight, History } from 'lucide-react';

interface QuickBookingCardProps {
  userName?: string;
  isGuest?: boolean; // Thêm prop này
  onBookNow?: () => void;
  destinationValue: string;
  setDestinationValue: (val: string) => void;
}

export const QuickBookingCard: React.FC<QuickBookingCardProps> = ({
  userName = '佐藤',
  isGuest = false, // Mặc định là false
  onBookNow,
  destinationValue,
  setDestinationValue,
}) => {
  const [mode, setMode] = useState<'half' | 'expanded'>('half');
  const touchStartY = useRef<number | null>(null);

  // Gợi ý địa điểm: Guest không có gợi ý, Passenger thấy lịch sử
  const suggestions = isGuest ? [] : [
    { id: 1, name: 'Vinh Yên Tower', address: 'Khai Quang, Vinh Yên, Vinh Phúc' },
    { id: 2, name: 'Ga Vinh Yên', address: 'Phường Đống Đa, Vinh Yên' },
    { id: 3, name: 'Big C Vinh Yên', address: 'Phường Khai Quang, Vinh Yên' },
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (deltaY < -50 && mode === 'half') setMode('expanded'); // Vuốt lên
    if (deltaY > 50 && mode === 'expanded') setMode('half');  // Vuốt xuống
    
    touchStartY.current = null;
  };

  return (
    <div 
      className={`
        fixed left-0 right-0 z-[1050] transition-all duration-500 ease-out
        ${mode === 'half' ? 'bottom-[88px] px-4' : 'top-16 bottom-0 px-0'}
      `}
    >
      <Card 
        variant="elevated" 
        padding="none"
        rounded={mode === 'half' ? 'xl' : 'none'}
        className={`
          w-full max-w-[450px] mx-auto h-full flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.12)] bg-white
          ${mode === 'expanded' ? 'rounded-t-[32px]' : ''}
        `}
      >
        {/* Handle Area */}
        <div 
          className="h-10 flex items-start justify-center cursor-pointer pt-4 flex-shrink-0"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => setMode(mode === 'half' ? 'expanded' : 'half')}
        >
          <div className="w-[48px] h-[5px] bg-[#e2e8f0] rounded-full" />
        </div>

        <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6">
          {/* HALF MODE CONTENT */}
          {mode === 'half' && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-300">
              <div className="flex flex-col gap-0.5 mt-2">
                <Text variant="body" color="medium" className="font-medium text-[15px]">
                  {isGuest ? 'こんにちは' : `${userName}さん、こんにちは`}
                </Text>
                <Heading level={1} className="text-[28px] font-black tracking-tight">
                  行き先は？
                </Heading>
              </div>

              <div className="flex flex-col gap-4">
                <SearchInput
                  value={destinationValue}
                  onValueChange={setDestinationValue}
                  placeholder="目的地を入力..."
                  rightIcon={!isGuest && <Clock size={24} className="text-[#cbd5e1]" />}
                  onFocus={() => setMode('expanded')}
                />
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={onBookNow}
                  className="text-[18px] font-bold h-[60px]"
                >
                  今すぐ予約
                </Button>
              </div>
            </div>
          )}

          {/* EXPANDED MODE CONTENT */}
          {mode === 'expanded' && (
            <div className="flex flex-col gap-6 h-full animate-in slide-in-from-bottom-4 duration-300">
              <Heading level={2} className="text-[20px]">どこへ行きますか？</Heading>
              
              <SearchInput
                value={destinationValue}
                onValueChange={setDestinationValue}
                placeholder="目的地を入力..."
                autoFocus
              />

              <div className="flex flex-col gap-4 overflow-y-auto">
                {!isGuest && (
                  <>
                    <Text variant="label" color="tertiary" className="text-[11px] font-bold">最近の履歴</Text>
                    {suggestions.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center gap-4 py-2 border-b border-[#f1f5f9] cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => {
                          setDestinationValue(item.name);
                          setMode('half');
                        }}
                      >
                        <div className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center flex-shrink-0">
                          <History size={18} className="text-[#64748b]" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <Text variant="body" weight="bold" color="primary" className="truncate">{item.name}</Text>
                          <Text variant="small" color="medium" className="truncate text-[12px]">{item.address}</Text>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
