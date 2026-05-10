import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const svgPaths = {
  p15c94440: "M13.675 9H1.5V7H13.675L8.075 1.4L9.5 0L17.5 8L9.5 16L8.075 14.6L13.675 9V9",
  p300a1100: "M3.825 9L9.425 14.6L8 16L0 8L8 0L9.425 1.4L3.825 7H16V9H3.825V9",
  p1c1b33c0: "M10 0C4.48 0 0 4.48 0 10C0 17.5 10 26.25 10 26.25C10 26.25 20 17.5 20 10C20 4.48 15.52 0 10 0ZM10 13.5C8.07 13.5 6.5 11.93 6.5 10C6.5 8.07 8.07 6.5 10 6.5C11.93 6.5 13.5 8.07 13.5 10C13.5 11.93 11.93 13.5 10 13.5Z",
  p1a406200: "M13.675 9H1.5V7H13.675L8.075 1.4L9.5 0L17.5 8L9.5 16L8.075 14.6L13.675 9V9"
};
const imgMapPlaceholder = "https://placehold.co/400x600?text=Map+Placeholder";

function Container1() {
  return (
    <div className="h-[16px] relative shrink-0 w-[19px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 16">
        <g id="Container">
          <path d={svgPaths.p15c94440} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-center justify-center min-w-px relative" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold','Noto_Sans_JP:Black',sans-serif] font-extrabold h-[28px] justify-center leading-[0] relative shrink-0 text-[18px] text-center text-white w-[111px]">
        <p className="leading-[28px]">次へ進む</p>
      </div>
      <Container1 />
    </div>
  );
}

function Button({ onClick }: { onClick: () => void }) {
  return (
    <div 
      className="bg-gradient-to-r content-stretch drop-shadow-[0px_12px_12px_rgba(0,109,55,0.2)] flex from-[#006d37] items-start justify-center py-[20px] relative rounded-[24px] shrink-0 to-[#27ae60] w-full cursor-pointer hover:opacity-90 transition-opacity" 
      data-name="Button"
      onClick={onClick}
    >
      <Container />
    </div>
  );
}

function PrimaryAction({ onClick }: { onClick: () => void }) {
  return (
    <div className="content-stretch flex flex-col h-[76px] items-start pt-[16px] relative shrink-0 w-full" data-name="Primary Action">
      <Button onClick={onClick} />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0" data-name="Container">
      <div className="relative rounded-[9999px] shrink-0 size-[12px]" data-name="Border">
        <div aria-hidden="true" className="absolute border-2 border-[#006d37] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      </div>
      <div className="bg-[#dde5db] h-[32px] relative shrink-0 w-[2px]" data-name="Vertical Divider" />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#3d4a3f] text-[12px] tracking-[0.6px] uppercase w-full">
        <p className="leading-[16px]">現在地</p>
      </div>
    </div>
  );
}

function Container6({ pickupLocation, setPickupLocation, onSelect }: { pickupLocation: string, setPickupLocation: (v: string) => void, onSelect: (lat: number, lon: number) => void }) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (showDropdown && pickupLocation.length > 2) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickupLocation)}&addressdetails=1&limit=5`);
          const data = await res.json();
          setSuggestions(data);
        } catch (e) { console.error(e); }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [pickupLocation, showDropdown]);

  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#171d17] text-[16px] w-full">
        <input 
          className="leading-[24px] bg-transparent border-none outline-none w-full"
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 300)}
        />
      </div>
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 z-[1100] w-[110%] bg-white shadow-xl rounded-xl mt-1 py-1 max-h-48 overflow-auto border border-gray-100">
          {suggestions.map((item, idx) => (
            <li 
              key={idx} 
              className="px-4 py-2 hover:bg-[#f4fbf1] cursor-pointer text-sm border-b border-gray-50 last:border-0"
              onClick={() => {
                setPickupLocation(item.display_name);
                onSelect(parseFloat(item.lat), parseFloat(item.lon));
                setShowDropdown(false);
              }}
            >
              <div className="font-bold truncate text-[#171d17]">{item.display_name.split(',')[0]}</div>
              <div className="text-xs opacity-60 truncate text-[#3d4a3f]">{item.display_name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Container4({ pickupLocation, setPickupLocation, onSelect }: { pickupLocation: string, setPickupLocation: (v: string) => void, onSelect: (lat: number, lon: number) => void }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Container">
      <Container5 />
      <Container6 pickupLocation={pickupLocation} setPickupLocation={setPickupLocation} onSelect={onSelect} />
    </div>
  );
}

function OriginInputVisualOnly({ pickupLocation, setPickupLocation, onSelect }: { pickupLocation: string, setPickupLocation: (v: string) => void, onSelect: (lat: number, lon: number) => void }) {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Origin Input (Visual Only)">
      <Container3 />
      <Container4 pickupLocation={pickupLocation} setPickupLocation={setPickupLocation} onSelect={onSelect} />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#865300] text-[12px] tracking-[0.6px] uppercase w-full">
        <p className="leading-[16px]">目的地</p>
      </div>
    </div>
  );
}

function Container9({ destination, setDestination, onSelect }: { destination: string, setDestination: (v: string) => void, onSelect: (lat: number, lon: number) => void }) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (showDropdown && destination.length > 2) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&addressdetails=1&limit=5`);
          const data = await res.json();
          setSuggestions(data);
        } catch (e) { console.error(e); }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [destination, showDropdown]);

  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-visible pb-[2px] relative" data-name="Container">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:SemiBold','Noto_Sans_JP:Bold',sans-serif] font-semibold justify-center leading-[0] relative shrink-0 text-[18px] text-[rgba(61,74,63,1)] w-full">
        <input 
          className="leading-[normal] bg-transparent border-none outline-none w-full placeholder:text-[rgba(61,74,63,0.4)]"
          placeholder="どこへ行きますか？"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 300)}
        />
      </div>
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 z-[1100] w-[110%] bg-white shadow-xl rounded-xl mt-1 py-1 max-h-48 overflow-auto border border-gray-100">
          {suggestions.map((item, idx) => (
            <li 
              key={idx} 
              className="px-4 py-2 hover:bg-[#f4fbf1] cursor-pointer text-sm border-b border-gray-50 last:border-0"
              onClick={() => {
                setDestination(item.display_name);
                onSelect(parseFloat(item.lat), parseFloat(item.lon));
                setShowDropdown(false);
              }}
            >
              <div className="font-bold truncate text-[#171d17]">{item.display_name.split(',')[0]}</div>
              <div className="text-xs opacity-60 truncate text-[#3d4a3f]">{item.display_name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Input({ destination, setDestination, onSelect }: { destination: string, setDestination: (v: string) => void, onSelect: (lat: number, lon: number) => void }) {
  return (
    <div className="content-stretch flex items-start justify-center overflow-visible pb-px pt-[2px] relative shrink-0 w-full" data-name="Input">
      <Container9 destination={destination} setDestination={setDestination} onSelect={onSelect} />
    </div>
  );
}

function Container7({ destination, setDestination, onSelect }: { destination: string, setDestination: (v: string) => void, onSelect: (lat: number, lon: number) => void }) {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Container">
      <Container8 />
      <Input destination={destination} setDestination={setDestination} onSelect={onSelect} />
    </div>
  );
}

function DestinationInput({ destination, setDestination, onSelect }: { destination: string, setDestination: (v: string) => void, onSelect: (lat: number, lon: number) => void }) {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Destination Input">
      <div className="bg-[#fea520] relative rounded-[2px] shrink-0 size-[12px]" data-name="Background" />
      <Container7 destination={destination} setDestination={setDestination} onSelect={onSelect} />
    </div>
  );
}

function Container2({ 
  pickupLocation, setPickupLocation, onPickupSelect, 
  destination, setDestination, onDestinationSelect 
}: { 
  pickupLocation: string, setPickupLocation: (v: string) => void, onPickupSelect: (lat: number, lon: number) => void,
  destination: string, setDestination: (v: string) => void, onDestinationSelect: (lat: number, lon: number) => void
}) {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative size-full">
        <OriginInputVisualOnly pickupLocation={pickupLocation} setPickupLocation={setPickupLocation} onSelect={onPickupSelect} />
        <DestinationInput destination={destination} setDestination={setDestination} onSelect={onDestinationSelect} />
      </div>
    </div>
  );
}

function AsymmetricSearchBentoBox({ 
  pickupLocation, setPickupLocation, onPickupSelect, 
  destination, setDestination, onDestinationSelect 
}: { 
  pickupLocation: string, setPickupLocation: (v: string) => void, onPickupSelect: (lat: number, lon: number) => void,
  destination: string, setDestination: (v: string) => void, onDestinationSelect: (lat: number, lon: number) => void
}) {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] relative rounded-[24px] shrink-0 w-full" data-name="Asymmetric Search Bento Box">
      <div aria-hidden="true" className="absolute border border-[rgba(188,202,188,0.15)] border-solid inset-0 pointer-events-none rounded-[24px]" />
      <div className="content-stretch flex flex-col items-start p-[25px] relative size-full">
        <Container2 
          pickupLocation={pickupLocation} setPickupLocation={setPickupLocation} onPickupSelect={onPickupSelect} 
          destination={destination} setDestination={setDestination} onDestinationSelect={onDestinationSelect}
        />
      </div>
    </div>
  );
}

function Overlay() {
  return (
    <div className="absolute bg-[rgba(0,109,55,0.2)] content-stretch flex items-center justify-center left-[147px] rounded-[9999px] size-[48px] top-[61px]" data-name="Overlay">
      <div className="bg-[#006d37] relative rounded-[9999px] shrink-0 size-[16px]" data-name="Background+Border">
        <div aria-hidden="true" className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[9999px]" />
      </div>
    </div>
  );
}

function RecenterAutomatically({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

function MapImage({ initialPosition }: { initialPosition: {lat: number, lng: number} | null }) {
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(initialPosition);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have an initial position from GuestHome, don't force GPS watch immediately
    // or at least start with the initial position.
    if (initialPosition) {
      setPosition(initialPosition);
    }

    let watchId: number;

    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          // If we don't have an initial position, or we want to keep updating,
          // we update the position. 
          // But according to user: "searchlocation sẽ hiển thị ở vị trí đó" (selected address)
          // So if initialPosition exists, we might NOT want to override it with current GPS
          // unless the user clicks a "recenter" button.
          // However, for now, let's say if initialPosition is provided, we stay there.
          if (!initialPosition) {
            setPosition({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          }
          setLocationError(null);
        },
        (err) => {
          console.error("Error getting location:", err);
          if (!initialPosition && (err.code === err.PERMISSION_DENIED || err.code === err.POSITION_UNAVAILABLE)) {
            setLocationError("Vui lòng bật quyền truy cập vị trí (GPS) để sử dụng chức năng này.");
          }
          setPosition((prev) => prev || { lat: 10.7766, lng: 106.7058 });
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
      );
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [initialPosition]);

  return (
    <div className="flex-[1_0_0] min-h-px overflow-clip relative w-full" data-name="MapImage" style={{ zIndex: 0 }}>
      {position ? (
        <MapContainer center={[position.lat, position.lng]} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[position.lat, position.lng]}>
            <Popup>
              Vị trí hiện tại của bạn
            </Popup>
          </Marker>
          <RecenterAutomatically lat={position.lat} lng={position.lng} />
        </MapContainer>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f4fbf1]">
          <span className="text-[#006d37] font-medium">Bản đồ đang tải...</span>
        </div>
      )}

      {/* GPS Error Popup */}
      {locationError && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-6 shadow-xl max-w-sm w-full flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#f4fbf1] text-[#006d37] flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
               </svg>
            </div>
            <h3 className="font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold text-[#171d17] text-lg">Yêu cầu vị trí</h3>
            <p className="text-[#3d4a3f] text-sm leading-relaxed">{locationError}</p>
            <button 
              onClick={() => setLocationError(null)}
              className="mt-2 w-full bg-[#006d37] text-white py-3 rounded-[9999px] font-bold hover:bg-[#005a2d] transition-colors shadow-md"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MapPreviewCardGlassmorphismInspired({ initialPosition }: { initialPosition: {lat: number, lng: number} | null }) {
  return (
    <div className="content-stretch flex flex-col h-[514px] items-start justify-center overflow-clip relative rounded-[24px] shrink-0 w-full" data-name="Map Preview Card (Glassmorphism inspired)">
      <MapImage initialPosition={initialPosition} />
      <div className="absolute bg-gradient-to-t from-[rgba(233,240,230,0.6)] inset-0 to-[rgba(233,240,230,0)]" data-name="Gradient" />
    </div>
  );
}

function MainSearchInterfaceSection({ 
  pickupLocation, setPickupLocation, onPickupSelect, 
  destination, setDestination, onDestinationSelect,
  mapPosition
}: { 
  pickupLocation: string, setPickupLocation: (v: string) => void, onPickupSelect: (lat: number, lon: number) => void,
  destination: string, setDestination: (v: string) => void, onDestinationSelect: (lat: number, lon: number) => void,
  mapPosition: {lat: number, lng: number} | null
}) {
  return (
    <div className="content-stretch flex flex-col gap-[24px] h-[696px] items-start overflow-clip relative shrink-0 w-full" data-name="Main → Search Interface Section">
      <AsymmetricSearchBentoBox 
        pickupLocation={pickupLocation} setPickupLocation={setPickupLocation} onPickupSelect={onPickupSelect} 
        destination={destination} setDestination={setDestination} onDestinationSelect={onDestinationSelect}
      />
      <MapPreviewCardGlassmorphismInspired initialPosition={mapPosition} />
    </div>
  );
}

function Container12() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Container">
          <path d={svgPaths.p300a1100} fill="var(--fill-0, #064E3B)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1({ onBack }: { onBack: () => void }) {
  return (
    <div 
      className="content-stretch flex flex-col items-center justify-center p-[8px] relative rounded-[9999px] shrink-0 cursor-pointer hover:bg-black/5 transition-colors" 
      data-name="Button"
      onClick={onBack}
    >
      <Container12 />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[118px]" data-name="Heading 1">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#064e3b] text-[18px] tracking-[-0.45px] w-[141.69px]">
        <p className="leading-[28px]">目的地を入力</p>
      </div>
    </div>
  );
}

function Container11({ onBack }: { onBack: () => void }) {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Button1 onBack={onBack} />
      <Heading />
    </div>
  );
}

function Button2({ onLogin }: { onLogin: () => void }) {
  return (
    <div 
      className="bg-[#006d37] content-stretch flex flex-col h-[28.421px] items-center justify-center px-[24px] py-[8px] relative rounded-[9999px] w-[98.947px] cursor-pointer hover:bg-[#005a2d] transition-colors" 
      data-name="Button"
      onClick={onLogin}
    >
      <div className="absolute bg-[rgba(255,255,255,0)] inset-[0_4.87px_2.22px_0] rounded-[9999px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" data-name="Button:shadow" />
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white w-[91.579px]">
        <p className="leading-[20px]">ログイン</p>
      </div>
    </div>
  );
}

function ButtonCssTransform({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="content-stretch flex flex-col items-start justify-center py-[14.9px] relative shrink-0 w-[102px]" data-name="Button:css-transform">
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[94px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "23" } as React.CSSProperties}>
        <div className="flex-none scale-x-95 scale-y-95">
          <Button2 onLogin={onLogin} />
        </div>
      </div>
    </div>
  );
}

function Button3({ onSignUp }: { onSignUp: () => void }) {
  return (
    <div 
      className="bg-[#006d37] content-stretch flex flex-col h-[28.421px] items-center justify-center px-[24px] py-[8px] relative rounded-[9999px] w-[101.053px] cursor-pointer hover:bg-[#005a2d] transition-colors" 
      data-name="Button"
      onClick={onSignUp}
    >
      <div className="absolute bg-[rgba(255,255,255,0)] inset-[0_4.97px_2.22px_0] rounded-[9999px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" data-name="Button:shadow" />
      <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[20px] justify-center leading-[0] relative shrink-0 text-[14px] text-center text-white w-[93.684px]">
        <p className="leading-[20px]">サインアップ</p>
      </div>
    </div>
  );
}

function ButtonCssTransform1({ onSignUp }: { onSignUp: () => void }) {
  return (
    <div className="content-stretch flex flex-col h-[64px] items-start justify-center py-[14.9px] relative shrink-0 w-[101px]" data-name="Button:css-transform">
      <div className="flex h-[27px] items-center justify-center relative shrink-0 w-[96px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "23" } as React.CSSProperties}>
        <div className="flex-none scale-x-95 scale-y-95">
          <Button3 onSignUp={onSignUp} />
        </div>
      </div>
    </div>
  );
}

function Container10({ onBack, onLogin, onSignUp }: { onBack: () => void, onLogin: () => void, onSignUp: () => void }) {
  return (
    <div className="h-[64px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[24px] relative size-full">
          <Container11 onBack={onBack} />
          <div className="flex items-center gap-2">
            <ButtonCssTransform onLogin={onLogin} />
            <ButtonCssTransform1 onSignUp={onSignUp} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   LOGIN REQUIRED OVERLAY COMPONENTS
─────────────────────────────────────────── */

function LoginOverlayIcon() {
  return (
    <div className="h-[26.25px] relative shrink-0 w-[20px]" data-name="Container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 26.25">
        <g id="Container">
          <path d={svgPaths.p1c1b33c0} fill="var(--fill-0, #006D37)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function LoginOverlayHeader() {
  return (
    <div className="bg-[rgba(0,109,55,0.1)] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[64px]" data-name="Overlay">
      <LoginOverlayIcon />
    </div>
  );
}

function LoginOverlayHeading() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold','Noto_Sans_JP:Black',sans-serif] font-extrabold h-[64px] justify-center leading-[0] relative shrink-0 text-[#171d17] text-[24px] text-center tracking-[-0.6px] w-full">
        <p className="leading-[32px]">ログインが必要です</p>
      </div>
    </div>
  );
}

function LoginOverlayDescription() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center px-[16px] relative size-full">
          <div className="flex flex-col font-['Plus_Jakarta_Sans:Regular','Noto_Sans_JP:Regular',sans-serif] font-normal h-[104px] justify-center leading-[0] relative shrink-0 text-[#3d4a3f] text-[16px] text-center w-[294px]">
            <p className="leading-[26px]">予約を続けるにはログインまたはアカウント作成をしてください。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginOverlayCtaButton({ onLogin }: { onLogin: () => void }) {
  return (
    <div 
      className="bg-[#fea520] content-stretch flex items-center justify-center py-[16px] relative rounded-[9999px] shrink-0 w-full cursor-pointer hover:bg-[#e6951d] transition-colors" 
      data-name="Button - Primary CTA (Sunrise Orange)"
      onClick={onLogin}
    >
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[9999px] shadow-[0px_10px_15px_-3px_rgba(254,165,32,0.2),0px_4px_6px_-4px_rgba(254,165,32,0.2)]" data-name="Button - Primary CTA (Sunrise Orange):shadow" />
      <div className="content-stretch flex flex-col items-center relative shrink-0 w-[200px]" data-name="Container">
        <div className="flex flex-col font-['Plus_Jakarta_Sans:ExtraBold','Noto_Sans_JP:Black',sans-serif] font-extrabold h-[28px] justify-center leading-[0] relative shrink-0 text-[#694000] text-[18px] text-center w-full">
          <p className="leading-[28px]">ログイン</p>
        </div>
      </div>
      <div className="relative shrink-0 size-[16px]" data-name="Container">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <g id="Container">
            <path d={svgPaths.p1a406200} fill="var(--fill-0, #694000)" id="Icon" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function LoginOverlaySignUpButton({ onSignUp }: { onSignUp: () => void }) {
  return (
    <div 
      className="bg-[#eff6ec] content-stretch flex items-center justify-center py-[16px] relative rounded-[9999px] shrink-0 w-full cursor-pointer hover:bg-[#e4eedf] transition-colors" 
      data-name="Button - Secondary CTA"
      onClick={onSignUp}
    >
      <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
        <div className="flex flex-col font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#171d17] text-[18px] text-center w-[163.25px]">
          <p className="leading-[28px]">新規登録</p>
        </div>
      </div>
    </div>
  );
}

function LoginRequiredBottomSheetOverlay({ onClose, onLogin, onSignUp }: { onClose: () => void, onLogin: () => void, onSignUp: () => void }) {
  return (
    <div 
      className="fixed inset-0 z-[5000] backdrop-blur-[4px] bg-black/40 flex items-end justify-center" 
      data-name="Login Required Bottom Sheet Overlay" 
      onClick={onClose}
    >
      <div 
        className="bg-white flex flex-col gap-[24px] items-center max-w-[512px] w-full overflow-clip pt-[16px] relative rounded-tl-[32px] rounded-tr-[32px] shadow-[0px_-20px_50px_0px_rgba(0,0,0,0.15)]" 
        style={{ animation: 'slide-up 0.4s ease-out' }}
        data-name="Bottom Sheet Container"
        onClick={(e) => e.stopPropagation()}
      >
        <style>
          {`
            @keyframes slide-up {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}
        </style>
        <div className="bg-[#dde5db] h-[6px] relative rounded-[9999px] shrink-0 w-[48px]" data-name="Decorative Handle" />
        
        <div className="relative shrink-0 w-full" data-name="Container">
          <div className="content-stretch flex flex-col gap-[24px] items-center pb-[48px] pt-[8px] px-[32px] relative size-full text-center">
            <LoginOverlayHeader />
            <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
               <LoginOverlayHeading />
               <LoginOverlayDescription />
            </div>
            <div className="content-stretch flex flex-col gap-[16px] items-start pt-[16px] relative shrink-0 w-full" data-name="Action Buttons">
              <LoginOverlayCtaButton onLogin={onLogin} />
              <LoginOverlaySignUpButton onSignUp={onSignUp} />
              <div className="h-[36px] relative shrink-0 w-full cursor-pointer flex items-center justify-center text-[#3d4a3f] font-medium hover:opacity-70 transition-opacity" onClick={onClose}>
                キャンセル
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bg-gradient-to-r from-[#006d37] h-[4px] left-0 right-0 to-[#27ae60] top-0 via-1/2 via-[#fea520]" data-name="Subtle Decorative Gradient" />
      </div>
    </div>
  );
}

function HeaderTopAppBar({ onBack, onLogin, onSignUp }: { onBack: () => void, onLogin: () => void, onSignUp: () => void }) {
  return (
    <div className="absolute backdrop-blur-[6px] bg-[rgba(255,255,255,0.8)] content-stretch flex flex-col items-start left-0 overflow-clip shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] top-0 w-full" data-name="Header - TopAppBar" style={{ zIndex: 1000 }}>
      <Container10 onBack={onBack} onLogin={onLogin} onSignUp={onSignUp} />
    </div>
  );
}

export default function GuestSearchLocation() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const [pickup, setPickup] = useState(state.pickupLocation || "");
  const [dest, setDest] = useState(state.destination || "");
  const [mapPos, setMapPos] = useState<{lat: number, lng: number} | null>(state.pickupCoords || null);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);

  return (
    <div className="bg-[#f4fbf1] content-stretch flex flex-col items-start pt-[80px] px-[24px] relative size-full min-h-screen" data-name="Search Location">
      <PrimaryAction onClick={() => setShowLoginOverlay(true)} />
      <MainSearchInterfaceSection 
        pickupLocation={pickup} setPickupLocation={setPickup} onPickupSelect={(lat, lon) => setMapPos({ lat, lng: lon })}
        destination={dest} setDestination={setDest} onDestinationSelect={(lat, lon) => setMapPos({ lat, lng: lon })}
        mapPosition={mapPos}
      />
      <HeaderTopAppBar 
        onBack={() => navigate('/')} 
        onLogin={() => navigate('/login')} 
        onSignUp={() => navigate('/signup')} 
      />

      {showLoginOverlay && (
        <LoginRequiredBottomSheetOverlay 
          onClose={() => setShowLoginOverlay(false)}
          onLogin={() => navigate('/login')}
          onSignUp={() => navigate('/signup')}
        />
      )}
    </div>
  );
}

