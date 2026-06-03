import React, { useEffect, useState } from 'react';
import { Polyline } from 'react-leaflet';
import { getRouteCoordinates } from '../../hooks/useLocationSuggestions';

interface MapRouteProps {
  start: { lat: number; lng: number } | null;
  end: { lat: number; lng: number } | null;
  color?: string;
  outlineColor?: string;
}

export const MapRoute: React.FC<MapRouteProps> = ({ start, end, color = '#0f4c3a', outlineColor }) => {
  const [positions, setPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (start && end) {
        const coords = await getRouteCoordinates(start, end);
        setPositions(coords);
      } else {
        setPositions([]);
      }
    };

    fetchRoute();
  }, [start, end]);

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
          opacity: 0.8,
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
            opacity: 0.2,
            lineJoin: 'round',
            lineCap: 'round'
          }}
        />
      )}
    </>
  );
};
