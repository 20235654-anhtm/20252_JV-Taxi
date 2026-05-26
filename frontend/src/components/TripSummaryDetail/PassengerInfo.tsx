import React from 'react';
import type { PassengerInfoProps } from '../../types/TripSummaryDetail';

const PassengerInfo: React.FC<PassengerInfoProps> = ({ passenger, timeline }) => {
  return (
    <div style={{alignSelf: 'stretch', padding: 24, background: '#EFF6EC', borderRadius: 40, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'flex', width: '100%'}}>
      <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'flex'}}>
        <img style={{width: 56, height: 56, maxWidth: 310, position: 'relative', borderRadius: 32, objectFit: 'cover'}} src={passenger.avatarUrl} alt="passenger avatar" />
        <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex', flex: 1}}>
          <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{height: 24, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 16, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', lineHeight: '24px', wordWrap: 'break-word'}}>{passenger.name}</div>
          </div>
        </div>
        <div style={{width: 37.91, height: 40, background: '#DDE5DB', borderRadius: 9999, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
          <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'flex'}}>
            <img src="/src/assets/IconEmptyBlackMess.svg" alt="message" style={{width: 16.67, height: 16.67}} />
          </div>
        </div>
      </div>
      <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex'}}>
        <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'flex', marginTop: 4, marginBottom: 4}}>
          <div style={{width: 10, height: 10, background: '#F4FBF1', borderRadius: 9999, border: '2px #006D37 solid'}} />
          <div style={{width: 2, height: 40, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{width: 2, height: '100%', opacity: 0.30, background: '#BCCABC'}} />
          </div>
          <div style={{width: 10, height: 10, background: '#865300', borderRadius: 9999}} />
        </div>
        <div style={{flex: '1 1 0', alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex'}}>
          <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
              <div style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3D4A3F', fontSize: 10, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', textTransform: 'uppercase', lineHeight: '15px', letterSpacing: 0.50, wordWrap: 'break-word'}}>出発地 • {timeline.pickup.time}</div>
            </div>
            <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
              <div style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', lineHeight: '20px', wordWrap: 'break-word'}}>{timeline.pickup.location}</div>
            </div>
          </div>
          <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
            <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
              <div style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3D4A3F', fontSize: 10, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', textTransform: 'uppercase', lineHeight: '15px', letterSpacing: 0.50, wordWrap: 'break-word'}}> 目的地• {timeline.dropoff.time}</div>
            </div>
            <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
              <div style={{alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', lineHeight: '20px', wordWrap: 'break-word'}}>{timeline.dropoff.location}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerInfo;
