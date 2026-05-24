import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MicOff, Mic, Volume2, VolumeX, Phone, BadgeCheck } from 'lucide-react';
import { MapView } from '../../components/features/MapView';
import './CallDriver.css';

const CallDriver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedDriverStr = sessionStorage.getItem('active_driver');
  const driver = location.state?.driver || (storedDriverStr ? JSON.parse(storedDriverStr) : {
    name: 'Tài xế',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=driver'
  });
  const [isMicOpen, setIsMicOpen] = useState(false);
  const [isSpeakerOpen, setIsSpeakerOpen] = useState(false);

  const handleEndCall = () => {
    navigate('/passenger/chat', { state: location.state });
  };

  return (
    <div className="call-driver-page">
      <div className="call-driver-map-bg">
        <MapView 
          position={{ lat: 21.0285, lng: 105.8542 }} 
          showZoomControl={false}
        />
      </div>

      <div className="call-content">
        <div className="call-header">
          <div className="call-avatar-container">
            <img src={driver.avatar} alt={driver.name} className="call-avatar" />
            <div className="call-badge">
              <BadgeCheck size={18} color="#519A64" fill="white" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="call-name">{driver.name}</h2>
          <p className="call-status">発信中...</p>
        </div>

        <div className="call-actions">
          <div className="call-action-group">
            <button 
              className={`call-action-btn ${isMicOpen ? 'active' : ''}`}
              onClick={() => setIsMicOpen(!isMicOpen)}
            >
              {isMicOpen ? (
                <Mic size={28} color="#064E3B" fill="currentColor" />
              ) : (
                <MicOff size={28} color="#333" />
              )}
            </button>
            <span className="call-action-label">消音</span>
          </div>

          <div className="call-action-group">
            <button 
              className={`call-action-btn ${isSpeakerOpen ? 'active' : ''}`}
              onClick={() => setIsSpeakerOpen(!isSpeakerOpen)}
            >
              {isSpeakerOpen ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#064E3B" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 9H8L13 4V20L8 15H4V9Z" />
                  <path d="M15 4 A 8 8 0 0 1 15 20 L 15 15 A 3 3 0 0 0 15 9 Z" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              )}
            </button>
            <span className="call-action-label speaker-label">スピーカー</span>
          </div>
        </div>

        <div className="call-end-container">
          <button className="call-end-btn" onClick={handleEndCall}>
            <Phone size={36} className="phone-icon-end" />
          </button>
          <span className="call-end-label">終了</span>
        </div>
      </div>
    </div>
  );
};

export default CallDriver;
