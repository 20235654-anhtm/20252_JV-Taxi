import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { useLocationSuggestions } from '../../hooks/useLocationSuggestions';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationInputGroupProps {
  origin: string;
  onOriginChange: (val: string, coords?: [number, number]) => void;
  destination: string;
  onDestinationChange: (dest: string, coords?: [number, number]) => void;
}

const LocationInputGroup: React.FC<LocationInputGroupProps> = ({ 
  origin, 
  onOriginChange, 
  destination, 
  onDestinationChange 
}) => {
  const [activeInput, setActiveInput] = useState<'origin' | 'destination' | null>(null);

  // Hook lấy gợi ý cho ô đang active
  const searchQuery = activeInput === 'origin' ? origin : destination;
  const { suggestions, isLoading } = useLocationSuggestions(searchQuery);

  const handleSelect = (name: string, coords?: [number, number]) => {
    if (activeInput === 'origin') {
      onOriginChange(name, coords);
    } else {
      onDestinationChange(name, coords);
    }
    setActiveInput(null);
  };

  return (
    <Card variant="default" padding="none" rounded="lg" className="sl-input-card relative z-[1050]">
      {/* Ô NHẬP HIỆN TẠI (ORIGIN) */}
      <div className="sl-input-item">
        <div className="sl-dot-green"></div>
        <div className="sl-input-content">
          <div className="sl-input-label">現在地</div>
          <input 
            type="text" 
            className="sl-input-field" 
            value={origin} 
            onChange={(e) => onOriginChange(e.target.value)}
            onFocus={() => setActiveInput('origin')}
            placeholder="現在地を取得中..." 
          />
        </div>
      </div>
      
      {/* Ô NHẬP ĐIỂM ĐẾN (DESTINATION) */}
      <div className="sl-input-item">
        <div className="sl-square-orange"></div>
        <div className="sl-input-content">
          <div className="sl-input-label orange">目的地</div>
          <input 
            type="text" 
            className="sl-input-field" 
            placeholder="どこへ行きますか？"
            value={destination}
            onChange={(e) => onDestinationChange(e.target.value)}
            onFocus={() => setActiveInput('destination')}
            maxLength={100}
          />
        </div>
      </div>

      {/* DROPDOWN GỢI Ý CHUNG */}
      {activeInput && searchQuery.length >= 2 && (
        <div className="sl-suggest-dropdown">
          {isLoading ? (
            <div className="flex items-center justify-center p-6 gap-2 text-[#64748b]">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-[14px]">Địa điểm đang tải...</span>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center gap-4 p-4 hover:bg-[#f8fafc] cursor-pointer border-b border-[#f1f5f9] last:border-none transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault(); // Ngăn chặn onBlur làm đóng dropdown trước khi click
                  handleSelect(item.name, item.coordinates);
                }}
              >
                <div className="w-8 h-8 rounded-full bg-[#eff6ec] flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-[#006d37]" />
                </div>
                <div className="flex flex-col overflow-hidden text-left">
                  <div className="text-[15px] font-bold text-[#1e293b] truncate">{item.name}</div>
                  <div className="text-[12px] text-[#64748b] truncate">{item.address}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-[#64748b] text-[14px]">
              Không tìm thấy địa điểm nào khớp
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default LocationInputGroup;
