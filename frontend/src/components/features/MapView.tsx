import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLng } from '../../hooks/useGeolocation';
import { LocationMarker } from './LocationMarker';

// Fix icon mặc định Leaflet bị mất khi dùng Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Vị trí mặc định khi chưa lấy được GPS (trung tâm TP.HCM)
const DEFAULT_CENTER: [number, number] = [10.7769, 106.7009];

// ─────────────────────────────────────────────────────────────
// Sub-component: pan bản đồ mượt mà khi vị trí thay đổi
// ─────────────────────────────────────────────────────────────
// Pan theo GPS + flyTo khi FAB bấm
function MapPanner({ position, recenterKey = 0 }: { position: LatLng; recenterKey?: number }) {
  const map = useMap();

  // Theo dõi GPS: pan mượt khi vị trí thay đổi
  useEffect(() => {
    map.panTo([position.lat, position.lng]);
  }, [map, position]);

  // Recenter có animation khi người dùng bấm FAB
  useEffect(() => {
    if (recenterKey > 0) {
      map.flyTo([position.lat, position.lng], map.getZoom(), {
        animate: true,
        duration: 0.6,
      });
    }
    // chỉ trigger theo recenterKey, không theo position
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterKey]);

  return null;
}

// ─────────────────────────────────────────────────────────────
// Error overlay — hiển thị khi GPS bị từ chối hoặc lỗi
// ─────────────────────────────────────────────────────────────
function MapErrorOverlay({ message }: { message: string }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 800,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      background: 'rgba(244, 251, 241, 0.85)',
      backdropFilter: 'blur(2px)',
    }}>
      <span style={{ fontSize: '40px' }}>⚠️</span>
      <p style={{
        fontSize: '13px',
        fontWeight: 600,
        color: '#064e3b',
        textAlign: 'center',
        maxWidth: '260px',
        letterSpacing: '-0.3px',
      }}>
        {message}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Loading overlay — hiển thị bên TRONG bản đồ khi chưa có GPS
// ─────────────────────────────────────────────────────────────
function MapLoadingOverlay() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 800,                       // Nằm trên tile bản đồ nhưng dưới header (z-1000)
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '14px',
      // Nền mờ nhẹ để vẫn thấy bản đồ phía sau
      background: 'rgba(244, 251, 241, 0.75)',
      backdropFilter: 'blur(2px)',
    }}>
      {/* Spinner: vòng ring nhạt + arc xanh đậm xoay */}
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        border: '4px solid #d1fae5',       // ring nền màu xanh nhạt
        borderTopColor: '#006d37',          // arc xanh đậm chạy trên cùng
        animation: 'spin 0.9s linear infinite',
      }} />
      <p style={{
        fontSize: '13px',
        fontWeight: 600,
        color: '#064e3b',
        letterSpacing: '-0.3px',
      }}>
        Đang xác định vị trí...
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
interface MapViewProps {
  position: LatLng | null;
  error?: string | null;
  zoom?: number;
  recenterKey?: number;
  hasBottomNav?: boolean;
  showPickupLabel?: boolean; // hiện badge "ここから乗る" trên marker (chỉ PassengerHome)
}

// ─────────────────────────────────────────────────────────────
// Component chính
// ─────────────────────────────────────────────────────────────
export function MapView({ position, error, zoom = 15, recenterKey = 0, hasBottomNav = false, showPickupLabel = false }: MapViewProps) {
  // Dùng vị trí thực nếu có, ngược lại dùng trung tâm TPHCM để bản đồ không trắng
  const center = position
    ? [position.lat, position.lng] as [number, number]
    : DEFAULT_CENTER;

  return (
    // Wrapper relative để overlay định vị đúng bên trong
    <div
      className={hasBottomNav ? 'map-with-bottom-nav' : ''}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {/* Loading overlay — hiện khi chưa có GPS */}
      {!position && !error && <MapLoadingOverlay />}

      {/* Error overlay — hiện khi GPS bị lỗi/từ chối */}
      {error && <MapErrorOverlay message={error} />}

      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marker + pan — chỉ khi đã có vị trí thực */}
        {position && (
          <>
            <LocationMarker position={position} showPickupLabel={showPickupLabel} />
            <MapPanner position={position} recenterKey={recenterKey} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
