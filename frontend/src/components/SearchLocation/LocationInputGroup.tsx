import React, { useState } from 'react';
import { Card } from '../ui/Card';

interface LocationInputGroupProps {
  origin: string;
  onOriginChange: (val: string) => void;
  destination: string;
  onDestinationChange: (dest: string) => void;
}

const suggestions = [
  'ハノイ工科大学',
  '国立映画センター',
  'ノイバイ国際空港',
  'ホアンキエム湖',
  'ロッテセンターハノイ',
  'ビンコムセンター・ファムゴックタック'
];

const LocationInputGroup: React.FC<LocationInputGroupProps> = ({ origin, onOriginChange, destination, onDestinationChange }) => {
  const [activeInput, setActiveInput] = useState<'origin' | 'destination' | null>(null);

  // Filter mock suggestions based on input
  const filteredOrigin = suggestions.filter(s => s.toLowerCase().includes(origin.toLowerCase()) && origin.length > 0);
  const filteredDestination = suggestions.filter(s => s.toLowerCase().includes(destination.toLowerCase()) && destination.length > 0);

  return (
    <Card variant="default" padding="none" rounded="lg" className="sl-input-card">
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
            onBlur={() => setTimeout(() => setActiveInput(null), 200)}
            placeholder="現在地を取得中..." 
          />
          {activeInput === 'origin' && filteredOrigin.length > 0 && (
            <div className="sl-suggest-dropdown">
              {filteredOrigin.map((s, i) => (
                <div key={i} className="sl-suggest-item" onClick={() => { onOriginChange(s); setActiveInput(null); }}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
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
            onBlur={() => setTimeout(() => setActiveInput(null), 200)}
            maxLength={100}
          />
          {activeInput === 'destination' && filteredDestination.length > 0 && (
            <div className="sl-suggest-dropdown">
              {filteredDestination.map((s, i) => (
                <div key={i} className="sl-suggest-item" onClick={() => { onDestinationChange(s); setActiveInput(null); }}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default LocationInputGroup;
