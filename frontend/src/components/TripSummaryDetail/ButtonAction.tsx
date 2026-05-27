import React from 'react';
import type { ButtonActionProps } from '../../types/TripSummaryDetail';

const ButtonAction: React.FC<ButtonActionProps> = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{alignSelf: 'stretch', paddingTop: 20, paddingBottom: 20, position: 'relative', background: '#FEA520', borderRadius: 40, justifyContent: 'center', alignItems: 'center', display: 'flex', width: '100%', cursor: 'pointer'}}
    >
      <div style={{width: '100%', height: '100%', left: 0, top: 0, position: 'absolute', background: 'rgba(255, 255, 255, 0)', boxShadow: '0px 4px 6px -4px rgba(0, 0, 0, 0.10), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)', borderRadius: 40}} />
      <div style={{height: 28, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#694000', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', lineHeight: '28px', wordWrap: 'break-word', zIndex: 1}}>
        履歴に戻る
      </div>
    </div>
  );
};

export default ButtonAction;
