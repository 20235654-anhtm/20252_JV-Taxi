import React from 'react';
import IconBill from '../../assets/IconBill.svg';
import type { BillSectionProps } from '../../types/TripSummaryDetail';

const BillSection: React.FC<BillSectionProps> = ({ distance, distanceFee, bookingFee, total }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  return (
    <div style={{alignSelf: 'stretch', padding: 24, background: 'white', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 40, outline: '1px rgba(0, 109, 55, 0.05) solid', outlineOffset: '-1px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'flex', width: '100%'}}>
      <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex'}}>
        <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <img src={IconBill} alt="bill" style={{width: 18, height: 20}} />
        </div>
        <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
          <div style={{height: 24, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', lineHeight: '24px', wordWrap: 'break-word'}}>料金明細</div>
        </div>
        <div style={{flex: '1 1 0', height: 15, minWidth: 40}} />
      </div>
      <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex'}}>
        <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'flex'}}>
          <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
              <div style={{height: 20, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 15, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '20px', wordWrap: 'break-word'}}>距離({distance} km)</div>
            </div>
            <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
              <div style={{height: 20, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3D4A3F', fontSize: 15, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '20px', wordWrap: 'break-word'}}>距離料金</div>
            </div>
          </div>
          <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{height: 20, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', lineHeight: '20px', wordWrap: 'break-word'}}>₫{formatCurrency(distanceFee)}</div>
          </div>
        </div>
        <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'flex'}}>
          <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
              <div style={{height: 20, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3D4A3F', fontSize: 15, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: '24px', wordWrap: 'break-word'}}>指名料</div>
            </div>
          </div>
          <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{height: 20, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', lineHeight: '20px', wordWrap: 'break-word'}}>₫{formatCurrency(bookingFee)}</div>
          </div>
        </div>
        <div style={{alignSelf: 'stretch', height: 1, background: 'rgba(188, 202, 188, 0.20)'}} />
        <div style={{alignSelf: 'stretch', paddingTop: 8, justifyContent: 'space-between', alignItems: 'center', display: 'flex'}}>
          <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
              <div style={{height: 28, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', lineHeight: '28px', wordWrap: 'break-word'}}>手取り合計</div>
            </div>
          </div>
          <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{height: 32, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#006D37', fontSize: 24, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', lineHeight: '32px', wordWrap: 'break-word'}}>₫{formatCurrency(total)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillSection;
