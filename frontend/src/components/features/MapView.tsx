import { useEffect } from 'react';
import { MapPinOff } from 'lucide-react';
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

// GPS Permission Popup — hiện khi GPS bị tắt hoặc từ chối
// Tự biến mất khi hook phát hiện quyền được bật (Permissions API)
// ─────────────────────────────────────────────────────────────
function MapErrorOverlay() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 1090,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Card trắng — map vẫn thấy phía sau */}
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '36px 24px 32px',
        width: '100%',
        maxWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 20px 48px rgba(0,0,0,0.14)',
        textAlign: 'center',
      }}>

        {/* Icon GPS tắt trong vòng tròn hồng */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: '#fde8e8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <MapPinOff size={32} color="#e53e3e" strokeWidth={2} />
        </div>

        {/* Tiêu đề */}
        <h2 style={{
          fontSize: '20px',
          fontWeight: 800,
          color: '#171d17',
          lineHeight: 1.45,
          margin: 0,
          letterSpacing: '-0.5px',
        }}>
          位置情報へのアクセスが<br />拒否されました。
        </h2>

        {/* Mô tả */}
        <p style={{
          fontSize: '13px',
          color: '#41493e',
          lineHeight: 1.75,
          margin: 0,
          maxWidth: '300px',
        }}>
          付近の配車を探し、正確な乗車場所を提供するために、位置情報の許可が必要です。端末の設定から許可してください。
        </p>
      </div>
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
      {error && <MapErrorOverlay />}

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
