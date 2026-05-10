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
 *
 * Tự động phát hiện khi user cấp quyền GPS mà không cần reload trang:
 *   - Strategy 1 (Permissions API): Chrome Android, Firefox
 *   - Strategy 2 (visibilitychange): iOS Safari + mọi browser khi user
 *     quay lại từ trang Settings của thiết bị
 */
export function useGeolocation(): GeolocationState {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState<boolean>(true);

  // Ref giữ watchId để có thể clear/restart trong closure
  const watchIdRef  = useRef<number | null>(null);
  // Ref theo dõi trạng thái lỗi để visibilitychange biết có nên retry không
  const hasErrorRef = useRef(false);

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
      hasErrorRef.current = false;  // reset cờ lỗi
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
      hasErrorRef.current = true;   // đánh dấu đang có lỗi
    };

    // Khởi động (hoặc restart) watchPosition
    const startWatch = () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, options);
    };

    startWatch();

    // ── Strategy 1: Permissions API ─────────────────────────────
    // Hỗ trợ: Chrome Android, Firefox, Edge
    // Khi permission thay đổi → 'granted' thì tự restart watchPosition
    let permStatus: PermissionStatus | null = null;

    const handlePermissionChange = () => {
      if (permStatus?.state === 'granted') {
        setError(null);
        setLoading(true);
        hasErrorRef.current = false;
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
          // Safari iOS chưa hỗ trợ Permissions API cho geolocation → dùng Strategy 2
        });
    }

    // ── Strategy 2: visibilitychange ────────────────────────────
    // Hỗ trợ: iOS Safari + mọi browser
    // Khi user quay lại từ Settings app → trang được focus lại
    // → thử restart watchPosition nếu đang có lỗi GPS
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && hasErrorRef.current) {
        // Reset và thử lại — nếu đã cấp quyền: onSuccess chạy → popup biến mất
        // Nếu chưa cấp: onError chạy lại → popup vẫn hiện (không ảnh hưởng UX)
        setError(null);
        setLoading(true);
        hasErrorRef.current = false;
        startWatch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup khi unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      permStatus?.removeEventListener('change', handlePermissionChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { position, error, loading };
}
