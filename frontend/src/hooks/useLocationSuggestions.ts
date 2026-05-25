import { useState, useEffect } from 'react';

interface LatLng {
  lat: number;
  lng: number;
}

export interface Suggestion {
  id: string | number;
  name: string;
  address: string;
  coordinates: [number, number]; // [lng, lat]
}

export const useLocationSuggestions = (query: string) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Searching for:', query); // Log để debug
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=en&bbox=102.14,8.33,109.46,23.39`
        );

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('API Response:', data); // Xem dữ liệu thật trả về là gì

        const formatted = data.features.map((feature: any) => {
          const props = feature.properties;
          return {
            id: props.osm_id + '-' + Math.random().toString(36).substr(2, 9),
            name: props.name || props.street || '名前のない場所',
            address: [
              props.house_number,
              props.street,
              props.district,
              props.city,
              props.country
            ].filter(Boolean).join(', '),
            coordinates: feature.geometry.coordinates,
          };
        });

        setSuggestions(formatted);
      } catch (err) {
        console.error('Search error:', err);
        setError('検索できませんでした');
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);

  return { suggestions, isLoading, error };
};

/**
 * Hàm Reverse Geocoding: Chuyển tọa độ sang địa chỉ văn bản
 */
export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}&lang=en`
    );
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const props = data.features[0].properties;
      return [
        props.name,
        props.street,
        props.district,
        props.city
      ].filter(Boolean).join(', ') || 'Unknown Location';
    }
    return 'Unknown Location';
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return 'Current Location';
  }
};

/**
 * Hàm lấy tọa độ đường đi ngắn nhất (Routing) từ OSRM
 */
export const getRouteCoordinates = async (start: LatLng, end: LatLng): Promise<[number, number][]> => {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
    );
    const data = await response.json();
    
    if (data.code === 'Ok' && data.routes.length > 0) {
      // OSRM trả về [lng, lat], Leaflet cần [lat, lng] nên ta đảo lại
      const routeCoords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
      // Connect exact start and end points to close any snapping gaps
      return [
        [start.lat, start.lng],
        ...routeCoords,
        [end.lat, end.lng]
      ];
    }
    return [];
  } catch (error) {
    console.error('Routing error:', error);
    return [];
  }
};

/**
 * Hàm lấy tọa độ đường đi ngắn nhất (Routing) kèm theo thời gian (duration)
 */
export const getRouteWithDuration = async (start: LatLng, end: LatLng): Promise<{ coords: [number, number][]; duration: number; distance: number }> => {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
    );
    const data = await response.json();
    
    if (data.code === 'Ok' && data.routes.length > 0) {
      const routeCoords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
      const duration = data.routes[0].duration; // Thời gian đi (giây)
      const distance = data.routes[0].distance; // Khoảng cách đi (mét)
      
      const coords: [number, number][] = [
        [start.lat, start.lng],
        ...routeCoords,
        [end.lat, end.lng]
      ];
      
      return { coords, duration, distance };
    }
    return { coords: [], duration: Infinity, distance: Infinity };
  } catch (error) {
    console.error('Routing error:', error);
    return { coords: [], duration: Infinity, distance: Infinity };
  }
};

/**
 * Hàm Geocoding: Chuyển địa chỉ chữ sang tọa độ { lat, lng }
 */
export const geocodeAddress = async (query: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1&lang=en&bbox=102.14,8.33,109.46,23.39`
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const coords = data.features[0].geometry.coordinates; // [lng, lat]
      return { lat: coords[1], lng: coords[0] };
    }
    return null;
  } catch (error) {
    console.error('Geocode error:', error);
    return null;
  }
};



