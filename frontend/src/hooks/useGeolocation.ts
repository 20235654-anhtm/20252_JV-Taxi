import { useState, useEffect, useRef } from 'react';

export interface LatLng {
  lat: number;
  lng: number;
}

interface GeolocationState {
  position: LatLng | null;
  error: string | null;
  loading: boolean;
}

/**
 * Hook theo dõi GPS theo thời gian thực.
 * Tự động phát hiện khi user bật quyền GPS trong settings trình duyệt
 * → popup lỗi tự biến mất, vị trí được lấy lại mà không cần reload.
 */
export function useGeolocation(): GeolocationState {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState<boolean>(true);

  // Giữ watchId trong ref để có thể clear và restart trong closure
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị GPS.');
      setLoading(false);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const onSuccess = (pos: GeolocationPosition) => {
      setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setLoading(false);
      setError(null);
    };

    const onError = (err: GeolocationPositionError) => {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError('Bạn đã từ chối quyền truy cập vị trí. Hãy cho phép trong cài đặt trình duyệt.');
          break;
        case err.POSITION_UNAVAILABLE:
          setError('Không thể xác định vị trí. Hãy thử lại sau.');
          break;
        case err.TIMEOUT:
          setError('Hết thời gian chờ lấy vị trí. Hãy thử lại.');
          break;
        default:
          setError('Đã xảy ra lỗi khi lấy vị trí.');
      }
      setLoading(false);
    };

    // Hàm khởi động (hoặc khởi động lại) watchPosition
    const startWatch = () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, options);
    };

    startWatch();

    // ── Permissions API: lắng nghe khi user bật GPS từ settings ──
    // Khi permission thay đổi từ 'denied'/'prompt' → 'granted':
    //   → tự restart watchPosition → onSuccess chạy → error = null → popup tắt
    let permStatus: PermissionStatus | null = null;

    const handlePermissionChange = () => {
      if (permStatus?.state === 'granted') {
        setError(null);
        setLoading(true);
        startWatch();
      }
    };

    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then(status => {
          permStatus = status;
          status.addEventListener('change', handlePermissionChange);
        })
        .catch(() => {
          // Một số môi trường không hỗ trợ Permissions API → bỏ qua
        });
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      permStatus?.removeEventListener('change', handlePermissionChange);
    };
  }, []);

  return { position, error, loading };
}
