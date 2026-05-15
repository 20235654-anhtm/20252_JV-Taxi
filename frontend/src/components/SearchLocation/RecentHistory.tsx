import React from 'react';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { MapPin, History } from 'lucide-react';

export interface HistoryItem {
  id: string;
  name: string;
  address: string;
  coords?: { lat: number; lng: number };
}

interface RecentHistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

const RecentHistory: React.FC<RecentHistoryProps> = ({ history, onSelect }) => {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="sl-history">
      <Heading level={3} className="sl-history-title">最近の履歴</Heading>
      <div className="sl-history-list">
        {history.slice(0, 3).map(item => (
          <div key={item.id} className="sl-history-item" onClick={() => onSelect(item)}>
            <div className="sl-history-icon-wrapper">
              <MapPin size={20} />
            </div>
            <div className="sl-history-info">
              <Text weight="bold" color="primary" className="sl-history-name">{item.name}</Text>
              <Text variant="caption" color="secondary" className="sl-history-address">{item.address}</Text>
            </div>
            <div className="sl-history-action">
              <History size={18} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentHistory;
