import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { Header } from '../../components/layout/Header';
import { BottomSheet } from '../../components/layout/BottomSheet';
import { MapView } from '../../components/features/MapView';
import { Avatar } from '../../components/ui/Avatar';
import { FAB } from '../../components/ui/FAB';

// SVG Icons from assets
import IconCall from '../../assets/IconCall.svg';
import IconMess from '../../assets/IconMess.svg';
import IconCard from '../../assets/IconCard.svg';
import IconLocation from '../../assets/IconLocation.svg';

const pickupPosition = { lat: 21.0285, lng: 105.8542 };
const destinationPosition = { lat: 21.0031, lng: 105.8152 }; // Mock destination

const destinationIcon = L.divIcon({
  className: 'custom-dest-marker',
  iconSize: [140, 100],
  iconAnchor: [70, 24], // Center of the 49px tall marker circle
  html: `
    <div class="flex flex-col items-center">
      <div class="w-[44px] h-[49px] bg-[#865300] rounded-[9999px] flex items-center justify-center mb-1.5 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.10),0_4px_6px_-4px_rgba(0,0,0,0.10)] border-[4px] border-white box-border">
        <img src="${IconLocation}" alt="Destination" class="w-[20px] h-[25px] object-contain" />
      </div>
      <div class="bg-white border-[1.5px] border-[#865300] rounded-[10px] py-1 px-3.5 text-center shadow-md whitespace-nowrap">
        <div class="text-[10px] font-extrabold text-[#865300] leading-tight mb-0.5">目的地</div>
        <div class="text-[13px] font-extrabold text-[#1a1a1a] leading-tight">ロイヤルシティ</div>
      </div>
    </div>
  `
});

export default function WatingDriverPickup() {
  const navigate = useNavigate();
  const [recenterKey, setRecenterKey] = useState(0);

  const handleChat = () => navigate('/passenger/chat');
  const handleCall = () => navigate('/passenger/call-driver');
  const handleRecenter = () => setRecenterKey(prev => prev + 1);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#f5f5f5]">
      <Header
        title="ライブ追跡"
        showBackButton
        onBackClick={() => navigate(-1)}
        hideLanguageToggle
      />

      <div className="absolute inset-0 z-0">
        <MapView
          position={null}
          pickupPosition={pickupPosition}
          destinationPosition={destinationPosition}
          recenterKey={recenterKey}
          showPickupLabel={false}
          hideDestinationMarker={true}
          routeColor="url(#routeGradient)"
          routePadding={[[50, 120], [50, 380]]}
          viewPadding={{ top: 100, bottom: 400, left: 50, right: 50 }}
        >
          {/* Custom marker cho điểm đến */}
          <Marker position={[destinationPosition.lat, destinationPosition.lng]} icon={destinationIcon} />
        </MapView>
      </div>

      <FAB onClick={handleRecenter} className="fixed top-[96px] right-4" />

      <BottomSheet 
        isOpen={true} 
        onClose={() => {}} 
        showHandle 
        snapPoints={[185, 345]} 
        initialSnapIndex={1}
        hasBackdrop={false}
        contentClassName="px-4 sm:px-6"
      >
        <div className="flex flex-col gap-6 pt-2 px-1.5 pb-4">
          {/* Driver Info */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-[20px]">
              <div className="relative inline-flex flex-col items-start justify-start">
                <img 
                  src="https://i.pravatar.cc/150?img=11" 
                  alt="Driver" 
                  className="w-[80px] h-[80px] object-cover shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.10),0px_4px_6px_-1px_rgba(0,0,0,0.10)] rounded-[28px]" 
                />
                <div className="absolute left-[40px] top-[65px] px-2 py-[2px] bg-[#FEA520] rounded-lg border-2 border-white flex flex-col justify-start items-start">
                  <div className="text-[#2B1700] text-[10px] font-bold leading-[15px] whitespace-nowrap">
                    4.9 ★
                  </div>
                </div>
              </div>
              
              <div className="inline-flex flex-col items-start justify-start">
                <div className="text-[#171D17] text-[24px] font-extrabold leading-[32px]">
                  Nguyen Tan
                </div>
                <div className="text-[#3D4A3F] text-[16px] font-medium leading-[24px]">
                  Toyota Camry
                </div>
                <div className="pt-1 flex flex-col items-start justify-start">
                  <div className="px-2 py-[2px] bg-[#E3EAE0] rounded flex items-center justify-center">
                    <div className="text-[#3D4A3F] text-[11px] font-bold uppercase leading-[16.5px] tracking-[0.55px]">
                      51H-123.45
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="inline-flex flex-col items-start justify-start w-[75.5px]">
              <div className="relative w-full h-[41px]">
                <div className="absolute left-[24.5px] top-[-0.5px] flex flex-col justify-center text-right text-[#006D37] text-[36px] font-black leading-[40px]">
                  3
                </div>
                <div className="absolute left-[48.5px] top-[5.5px] flex flex-col justify-center text-right text-[#006D37] text-[24px] font-extrabold leading-[28px]">
                  分
                </div>
              </div>
              <div className="flex flex-col items-end justify-start w-full">
                <div className="text-right text-[rgba(61,74,63,0.60)] text-[10px] font-bold uppercase leading-[15px] tracking-[1px]">
                  到着予定
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              className="flex-1 py-5 bg-[#EFF6EC] rounded-[24px] flex justify-center items-center gap-3 hover:bg-[#e8edea] transition-colors" 
              onClick={handleChat}
            >
              <div className="w-[40px] h-[40px] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-full flex items-center justify-center flex-shrink-0">
                <img src={IconMess} alt="Chat" className="w-[18px] h-[18px] object-contain" />
              </div>
              <div className="flex flex-col justify-start items-start">
                <div className="text-[#3D4A3F] text-[14px] font-bold leading-[15px] whitespace-nowrap">
                  チャット
                </div>
              </div>
            </button>
            
            <button 
              className="flex-1 py-5 bg-[#EFF6EC] rounded-[24px] flex justify-center items-center gap-3 hover:bg-[#e8edea] transition-colors" 
              onClick={handleCall}
            >
              <div className="w-[40px] h-[40px] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-full flex items-center justify-center flex-shrink-0">
                <img src={IconCall} alt="Call" className="w-[18px] h-[18px] object-contain" />
              </div>
              <div className="flex flex-col justify-start items-start">
                <div className="text-[#3D4A3F] text-[14px] font-bold leading-[15px] whitespace-nowrap">
                  電話をかける
                </div>
              </div>
            </button>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-start gap-[12px]">
            <div className="w-[40px] h-[40px] bg-[#E9F0E6] rounded-[12px] flex items-center justify-center flex-shrink-0">
              <img src={IconCard} alt="Wallet" className="w-[20px] h-[16px] object-contain" />
            </div>
            <div className="flex flex-col items-start justify-start gap-0.5">
              <div className="text-[#171D17] text-[12px] font-bold leading-[12px]">
                ウォレット決済
              </div>
              <div className="text-[#3D4A3F] text-[10px] font-medium leading-[15px]">
                145,000 VND
              </div>
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
