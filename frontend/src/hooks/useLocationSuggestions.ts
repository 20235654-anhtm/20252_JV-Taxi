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
        console.log('Searching for:', query);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&accept-language=ja&countrycodes=vn&limit=5&addressdetails=1`
        );

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('API Response:', data);

        const formatted = data.map((item: any) => {
          const addr = item.address || {};
          const name = addr.building || addr.amenity || addr.tourism || addr.shop || addr.road || item.display_name.split(',')[0] || '名前のない場所';
          return {
            id: item.place_id + '-' + Math.random().toString(36).substr(2, 9),
            name: name,
            address: item.display_name,
            coordinates: [parseFloat(item.lon), parseFloat(item.lat)] as [number, number],
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
 * @param lang - Ngôn ngữ trả về: 'ja' (mặc định, cho passenger), 'vi' (cho driver)
 */
export const reverseGeocode = async (lat: number, lon: number, lang: string = 'ja'): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${lang}`
    );
    const data = await response.json();
    if (data && data.display_name) {
      return data.display_name;
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
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&accept-language=ja&countrycodes=vn&limit=1`
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch (error) {
    console.error('Geocode error:', error);
    return null;
  }
};



