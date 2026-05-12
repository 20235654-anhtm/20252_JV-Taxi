import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationMarker } from '../features/LocationMarker';
import { MapRoute } from './MapRoute';

// Fix lỗi icon mặc định của Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LatLng {
  lat: number;
  lng: number;
}

// Sub-component để điều khiển bản đồ (Pan & Zoom & Padding)
function MapController({
  position,
  pickupPosition,
  destinationPosition,
  recenterKey,
  routePadding = [[20, 80], [20, 80]]
}: {
  position: LatLng | null;
  pickupPosition?: LatLng | null;
  destinationPosition?: LatLng | null;
  recenterKey: number;
  routePadding?: [[number, number], [number, number]];
}) {
  const map = useMap();

  useEffect(() => {
    // Ưu tiên FitBounds nếu có lộ trình 2 điểm
    if (pickupPosition && destinationPosition) {
      const bounds = L.latLngBounds([
        [pickupPosition.lat, pickupPosition.lng],
        [destinationPosition.lat, destinationPosition.lng]
      ]);

      map.fitBounds(bounds, {
        paddingTopLeft: routePadding[0],
        paddingBottomRight: routePadding[1],
        animate: true
      });
    }
    // Nếu chỉ có 1 điểm hoặc user muốn recenter về vị trí GPS
    else if (position && !pickupPosition) {
      map.setView([position.lat, position.lng], map.getZoom(), { animate: true });
    }
  }, [position, pickupPosition, destinationPosition, recenterKey, map, routePadding]);

  return null;
}

/* ── Popup yêu cầu quyền GPS (hiển thị phủ lên bản đồ) ── */
function LocationPermissionOverlay() {
  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center px-8">
      <div className="bg-[#f5f5f5] rounded-[24px] shadow-lg max-w-[340px] w-full px-8 py-10 flex flex-col items-center gap-5">
        {/* Icon */}
        <div className="size-14 bg-[#fce4ec] rounded-full flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 9.74 14.16 10.39 13.64 10.83L12 9.19V9C12 8.45 11.55 8 11 8H10.81L9.17 6.36C9.72 5.84 10.5 5.5 11.38 5.5M12 2C8.69 2 6 4.69 6 8C6 12.5 12 19 12 19S13.23 17.6 14.45 15.84L3.27 4.66L4.68 3.25L20.75 19.32L19.34 20.73L15.66 17.05C13.83 19.43 12 22 12 22C12 22 4 13.36 4 8C4 3.58 7.58 0 12 0C14 0 15.82 0.74 17.21 1.97L15.78 3.4C14.74 2.53 13.43 2 12 2M20 8C20 9.88 19.21 12.15 18.13 14.26L16.66 12.79C17.47 11.12 18 9.38 18 8C18 5.69 16.55 3.72 14.48 2.92L16.06 1.34C18.42 2.56 20 5.08 20 8Z" fill="#c62828"/>
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-[#1a1a1a] text-[20px] font-bold text-center leading-[30px] font-['Plus_Jakarta_Sans:Bold','Noto_Sans_JP:Bold',sans-serif]">
          位置情報の利用を許可<br/>してください。
        </h3>

        {/* Description */}
        <p className="text-[#666] text-[14px] leading-[22px] text-center font-['Plus_Jakarta_Sans:Regular','Noto_Sans_JP:Regular',sans-serif]">
          配車をスムーズに行うために、ブラウザの設定から位置情報のアクセスを「許可」にしてください。
        </p>
      </div>
    </div>
  );
}

interface MapViewProps {
  position: LatLng | null;
  pickupPosition?: LatLng | null;
  destinationPosition?: LatLng | null;
  error?: string | null;
  permissionDenied?: boolean;
  zoom?: number;
  recenterKey?: number;
  hasBottomNav?: boolean;
  showPickupLabel?: boolean;
  showZoomControl?: boolean;
  routePadding?: [[number, number], [number, number]];
}

export function MapView({
  position,
  pickupPosition,
  destinationPosition,
  error,
  permissionDenied = false,
  zoom = 15,
  recenterKey = 0,
  hasBottomNav = false,
  showPickupLabel = false,
  showZoomControl = false,
  routePadding
}: MapViewProps) {

  // Loading spinner (chỉ khi CHƯA bị denied và chưa có vị trí)
  if (!permissionDenied && !position && !pickupPosition) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006d37]"></div>
      </div>
    );
  }

  // Tính toán center: ưu tiên pickup > position > fallback Hà Nội
  const center: [number, number] = pickupPosition
    ? [pickupPosition.lat, pickupPosition.lng]
    : (position ? [position.lat, position.lng] : [21.0285, 105.8542]);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={showZoomControl}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <MapController
          position={position}
          pickupPosition={pickupPosition}
          destinationPosition={destinationPosition}
          recenterKey={recenterKey}
          routePadding={routePadding}
        />

        {/* Vẽ đường đi giữa 2 điểm */}
        <MapRoute start={pickupPosition || null} end={destinationPosition || null} />

        {/* Marker vị trí GPS thực tế */}
        {position && !pickupPosition && (
          <LocationMarker position={position} showPickupLabel={showPickupLabel} />
        )}

        {/* Hiển thị lộ trình với nhãn chuẩn */}
        {pickupPosition && (
          <LocationMarker
            position={pickupPosition}
            label="現在地"
            type="pickup"
          />
        )}
        {destinationPosition && (
          <LocationMarker
            position={destinationPosition}
            label="目的地"
            type="destination"
          />
        )}
      </MapContainer>

      {/* Popup phủ lên bản đồ khi quyền GPS bị từ chối */}
      {permissionDenied && <LocationPermissionOverlay />}
    </div>
  );
}
