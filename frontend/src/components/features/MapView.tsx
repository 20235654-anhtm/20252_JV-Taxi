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

interface MapViewProps {
  position: LatLng | null;
  pickupPosition?: LatLng | null;
  destinationPosition?: LatLng | null;
  error?: string | null;
  zoom?: number;
  recenterKey?: number;
  hasBottomNav?: boolean;
  showPickupLabel?: boolean;
  routePadding?: [[number, number], [number, number]];
}

export function MapView({
  position,
  pickupPosition,
  destinationPosition,
  error,
  zoom = 15,
  recenterKey = 0,
  hasBottomNav = false,
  showPickupLabel = false,
  routePadding
}: MapViewProps) {

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 text-slate-400 p-8 text-center">
        {error}
      </div>
    );
  }

  if (!position && !pickupPosition) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006d37]"></div>
      </div>
    );
  }

  const center: [number, number] = pickupPosition
    ? [pickupPosition.lat, pickupPosition.lng]
    : (position ? [position.lat, position.lng] : [21.0285, 105.8542]);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
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
    </div>
  );
}
