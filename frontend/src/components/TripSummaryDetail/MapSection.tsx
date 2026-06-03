import React from 'react';
import type { MapSectionProps } from '../../types/TripSummaryDetail';
import { MapView } from '../features/MapView';
import { LocationMarker } from '../features/LocationMarker';

const MapSection: React.FC<MapSectionProps> = ({ 
  distance, 
  duration, 
  status,
  pickupPosition,
  destinationPosition,
  actualPath
}) => {
  const pickup = pickupPosition || { lat: 21.0285, lng: 105.8542 };
  const destination = destinationPosition || { lat: 21.0125, lng: 105.8425 };

  return (
    <div style={{
      alignSelf: 'stretch', 
      height: 256, 
      position: 'relative', 
      background: '#DDE5DB', 
      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)', 
      overflow: 'hidden', 
      borderRadius: 40, 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'flex-start', 
      display: 'flex'
    }}>
      {/* Bản đồ thật */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0
      }}>
        <MapView 
          position={null}
          pickupPosition={pickup}
          destinationPosition={destination}
          interactive={true}
          hidePickupMarker={true}
          hideDestinationMarker={true}
          routeColor="#171D17"
          showDots={true}
          actualPath={actualPath}
        >
          {pickup && (
            <LocationMarker 
              position={pickup} 
              showPickupLabel={false} 
              type="pickup"
              color="#006D37" 
              pulseColor="rgba(0, 109, 55, 0.45)"
              isOutline={true}
            />
          )}
          {destination && (
            <LocationMarker 
              position={destination} 
              showPickupLabel={false} 
              type="destination"
              color="#FEA520" 
              pulseColor="rgba(254, 165, 32, 0.45)" 
            />
          )}
        </MapView>
      </div>

      {/* Overlay và các nhãn trên bản đồ */}
      <div style={{
        width: '100%', 
        height: 256, 
        left: 0, 
        top: 0, 
        position: 'absolute', 
        background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0) 100%)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Thông tin quãng đường và thời gian (Phía dưới bên trái) */}
      <div style={{
        paddingLeft: 16, 
        paddingRight: 16, 
        paddingTop: 12, 
        paddingBottom: 12, 
        left: 17.17, 
        top: 158, 
        position: 'absolute', 
        background: 'rgba(255, 255, 255, 0.90)', 
        borderRadius: 32, 
        outline: '1px rgba(255, 255, 255, 0.20) solid', 
        outlineOffset: '-1px', 
        backdropFilter: 'blur(6px)', 
        flexDirection: 'column', 
        justifyContent: 'flex-start', 
        alignItems: 'flex-start', 
        gap: 4, 
        display: 'flex',
        zIndex: 2,
        boxShadow: '0px 4px 6px -4px rgba(0, 0, 0, 0.10), 0px 10px 15px -3px rgba(0, 0, 0, 0.10)'
      }}>
        <div style={{paddingRight: 4.30, justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
          <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
            <img src="/src/assets/IconSmallGreenLoca.svg" alt="loc" style={{width: 14, height: 14}} />
          </div>
          <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
            <div style={{height: 16, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', lineHeight: '16px', wordWrap: 'break-word'}}>{distance} km</div>
          </div>
        </div>
        <div style={{justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'inline-flex'}}>
          <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
            <img src="/src/assets/IconClock.svg" alt="clock" style={{width: 14, height: 14}} />
          </div>
          <div style={{height: 16, justifyContent: 'center', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <span style={{color: '#171D17', fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', lineHeight: '16px', wordWrap: 'break-word', marginRight: 2}}>{duration}</span>
            <span style={{color: '#171D17', fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: '16px', wordWrap: 'break-word'}}>分</span>
          </div>
        </div>
      </div>

      {/* Trạng thái chuyến đi (Phía dưới bên phải) */}
      <div style={{
        paddingLeft: 16, 
        paddingRight: 16, 
        paddingTop: 8, 
        paddingBottom: 8, 
        right: 16, 
        top: 188, 
        position: 'absolute', 
        background: '#006D37', 
        borderRadius: 9999, 
        flexDirection: 'column', 
        justifyContent: 'flex-start', 
        alignItems: 'flex-start', 
        display: 'flex',
        zIndex: 2
      }}>
        <div style={{
          height: 16, 
          textAlign: 'center', 
          justifyContent: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          color: 'white', 
          fontSize: 13, 
          fontFamily: 'Plus Jakarta Sans', 
          fontWeight: '700', 
          lineHeight: '16px', 
          wordWrap: 'break-word'
        }}>{status}</div>
      </div>
    </div>
  );
};

export default MapSection;
