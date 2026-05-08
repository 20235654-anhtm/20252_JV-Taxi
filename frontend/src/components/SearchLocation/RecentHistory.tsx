import React from 'react';

export interface HistoryItem {
  id: string;
  name: string;
  address: string;
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
      <h3 className="sl-history-title">最近の履歴</h3>
      <div className="sl-history-list">
        {history.slice(0, 3).map(item => (
          <div key={item.id} className="sl-history-item" onClick={() => onSelect(item)}>
            <div className="sl-history-icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div className="sl-history-info">
              <div className="sl-history-name">{item.name}</div>
              <div className="sl-history-address">{item.address}</div>
            </div>
            <div className="sl-history-action">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentHistory;
