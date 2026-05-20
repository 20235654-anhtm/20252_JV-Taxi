import React, { useState, useRef } from 'react';
import { Card } from '../ui/Card';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { SearchInput } from '../ui/SearchInput';
import { Button } from '../ui/Button';
import { Clock, ArrowRight, History, MapPin } from 'lucide-react';
import { useLocationSuggestions } from '../../hooks/useLocationSuggestions';
import { useRecentDestinations } from '../../hooks/useRecentDestinations';

interface QuickBookingCardProps {
  userName?: string;
  isGuest?: boolean;
  onBookNow?: () => void;
  destinationValue: string;
  setDestinationValue: (val: string) => void;
}

export const QuickBookingCard: React.FC<QuickBookingCardProps> = ({
  userName = '佐藤',
  isGuest = false,
  onBookNow,
  destinationValue,
  setDestinationValue,
}) => {
  const [mode, setMode] = useState<'half' | 'expanded'>('half');
  const touchStartY = useRef<number | null>(null);

  // --- SỬ DỤNG HOOK TÌM KIẾM THẬT ---
  const { suggestions: apiSuggestions, isLoading } = useLocationSuggestions(destinationValue);

  // Lấy thông tin user để gọi API lịch sử
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const { recentDestinations } = useRecentDestinations(user?.id);

  // Logic hiển thị: 
  // 1. Nếu đang gõ (>2 ký tự) -> Hiện kết quả từ API
  // 2. Nếu không gõ -> Hiện lịch sử (Passenger) hoặc để trống (Guest)
  const suggestions = destinationValue.length >= 2
    ? apiSuggestions
    : (isGuest ? [] : recentDestinations);

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
          w-full max-w-[450px] mx-auto flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.12)] bg-white
          ${mode === 'half' ? 'h-auto' : 'h-full'}
          ${mode === 'expanded' ? 'rounded-t-[32px]' : ''}
        `}
      >
        {/* Handle Area */}
        <div
          className="h-8 flex items-start justify-center cursor-pointer pt-3 flex-shrink-0"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => setMode(mode === 'half' ? 'expanded' : 'half')}
        >
          <div className="w-[48px] h-[5px] bg-[#e2e8f0] rounded-full" />
        </div>

        <div className={`flex-1 overflow-hidden flex flex-col ${mode === 'half' ? 'px-5 pb-5' : 'px-6 pb-6'}`}>
          {/* HALF MODE CONTENT */}
          {mode === 'half' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <div className="flex flex-col gap-0 mt-1">
                <Text variant="body" color="medium" className="font-semibold text-[14px]">
                  {isGuest ? 'こんにちは' : `${userName}さん、こんにちは`}
                </Text>
                <Heading level={1} className="text-[23px] font-black tracking-tight leading-tight">
                  行き先は？
                </Heading>
              </div>

              <div className="flex flex-col gap-3">
                <SearchInput
                  value={destinationValue}
                  onValueChange={setDestinationValue}
                  placeholder="目的地を入力..."
                  rightIcon={!isGuest && <Clock size={24} className="text-[#cbd5e1]" />}
                  onFocus={() => setMode('expanded')}
                  error={destinationValue.length > 100}
                  maxLength={100}
                />
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={onBookNow}
                  className="text-[16px] font-bold h-[50px]"
                >
                  今すぐ呼ぶ
                </Button>
              </div>
            </div>
          )}

          {/* EXPANDED MODE CONTENT */}
          {mode === 'expanded' && (
            <div className="flex flex-col gap-6 h-full animate-in slide-in-from-bottom-4 duration-300">
              <Heading level={2} className="text-[20px]">どこへ行きますか？</Heading>

              <div className="relative">
                <SearchInput
                  value={destinationValue}
                  onValueChange={setDestinationValue}
                  placeholder="目的地を入力..."
                  autoFocus
                  error={destinationValue.length > 100}
                  maxLength={100}
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#006d37]"></div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 overflow-y-auto">
                {/* Chỉ hiện nhãn nếu có kết quả tìm kiếm hoặc có lịch sử (và lịch sử không trống) */}
                {((destinationValue.length >= 2) || (!isGuest && suggestions.length > 0)) && (
                  <Text variant="label" color="tertiary" className="text-[11px] font-bold">
                    {destinationValue.length >= 2 ? '検索結果' : '最近の履歴'}
                  </Text>
                )}

                {suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 py-3 border-b border-[#f1f5f9] cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        setDestinationValue(item.name);
                        setMode('half');
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center flex-shrink-0">
                        {destinationValue.length >= 2
                          ? <MapPin size={18} className="text-[#64748b]" />
                          : <History size={18} className="text-[#64748b]" />
                        }
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <Text variant="body" weight="bold" color="primary" className="truncate">{item.name}</Text>
                        <Text variant="small" color="medium" className="truncate text-[12px]">{item.address}</Text>
                      </div>
                    </div>
                  ))
                ) : (
                  destinationValue.length >= 2 && !isLoading && (
                    <Text color="medium" className="text-center py-4"> 検索結果なし </Text>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
