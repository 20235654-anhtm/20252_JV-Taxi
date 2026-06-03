import React from 'react';
import IconSmallGreenLoca from '../../assets/IconSmallGreenLoca.svg';
import IconClock from '../../assets/IconClock.svg';
import { MapView } from '../features/MapView';
import { LocationMarker } from '../features/LocationMarker';
import type { MapSectionProps } from '../../types/TripSummaryDetail';

const MapSection: React.FC<MapSectionProps> = ({ distance, duration, status, pickupPosition, destinationPosition }) => {
  return (
    <div style={{alignSelf: 'stretch', height: 256, position: 'relative', background: 'white', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)', overflow: 'hidden', borderRadius: 40, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
      
      {/* Bản đồ thật */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <MapView 
          position={null}
          pickupPosition={pickupPosition}
          destinationPosition={destinationPosition}
          interactive={false}
          hidePickupMarker={true}
          hideDestinationMarker={true}
        >
          {pickupPosition && (
            <LocationMarker 
              position={pickupPosition} 
              showPickupLabel={false} 
              type="pickup"
              color="#006D37" 
              pulseColor="rgba(0, 109, 55, 0.45)"
              isOutline={true}
            />
          )}
          {destinationPosition && (
            <LocationMarker 
              position={destinationPosition} 
              showPickupLabel={false} 
              type="destination"
              color="#FEA520" 
              pulseColor="rgba(254, 165, 32, 0.45)" 
            />
          )}
        </MapView>
      </div>

      <div style={{width: '100%', height: 256, left: 0, top: 0, position: 'absolute', background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0) 100%)', pointerEvents: 'none', zIndex: 1}} />
      
      {/* Thông tin chặng đường */}
      <div style={{paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, left: 17.17, top: 178, position: 'absolute', background: 'rgba(255, 255, 255, 0.90)', borderRadius: 32, outline: '1px rgba(255, 255, 255, 0.20) solid', outlineOffset: '-1px', backdropFilter: 'blur(6px)', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'flex', zIndex: 2}}>
        <div style={{width: 98.45, height: 62, left: 0, top: 0, position: 'absolute', background: 'rgba(255, 255, 255, 0)', boxShadow: '0px 4px 6px -4px rgba(0, 0, 0, 0.10), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)', borderRadius: 32}} />
        <div style={{paddingRight: 4.30, justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
          <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
            <img src={IconSmallGreenLoca} alt="loc" style={{width: 14, height: 14}} />
          </div>
          <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
            <div style={{height: 16, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', lineHeight: '16px', wordWrap: 'break-word'}}>{distance} km</div>
          </div>
        </div>
        <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
          <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
            <img src={IconClock} alt="clock" style={{width: 14, height: 14}} />
          </div>
          <div style={{height: 16, justifyContent: 'center', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <span style={{color: '#171D17', fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', lineHeight: '16px', wordWrap: 'break-word', marginRight: 2}}>{duration}</span>
            <span style={{color: '#171D17', fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: '16px', wordWrap: 'break-word'}}>分</span>
          </div>
        </div>
      </div>

      {/* Trạng thái */}
      <div style={{paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, right: 16, top: 208, position: 'absolute', background: '#006D37', borderRadius: 9999, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex', zIndex: 2}}>
        <div style={{height: 16, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'white', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', lineHeight: '16px', wordWrap: 'break-word'}}>{status}</div>
      </div>
    </div>
  );
};

export default MapSection;
