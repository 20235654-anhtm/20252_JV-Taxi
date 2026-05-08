import React from 'react';

interface StaticMapPreviewProps {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
}

const StaticMapPreview: React.FC<StaticMapPreviewProps> = ({ latitude, longitude, loading }) => {
  // In a real app, you would use Google Maps Static API or similar.
  // Here we use a placeholder image or an iframe with pointer-events: none.
  // The requirement says: "Chỉ hiển thị, không cho phép người dùng thao tác chạm, vuốt hay phóng to/thu nhỏ"

  const mapUrl = (latitude && longitude) 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`
    : '';

  return (
    <div className="sl-map-preview">
      {loading ? (
        <span className="sl-loading-text">地図を読み込み中...</span>
      ) : (
        <>
          {mapUrl && (
            <iframe 
              width="100%" 
              height="450px" 
              frameBorder="0" 
              scrolling="no" 
              marginHeight={0} 
              marginWidth={0} 
              src={mapUrl}
              style={{ border: 0, filter: 'grayscale(0.2)', position: 'absolute', top: 0, left: 0 }}
              title="Static Map"
            />
          )}
          {/* Overlay to block all interactions */}
          <div className="sl-map-overlay"></div>
          
          {/* Custom Pin in the center */}
          <div className="sl-map-pin">
            <div className="sl-map-pin-inner"></div>
          </div>
        </>
      )}
    </div>
  );
};

export default StaticMapPreview;
