import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { Header } from '../../components/layout/Header';
import { MapView } from '../../components/features/MapView';
import { FAB } from '../../components/ui/FAB';

// SVG Icons
import IconCall from '../../assets/IconCall.svg';
import IconMess from '../../assets/IconMess.svg';
import IconClock from '../../assets/IconClock.svg';
import IconLocation from '../../assets/IconLocation.svg';

const pickupPosition = { lat: 21.0285, lng: 105.8542 };
const destinationPosition = { lat: 21.0031, lng: 105.8152 }; // Mock destination

const destinationIcon = L.divIcon({
  className: 'custom-dest-marker',
  iconSize: [140, 100],
  iconAnchor: [70, 24],
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

export default function InTrip() {
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
        onBackClick={() => navigate('/passenger')}
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
          routePadding={[[50, 120], [50, 420]]}
          viewPadding={{ top: 100, bottom: 420, left: 50, right: 50 }}
        >
          <Marker position={[destinationPosition.lat, destinationPosition.lng]} icon={destinationIcon} />
        </MapView>
      </div>

      <FAB onClick={handleRecenter} className="fixed top-[96px] right-4" />

      {/* Floating Card UI */}
      <div className="absolute bottom-6 left-4 right-4 z-[1000] flex justify-center pointer-events-none">
        <div className="w-full max-w-[390px] flex flex-col pointer-events-auto" style={{ alignItems: 'center' }}>
          <div style={{alignSelf: 'stretch', background: 'white', boxShadow: '0px -8px 24px rgba(0, 0, 0, 0.08)', overflow: 'hidden', borderTopLeftRadius: 32, borderTopRightRadius: 32, borderBottomRightRadius: 24, borderBottomLeftRadius: 24, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
            <div style={{alignSelf: 'stretch', paddingTop: 24, paddingBottom: 16, paddingLeft: 32, paddingRight: 32, background: '#EFF6EC', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
              <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                  <div style={{width: 165.91, height: 16, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3D4A3F', fontSize: 12, fontWeight: '400', textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 1.20, wordWrap: 'break-word'}}>到着予定</div>
                </div>
                <div style={{alignSelf: 'stretch', height: 40, position: 'relative'}}>
                  <div style={{width: 20.03, height: 40, left: 0, top: 0, position: 'absolute', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#006D37', fontSize: 36, fontWeight: '800', lineHeight: '40px', wordWrap: 'break-word'}}>8</div>
                  <div style={{width: 38, height: 28, left: 27, top: 10, position: 'absolute', justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#006D37', fontSize: 24, fontWeight: '800', lineHeight: '28px', wordWrap: 'break-word'}}>分</div>
                </div>
              </div>
              <div style={{paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, background: 'rgba(0, 109, 55, 0.10)', borderRadius: 9999, justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex'}}>
                <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                  <img src={IconClock} alt="Time" style={{width: 11.67, height: 11.67}} />
                </div>
                <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                  <div style={{width: 52.25, height: 16, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#006D37', fontSize: 12, fontWeight: '700', lineHeight: '16px', whiteSpace: 'nowrap'}}>10:45 AM</div>
                </div>
              </div>
            </div>
            <div style={{alignSelf: 'stretch', height: 231, paddingBottom: 32, paddingLeft: 32, paddingRight: 32, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 20, display: 'flex'}}>
              <div style={{width: 304, justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex'}}>
                <div style={{width: 188, justifyContent: 'flex-start', alignItems: 'center', gap: 10, display: 'flex'}}>
                  <div style={{position: 'relative', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                    <div style={{width: 64, height: 64, background: 'rgba(255, 255, 255, 0)', boxShadow: '0px 2px 4px -2px rgba(0, 0, 0, 0.10), 0px 4px 6px -1px rgba(0, 0, 0, 0.10)', overflow: 'hidden', borderRadius: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex'}}>
                      <img style={{alignSelf: 'stretch', flex: '1 1 0', position: 'relative', objectFit: 'cover'}} src="https://i.pravatar.cc/150?img=11" alt="Driver" />
                    </div>
                    <div style={{paddingLeft: 8, paddingRight: 8, paddingTop: 2, paddingBottom: 2, left: 29.77, top: 53, position: 'absolute', background: '#FEA520', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)', borderRadius: 8, justifyContent: 'flex-start', alignItems: 'center', gap: 3.99, display: 'inline-flex'}}>
                      <div style={{width: 13.91, height: 15, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#694000', fontSize: 8, fontWeight: '900', lineHeight: '15px', wordWrap: 'break-word'}}>4.9</div>
                      <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                        <span style={{fontSize: 8, color: '#694000', lineHeight: '15px'}}>★</span>
                      </div>
                    </div>
                  </div>
                  <div style={{width: 114, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex'}}>
                    <div style={{width: 114, height: 44, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                      <div style={{width: 155, height: 56, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 20, fontWeight: '800', lineHeight: '32px', whiteSpace: 'nowrap'}}>Nguyen Tan</div>
                    </div>
                    <div style={{width: 114, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                      <div style={{width: 114, height: 40, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3D4A3F', fontSize: 14, fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>Toyota Camry •<br/>51H-123.45</div>
                    </div>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                      <div style={{width: 109, height: 23, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: 'rgba(61, 74, 63, 0.70)', fontSize: 10, fontWeight: '400', textTransform: 'uppercase', lineHeight: '15px', wordWrap: 'break-word'}}> 認定ドライバー</div>
                    </div>
                  </div>
                </div>
                <div style={{justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex'}}>
                  <div className="cursor-pointer" onClick={handleCall} style={{width: 48, height: 48, background: '#E9F0E6', borderRadius: 24, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                    <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                      <img src={IconCall} alt="Call" style={{width: 18, height: 18, objectFit: 'contain'}} />
                    </div>
                  </div>
                </div>
                <div className="cursor-pointer" onClick={handleChat} style={{width: 48, height: 48, background: '#E9F0E6', borderRadius: 24, justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
                  <div style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                    <img src={IconMess} alt="Chat" style={{width: 20, height: 20, objectFit: 'contain'}} />
                  </div>
                </div>
              </div>
              <div style={{alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                <div style={{paddingTop: 4, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'inline-flex'}}>
                  <div style={{width: 8, height: 8, background: '#27AE60', borderRadius: 9999}} />
                  <div style={{width: 2, height: 48, paddingTop: 4, paddingBottom: 4, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                    <div style={{width: 2, height: 40, background: 'rgba(188, 202, 188, 0.30)'}} />
                  </div>
                  <div style={{width: 12, height: 12, background: '#865300', boxShadow: '0px 0px 8px rgba(254, 165, 32, 0.40)', borderRadius: 9999}} />
                </div>
                <div style={{flex: '1 1 0', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'inline-flex'}}>
                  <div style={{alignSelf: 'stretch', opacity: 0.40, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                    <div style={{width: 142.20, height: 15, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#3D4A3F', fontSize: 10, fontWeight: '400', textTransform: 'uppercase', lineHeight: '15px', wordWrap: 'break-word'}}>現在地</div>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                      <div style={{width: 93, height: 16, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 12, fontWeight: '500', lineHeight: '16px', wordWrap: 'break-word'}}>ハノイ工科大学</div>
                    </div>
                  </div>
                  <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                    <div style={{width: 106.33, height: 15, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#865300', fontSize: 10, fontWeight: '400', textTransform: 'uppercase', lineHeight: '15px', wordWrap: 'break-word'}}> 行き先</div>
                    <div style={{alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex'}}>
                      <div style={{width: 183, height: 24, justifyContent: 'center', display: 'flex', flexDirection: 'column', color: '#171D17', fontSize: 16, fontWeight: '700', lineHeight: '24px', wordWrap: 'break-word'}}>ロイヤルシティ</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
