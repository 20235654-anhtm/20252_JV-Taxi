import React from 'react';
import IconEmptyTick from '../../assets/IconEmptyTick.svg';
import { MapView } from '../features/MapView';
import type { MapCardProps } from '../../types/TripDetail';
import { LocationMarker } from '../features/LocationMarker';

export const MapCard: React.FC<MapCardProps> = ({ pickupPosition, destinationPosition, actualPath }) => {
  return (
    <div className="w-full h-[256px] relative bg-[#DDE5DB] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] overflow-hidden rounded-[24px] flex flex-col justify-center items-start">
      {/* Bản đồ thật */}
      <div className="absolute inset-0 z-0">
        <MapView 
          position={null}
          pickupPosition={pickupPosition}
          destinationPosition={destinationPosition}
          interactive={true}
          hidePickupMarker={true}
          hideDestinationMarker={true}
          actualPath={actualPath}
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

      {/* Overlay và Huy hiệu */}
      <div className="w-full h-[80px] absolute left-0 top-0 bg-gradient-to-b from-[rgba(6,78,59,0.30)] to-transparent pointer-events-none z-10" />
      <div className="absolute top-[26px] right-[16px] px-[16px] py-[8px] bg-white rounded-full flex justify-start items-center gap-[8px] shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10),0px_10px_15px_-3px_rgba(0,0,0,0.10)] z-20 pointer-events-auto">
        <div className="flex flex-col justify-start items-start">
          <img src={IconEmptyTick} alt="Tick" className="w-[20px] h-[20px]" />
        </div>
        <div className="flex flex-col justify-start items-start">
          <div className="h-[20px] flex flex-col justify-center text-[#171D17] text-[14px] font-['Plus_Jakarta_Sans',sans-serif] font-[700] leading-[20px] break-words">完了</div>
        </div>
      </div>
    </div>
  );
};
