import React from 'react';
import type { TotalIncomeCardProps } from '../../types/TripSummaryDetail';

const TotalIncomeCard: React.FC<TotalIncomeCardProps> = ({ totalIncome, tip, rating }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  return (
    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex', width: '100%'}}>
      <div style={{alignSelf: 'stretch', paddingTop: 23, paddingBottom: 24, paddingLeft: 24, paddingRight: 24, position: 'relative', background: 'linear-gradient(170deg, #006D37 0%, #27AE60 100%)', borderRadius: 40, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', display: 'flex'}}>
        <div style={{width: '100%', height: '100%', left: 0, top: 0, position: 'absolute', background: 'rgba(255, 255, 255, 0)', boxShadow: '0px 4px 6px -4px rgba(0, 0, 0, 0.10), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)', borderRadius: 40}} />
        <div style={{alignSelf: 'stretch', paddingBottom: 8, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div style={{alignSelf: 'stretch', opacity: 0.80, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'white', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', textTransform: 'uppercase', lineHeight: '16.50px', letterSpacing: 1.10, wordWrap: 'break-word'}}>総収入</div>
          </div>
        </div>
        <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex'}}>
          <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'white', fontSize: 36, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', lineHeight: '40px', wordWrap: 'break-word'}}>₫{formatCurrency(totalIncome)}</div>
          </div>
          <div style={{alignSelf: 'stretch', opacity: 0.90, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'white', fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '16px', wordWrap: 'break-word'}}>+チップ{formatCurrency(tip)}₫を含む</div>
          </div>
        </div>
      </div>
      
      <div style={{marginTop: 20, zIndex: 10, alignSelf: 'stretch', padding: 24, background: 'white', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 40, outline: '1px rgba(0, 109, 55, 0.05) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', display: 'flex'}}>
        <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-start', display: 'flex'}}>
          <div style={{height: 31.50, position: 'relative'}}>
            <div style={{height: 17, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3D4A3F', fontSize: 11, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', textTransform: 'uppercase', lineHeight: '16.50px', letterSpacing: 1.10, wordWrap: 'break-word'}}>受け取った評価</div>
          </div>
          <img src="/src/assets/IconEmotyBrownStar.svg" alt="star" style={{width: 25, height: 25}} />
        </div>
        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-end', gap: 8, display: 'flex'}}>
          <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{height: 40, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 36, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', lineHeight: '40px', wordWrap: 'break-word'}}>{rating.toFixed(1)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TotalIncomeCard;
