import React from 'react';
import type { TripCardProps } from '../../types/TripHistory';
import IconGreenCar from '../../assets/IconGreenCar.svg';

const TripCard: React.FC<TripCardProps> = ({ trip, onClick }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  const getStatusStyle = (statusLabel: string) => {
    switch (statusLabel?.trim()) {
      case '保留中': // PENDING
        return { bg: 'rgba(254, 165, 32, 0.15)', text: '#FEA520' }; // Orange
      case '受付済': // ACCEPTED
        return { bg: 'rgba(45, 156, 219, 0.15)', text: '#2D9CDB' }; // Blue
      case '支払済': // COMPLETED (Paid)
      case '完了':
        return { bg: 'rgba(39, 174, 96, 0.15)', text: '#27AE60' }; // Green
      case '拒否': // REJECTED
        return { bg: 'rgba(235, 87, 87, 0.15)', text: '#EB5757' }; // Red
      case 'キャンセル済': // CANCELLED
        return { bg: 'rgba(140, 153, 142, 0.15)', text: '#8C998E' }; // Gray
      default:
        return { bg: 'rgba(39, 174, 96, 0.15)', text: '#27AE60' };
    }
  };

  const statusStyle = getStatusStyle(trip.status);

  return (
    <div onClick={onClick} style={{alignSelf: 'stretch', padding: 20, background: '#EFF6EC', borderRadius: 24, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex', width: '100%', cursor: onClick ? 'pointer' : 'default'}}>
      <div style={{alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-start', display: 'flex'}}>
        <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'flex'}}>
          <div style={{width: 48, height: 48, background: 'rgba(97, 222, 138, 0.30)', borderRadius: 16, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
            <img src={IconGreenCar} alt="car" style={{width: 24, height: 24}} />
          </div>
          <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
            <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
              <div style={{height: 48, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', lineHeight: '24px', wordWrap: 'break-word'}}>
                {trip.date}<br/>{trip.time}
              </div>
            </div>
          </div>
        </div>
        <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-end', display: 'flex', gap: 4}}>
          <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-end', display: 'flex'}}>
            <div style={{height: 28, textAlign: 'right', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#006D37', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: '800', lineHeight: '28px', wordWrap: 'break-word'}}>₫{formatCurrency(trip.price)}</div>
          </div>
          <div style={{paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2, background: statusStyle.bg, borderRadius: 9999, justifyContent: 'center', alignItems: 'center', display: 'inline-flex'}}>
            <div style={{textAlign: 'center', color: statusStyle.text, fontSize: 10, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', textTransform: 'uppercase', lineHeight: '15px', wordWrap: 'break-word'}}>{trip.status}</div>
          </div>
        </div>
      </div>
      <div style={{alignSelf: 'stretch', paddingLeft: 16, position: 'relative', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex'}}>
        <div style={{width: 2, height: 'calc(100% - 24px)', left: 20, top: 12, position: 'absolute', background: 'rgba(188, 202, 188, 0.30)'}} />
        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex'}}>
          <div style={{width: 10, height: 10, position: 'relative', background: '#006D37', borderRadius: 9999, marginTop: 12}}>
            <div style={{width: 10, height: 10, left: 0, top: 0, position: 'absolute', background: 'rgba(255, 255, 255, 0)', boxShadow: '0px 0px 0px 4px rgba(0, 109, 55, 0.10)', borderRadius: 9999}} />
          </div>
          <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
            <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
              <div style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3D4A3F', fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: '12px', wordWrap: 'break-word'}}>出発地</div>
            </div>
            <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
              <div style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '20px', wordWrap: 'break-word'}}>{trip.pickupLocation}</div>
            </div>
          </div>
        </div>
        <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex'}}>
          <div style={{width: 10, height: 10, position: 'relative', background: '#865300', borderRadius: 9999, marginTop: 12}}>
            <div style={{width: 10, height: 10, left: 0, top: 0, position: 'absolute', background: 'rgba(255, 255, 255, 0)', boxShadow: '0px 0px 0px 4px rgba(134, 83, 0, 0.10)', borderRadius: 9999}} />
          </div>
          <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex'}}>
            <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
              <div style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3D4A3F', fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: '12px', wordWrap: 'break-word'}}>目的地</div>
            </div>
            <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
              <div style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '20px', wordWrap: 'break-word'}}>{trip.destination}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
