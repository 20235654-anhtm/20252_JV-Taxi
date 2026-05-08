import React from 'react';

interface LocationPermissionPopupProps {
  isOpen: boolean;
}

const LocationPermissionPopup: React.FC<LocationPermissionPopupProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  const handleOpenSettings = () => {
    // Thư viện hệ điều hành (như Linking trong React Native hoặc geolocator/permission_handler trong Flutter)
    // Vì đây là React Web, chúng ta không thể mở OS settings trực tiếp bằng code JS thông thường.
    // Dùng Alert để mô phỏng, hoặc chuyển hướng đến một trang hướng dẫn.
    alert('Vui lòng mở cài đặt thiết bị của bạn để cấp quyền vị trí cho ứng dụng này.\n\n(Simulating OS settings link)');
  };

  return (
    <div className="sl-popup-overlay">
      <div className="sl-popup-content">
        <h3 className="sl-popup-title">位置情報へのアクセスが必要です</h3>
        <p className="sl-popup-desc">
          現在地から乗車位置を特定するために、位置情報の利用を許可してください。
        </p>
        <button className="sl-popup-btn" onClick={handleOpenSettings}>
          設定を開く
        </button>
      </div>
    </div>
  );
};

export default LocationPermissionPopup;
