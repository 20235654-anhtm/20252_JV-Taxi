import { useState, useEffect } from 'react';

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
            name: props.name || props.street || 'Địa điểm không tên',
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
        setError('Không thể tìm kiếm địa điểm');
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

