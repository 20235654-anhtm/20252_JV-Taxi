import { useState, useEffect } from 'react';
import type { HistoryItem } from '../components/SearchLocation/RecentHistory';
import { formatAddressToJapanese } from '../utils/stringUtils';

import { API_BASE_URL as API_HOST } from '../config/api';

const API_BASE_URL = `${API_HOST}/api`;

export const useRecentDestinations = (userId: string | undefined) => {
  const [recentDestinations, setRecentDestinations] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecent = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/destinations/recent?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recent destinations');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          // Chuyển đổi dữ liệu từ API sang định dạng HistoryItem của Frontend
          const formattedData: HistoryItem[] = result.data.map((item: any, index: number) => ({
            id: `recent-${index}`,
            name: formatAddressToJapanese(item.endAddress), // Vì đây là lịch sử địa chỉ, ta dùng địa chỉ làm tên luôn
            address: formatAddressToJapanese(item.endAddress),
            coords: item.latitude && item.longitude ? { lat: Number(item.latitude), lng: Number(item.longitude) } : null
          }));
          
          setRecentDestinations(formattedData);
        }
      } catch (err: any) {
        console.error('Fetch history error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecent();
  }, [userId]);

  return { recentDestinations, isLoading, error };
};
