import React, { useEffect, useState } from 'react';
import { Polyline, CircleMarker } from 'react-leaflet';
import { getRouteCoordinates } from '../../hooks/useLocationSuggestions';

interface MapRouteProps {
  start: { lat: number; lng: number } | null;
  end: { lat: number; lng: number } | null;
  color?: string;
  outlineColor?: string;
  showDots?: boolean;
  actualPath?: [number, number][];
}

export const MapRoute: React.FC<MapRouteProps> = ({ 
  start, 
  end, 
  color = '#0f4c3a', 
  outlineColor,
  showDots = false,
  actualPath
}) => {
  const [positions, setPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (actualPath && actualPath.length > 0) {
        setPositions(actualPath);
        return;
      }
      if (start && end) {
        const coords = await getRouteCoordinates(start, end);
        setPositions(coords);
      } else {
        setPositions([]);
      }
    };

    fetchRoute();
  }, [start, end, actualPath]);

  if (positions.length === 0) return null;

  return (
    <>
      <svg style={{ width: 0, height: 0, position: 'absolute' }}>
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#064e3b" />
            <stop offset="100%" stopColor="#006d37" />
          </linearGradient>
        </defs>
      </svg>
      {/* Viền outline nét cứng (nếu có) */}
      {outlineColor && (
        <Polyline
          positions={positions}
          pathOptions={{
            color: outlineColor,
            weight: 8,
            opacity: 1,
            lineJoin: 'round',
            lineCap: 'round'
          }}
        />
      )}

      {/* Đường vẽ chính (Cốt lõi) */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: color,
          weight: 5,
          opacity: 0.9,
          lineJoin: 'round',
          lineCap: 'round'
        }}
      />
      {/* Hiệu ứng viền ngoài mờ để trông đẹp hơn */}
      {!outlineColor && (
        <Polyline
          positions={positions}
          pathOptions={{
            color: color,
            weight: 10,
            opacity: 0.15,
            lineJoin: 'round',
            lineCap: 'round'
          }}
        />
      )}

      {/* Hiển thị các chấm tròn dọc đường đi giống như mockup */}
      {showDots && positions.map((pos, idx) => {
        // Chỉ vẽ chấm ở mỗi điểm thứ 4 để tránh quá dày đặc, và vẽ ở điểm cuối cùng
        if (idx % 4 === 0 || idx === positions.length - 1) {
          return (
            <CircleMarker
              key={`route-dot-${idx}`}
              center={pos}
              radius={3}
              pathOptions={{
                color: '#171D17', // Viền màu đen sẫm
                fillColor: '#93C5FD', // Ruột màu xanh dương nhạt cực kỳ cao cấp
                fillOpacity: 1,
                weight: 1.5,
              }}
            />
          );
        }
        return null;
      })}
    </>
  );
};
