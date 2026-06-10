import React from 'react';
import type { FilterSectionProps } from '../../types/TripHistory';

const FilterSection: React.FC<FilterSectionProps> = ({ activeFilter, onFilterChange }) => {
  return (
    <div style={{ display: 'flex', gap: 12, height: 62, alignItems: 'center', width: '100%' }}>
      <div 
        onClick={() => onFilterChange(activeFilter === 'today' ? 'all' : 'today')}
        style={{ width: 120, height: 40, background: activeFilter === 'today' ? '#006D37' : '#E3EAE0', borderRadius: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
      >
        <span style={{ color: activeFilter === 'today' ? 'white' : '#171D17', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', lineHeight: '20px' }}>今日</span>
      </div>
      <div 
        onClick={() => onFilterChange(activeFilter === 'week' ? 'all' : 'week')}
        style={{ width: 132, height: 40, background: activeFilter === 'week' ? '#006D37' : '#E3EAE0', borderRadius: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
      >
        <span style={{ color: activeFilter === 'week' ? 'white' : '#171D17', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', lineHeight: '20px' }}>今週</span>
      </div>
    </div>
  );
};

export default FilterSection;
