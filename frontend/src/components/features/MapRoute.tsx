import React, { useEffect, useState } from 'react';
import { Polyline } from 'react-leaflet';
import { getRouteCoordinates } from '../../hooks/useLocationSuggestions';

interface MapRouteProps {
  start: { lat: number; lng: number } | null;
  end: { lat: number; lng: number } | null;
}

export const MapRoute: React.FC<MapRouteProps> = ({ start, end }) => {
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
      {/* Đường vẽ chính (Cốt lõi) */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#0f4c3a',
          weight: 5,
          opacity: 0.8,
          lineJoin: 'round',
          lineCap: 'round'
        }}
      />
      {/* Hiệu ứng viền ngoài mờ để trông đẹp hơn */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#0f4c3a',
          weight: 10,
          opacity: 0.2,
          lineJoin: 'round',
          lineCap: 'round'
        }}
      />
    </>
  );
};
