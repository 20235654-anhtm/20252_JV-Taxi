import React from 'react';
import type { SummaryCardProps } from '../../types/TripHistory';
import IconWallet from '../../assets/IconWallet.svg';
import IconIncrease from '../../assets/IconIncrease.svg';

const SummaryCard: React.FC<SummaryCardProps> = ({ summary }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  return (
    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex', gap: 16, width: '100%'}}>
      <div style={{alignSelf: 'stretch', padding: 24, background: 'white', borderRadius: 24, outline: '1px rgba(188, 202, 188, 0.15) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', display: 'flex'}}>
        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex'}}>
          <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex'}}>
            <div style={{height: 20, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3D4A3F', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', textTransform: 'uppercase', lineHeight: '20px', letterSpacing: 0.70, wordWrap: 'break-word'}}>合計収益</div>
            <img src={IconWallet} alt="wallet" style={{width: 19, height: 18}} />
          </div>
          <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#006D37', fontSize: 36, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', lineHeight: '40px', wordWrap: 'break-word'}}>₫{formatCurrency(summary.totalRevenue)}</div>
          </div>
        </div>
        <div style={{alignSelf: 'stretch', paddingTop: 24, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
            <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
              <img src={IconIncrease} alt="increase" style={{width: 12, height: 8}} />
            </div>
            <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
              <div style={{height: 20, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#006D37', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', lineHeight: '20px', wordWrap: 'break-word'}}>先週比 +{summary.weeklyGrowth}%</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{alignSelf: 'stretch', padding: 24, background: '#FFD392', borderRadius: 24, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', display: 'flex'}}>
        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#694000', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', textTransform: 'uppercase', lineHeight: '20px', letterSpacing: 0.70, wordWrap: 'break-word'}}>完了数</div>
        </div>
        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4.50, display: 'flex'}}>
          <div style={{height: 40, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#694000', fontSize: 36, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', lineHeight: '40px', wordWrap: 'break-word'}}>{summary.completedTrips}</div>
          <div style={{alignSelf: 'stretch', height: 20}} />
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
