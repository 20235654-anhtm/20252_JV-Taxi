import React from 'react';
import { Card } from '../ui/Card';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';

import { showToast } from '../ui/Toast';

interface LocationPermissionPopupProps {
  isOpen: boolean;
}

const LocationPermissionPopup: React.FC<LocationPermissionPopupProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  const handleOpenSettings = () => {
    // MOCK: In a real mobile app, this would use Linking.openSettings()
    showToast('Settings đã được mở (Giả lập)', 'info');
  };

  return (
    <div className="sl-popup-overlay">
      <Card variant="elevated" padding="lg" rounded="xl" className="sl-popup-content">
        <Heading level={2} className="sl-popup-title">位置情報の利用許可</Heading>
        <Text color="secondary" className="sl-popup-desc">
          現在地を正確に表示し、スムーズな配車を行うために、スマートフォンの位置情報を「常に許可」に設定してください。
        </Text>
        <Button 
          variant="primary" 
          fullWidth 
          onClick={handleOpenSettings}
          className="sl-popup-btn"
        >
          設定画面を開く
        </Button>
      </Card>
    </div>
  );
};

export default LocationPermissionPopup;
