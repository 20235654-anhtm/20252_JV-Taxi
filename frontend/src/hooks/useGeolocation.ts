import { useState, useEffect } from 'react';

// Định nghĩa kiểu dữ liệu tọa độ
export interface LatLng {
  lat: number;
  lng: number;
}

// Định nghĩa kiểu trả về của hook
interface GeolocationState {
  position: LatLng | null;   // Vị trí hiện tại (null nếu chưa lấy được)
  error: string | null;       // Thông báo lỗi (null nếu không có lỗi)
  loading: boolean;           // Đang chờ lấy vị trí hay không
}

/**
 * Hook tự động lấy và theo dõi vị trí GPS của người dùng theo thời gian thực.
 * Sử dụng watchPosition để cập nhật liên tục khi user di chuyển.
 */
export function useGeolocation(): GeolocationState {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Kiểm tra trình duyệt có hỗ trợ Geolocation không
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị GPS.');
      setLoading(false);
      return;
    }

    // Tùy chọn cho Geolocation API
    const options: PositionOptions = {
      enableHighAccuracy: true, // Dùng GPS chính xác cao (tốn pin hơn)
      timeout: 10000,           // Chờ tối đa 10 giây
      maximumAge: 0,            // Không dùng vị trí cache cũ
    };

    // Callback khi lấy vị trí thành công
    const onSuccess = (pos: GeolocationPosition) => {
      setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
      setLoading(false);
      setError(null);
    };

    // Callback khi có lỗi
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

    // watchPosition: tự động gọi lại onSuccess mỗi khi vị trí thay đổi
    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, options);

    // Cleanup: hủy theo dõi khi component unmount
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []); // [] nghĩa là chỉ chạy 1 lần khi component mount

  return { position, error, loading };
}
