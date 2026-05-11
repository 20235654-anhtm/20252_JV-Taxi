import React, { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

// ─────────────────────────────────────────────────────────────
// Cấu hình kích thước (Pixel)
// ─────────────────────────────────────────────────────────────
const PULSE_SIZE = 34;   // Vòng tròn tỏa ra
const DOT_SIZE   = 22;   // Chấm màu chính giữa
const BADGE_H    = 26;   // Chiều cao nhãn
const TRIANGLE_H = 6;    // Mũi tên tam giác
const GAP        = 4;    // Khoảng cách nhãn -> Chấm
const ICON_W     = 140;  // Chiều rộng vùng chứa icon (đủ rộng cho nhãn dài)

interface LatLng {
  lat: number;
  lng: number;
}

// ─────────────────────────────────────────────────────────────
// Logic tạo Icon
// ─────────────────────────────────────────────────────────────
function createLocationIcon(showLabel: boolean, labelText?: string, type: 'pickup' | 'destination' = 'pickup'): L.DivIcon {
  const displayLabel = labelText || (type === 'pickup' ? "ここから乗る" : "目的地");
  
  // Màu sắc chuẩn (Tất cả chuyển sang Xanh chủ đạo)
  const greenColor = '#0f4c3a';
  const mainColor = greenColor; 
  const pulseColor = 'rgba(15, 76, 58, 0.45)'; // Tăng độ đậm từ 0.2 lên 0.45

  // Kiểm tra xem có phải là label "Hiện tại" đặc biệt không
  const isCurrentLoc = labelText === '現在地';

  // Logic màu sắc cho Badge
  const badgeBg = isCurrentLoc ? 'white' : mainColor;
  const badgeText = isCurrentLoc ? greenColor : 'white';
  const badgeBorder = isCurrentLoc ? `1px solid ${greenColor}` : 'none';

  // Logic màu sắc cho Dot (Đảo ngược nếu là Hiện tại)
  const ringColor = isCurrentLoc ? greenColor : 'white';
  const innerDotColor = isCurrentLoc ? 'white' : mainColor;

  const anchorX = ICON_W / 2;
  const anchorY = showLabel 
    ? BADGE_H + TRIANGLE_H + GAP + (PULSE_SIZE / 2)
    : PULSE_SIZE / 2;

  const totalH = showLabel 
    ? BADGE_H + TRIANGLE_H + GAP + PULSE_SIZE
    : PULSE_SIZE;

  const badgeHTML = showLabel ? `
    <!-- Badge -->
    <div style="
      background: ${badgeBg};
      color: ${badgeText};
      border: ${badgeBorder};
      font-size: 11px;
      font-weight: 800;
      padding: 4px 12px;
      border-radius: 20px;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 2;
    ">${displayLabel}</div>

    <!-- Mũi tên -->
    <div style="
      width: 0;
      height: 0;
      border-left: ${TRIANGLE_H}px solid transparent;
      border-right: ${TRIANGLE_H}px solid transparent;
      border-top: ${TRIANGLE_H}px solid ${badgeBg === 'white' ? greenColor : badgeBg};
      margin-top: -1px;
      z-index: 2;
    "></div>
  ` : '';

  return L.divIcon({
    className: 'custom-location-marker',
    iconSize: [ICON_W, totalH],
    iconAnchor: [anchorX, anchorY],
    html: `
      <div style="position: relative; width: ${ICON_W}px; height: ${totalH}px; display: flex; flex-direction: column; align-items: center;">
        
        ${badgeHTML}

        <!-- Vùng trung tâm (Dot & Pulse) -->
        <div style="
          position: relative;
          width: ${PULSE_SIZE}px;
          height: ${PULSE_SIZE}px;
          margin-top: ${showLabel ? `${GAP}px` : '0'};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <!-- Pulse -->
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: ${pulseColor};
            border: 1.5px solid rgba(15, 76, 58, 0.5);
            animation: location-pulse 2s ease-out infinite;
          "></div>

          <!-- Nhẫn ngoài (Ring) -->
          <div style="
            position: relative;
            width: ${DOT_SIZE}px;
            height: ${DOT_SIZE}px;
            background: ${ringColor};
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1;
          ">
            <!-- Chấm trong (Inner Dot) -->
            <div style="
              width: ${DOT_SIZE - 8}px;
              height: ${DOT_SIZE - 8}px;
              background: ${innerDotColor};
              border-radius: 50%;
            "></div>
          </div>
        </div>
      </div>
    `
  });
}


// ─────────────────────────────────────────────────────────────
// Component Chính
// ─────────────────────────────────────────────────────────────
interface LocationMarkerProps {
  position: LatLng;
  showPickupLabel?: boolean;
  label?: string;
  type?: 'pickup' | 'destination';
}

export function LocationMarker({ 
  position, 
  showPickupLabel = false, 
  label, 
  type = 'pickup' 
}: LocationMarkerProps) {
  
  const icon = useMemo(() => 
    createLocationIcon(showPickupLabel || !!label, label, type), 
    [showPickupLabel, label, type]
  );

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={icon}
      zIndexOffset={type === 'destination' ? 1000 : 500}
    />
  );
}
