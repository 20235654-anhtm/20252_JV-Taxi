import { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import type { LatLng } from '../../hooks/useGeolocation';

// ─────────────────────────────────────────────────────────────
// Kích thước
// ─────────────────────────────────────────────────────────────
const DOT_SIZE   = 22;   // đường kính vòng trắng
const PULSE_SIZE = DOT_SIZE + 14; // đường kính vòng sóng = 36px

// Badge "ここから乗る" — kích thước ước tính
const BADGE_H    = 26;   // chiều cao badge (text + padding)
const TRIANGLE_H = 6;    // chiều cao mũi tên tam giác
const GAP        = 4;    // khoảng cách badge → top của pulse
const ICON_W     = 120;  // đủ rộng để chứa badge

// ─────────────────────────────────────────────────────────────
// Tạo icon
// ─────────────────────────────────────────────────────────────
function createLocationIcon(showPickupLabel: boolean): L.DivIcon {
  // Tổng chiều cao icon:
  //   với label:    badge + triangle + gap + pulse
  //   không label:  pulse
  const totalH = showPickupLabel
    ? BADGE_H + TRIANGLE_H + GAP + PULSE_SIZE
    : PULSE_SIZE;

  // Anchor X = giữa icon width, Anchor Y = tâm của vòng PULSE
  const anchorX = ICON_W / 2;
  const anchorY = showPickupLabel
    ? BADGE_H + TRIANGLE_H + GAP + PULSE_SIZE / 2  // tâm pulse tính từ top
    : PULSE_SIZE / 2;

  const badgeHTML = showPickupLabel ? `
    <!-- Badge ここから乗る -->
    <div style="
      background: #006d37;
      color: white;
      font-size: 11px;
      font-weight: 700;
      font-family: 'Noto Sans JP', sans-serif;
      padding: 4px 10px;
      border-radius: 20px;
      white-space: nowrap;
      box-shadow: 0 3px 10px rgba(0,109,55,0.35);
      position: relative;
      z-index: 2;
      letter-spacing: -0.3px;
    ">ここから乗る</div>

    <!-- Tam giác mũi tên trỏ xuống -->
    <div style="
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: ${TRIANGLE_H}px solid #006d37;
      margin-bottom: ${GAP}px;
    "></div>
  ` : '';

  return L.divIcon({
    html: `
      <div style="
        width: ${ICON_W}px;
        display: flex;
        flex-direction: column;
        align-items: center;
      ">
        ${badgeHTML}

        <!-- Vùng chứa dot + pulse -->
        <div style="
          position: relative;
          width: ${PULSE_SIZE}px;
          height: ${PULSE_SIZE}px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <!-- Vòng sóng pulse -->
          <div style="
            position: absolute;
            width: ${PULSE_SIZE}px;
            height: ${PULSE_SIZE}px;
            border-radius: 50%;
            background: rgba(0, 109, 55, 0.18);
            animation: location-pulse 2s ease-out infinite;
          "></div>

          <!-- Vòng trắng ngoài -->
          <div style="
            width: ${DOT_SIZE}px;
            height: ${DOT_SIZE}px;
            border-radius: 50%;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 1;
          ">
            <!-- Chấm xanh -->
            <div style="
              width: ${DOT_SIZE - 8}px;
              height: ${DOT_SIZE - 8}px;
              border-radius: 50%;
              background: #006d37;
            "></div>
          </div>
        </div>
      </div>
    `,
    iconSize:   [ICON_W, totalH],
    iconAnchor: [anchorX, anchorY],
    className: '',
  });
}

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
interface LocationMarkerProps {
  position: LatLng;
  showPickupLabel?: boolean; // hiện badge "ここから乗る" phía trên (mặc định: false)
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export function LocationMarker({ position, showPickupLabel = false }: LocationMarkerProps) {
  // Tạo lại icon khi showPickupLabel thay đổi
  const icon = useMemo(() => createLocationIcon(showPickupLabel), [showPickupLabel]);

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={icon}
      draggable={false}
    />
  );
}
