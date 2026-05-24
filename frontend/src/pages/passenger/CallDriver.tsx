import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MicOff, Mic, Phone, BadgeCheck } from 'lucide-react';
import { MapView } from '../../components/features/MapView';
import DailyIframe from '@daily-co/daily-js';
import { DailyProvider, DailyAudio, useDaily } from '@daily-co/daily-react';
import { useCallManager } from '../../hooks/useCallManager';
import { showToast } from '../../components/ui/Toast';
import './CallDriver.css';

const CallDriverUI = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSpeakerOpen, setIsSpeakerOpen] = useState(false);
  
  // Lấy dữ liệu user hiện tại
  const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  // Lấy dữ liệu tài xế từ màn hình trước (Kết hợp fallback từ main để chống lỗi)
  const storedDriverStr = sessionStorage.getItem('active_driver');
  const targetDriver = location.state?.target || location.state?.driver || (storedDriverStr ? JSON.parse(storedDriverStr) : {
    id: '', // Để trống id nếu fallback không có
    name: 'Tài xế',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=driver'
  });

  const { callStatus, isMuted, callDuration, startCall, endCall, toggleMute } = useCallManager();
  const daily = useDaily();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initCall = async () => {
      if (!user?.id || !daily || hasStarted) return;
      
      if (!targetDriver || !targetDriver.id) {
        showToast("Không tìm thấy thông tin Tài xế để gọi!", "error");
        if (isMounted) navigate(-1);
        return;
      }

      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        if (isMounted) {
          setHasStarted(true);
          startCall(user.id, targetDriver.id);
        }
      } catch (err) {
        console.error("Mic permission error:", err);
        showToast("Vui lòng cấp quyền Microphone trên trình duyệt để gọi!", "error");
        if (isMounted) {
          navigate(-1);
        }
      }
    };

    initCall();

    return () => {
      isMounted = false;
    };
  }, [daily, hasStarted, user?.id, targetDriver?.id]);

  useEffect(() => {
    return () => {
      if (callStatus !== 'ended' && callStatus !== 'idle') {
        endCall();
      }
    };
  }, [callStatus, endCall]);

  const handleEndCall = () => {
    // Luôn phải kết thúc cuộc gọi thực tế trước khi điều hướng
    endCall();
    navigate(-1);
  };

  // Tính số phút / giây
  const mins = Math.floor(callDuration / 60).toString().padStart(2, '0');
  const secs = (callDuration % 60).toString().padStart(2, '0');

  let statusText = '発信中...'; // Đang gọi...
  if (callStatus === 'connecting') statusText = '接続中...'; // Đang kết nối
  if (callStatus === 'in-call') statusText = `${mins}:${secs}`;
  if (callStatus === 'ended') statusText = '終了しました'; // Đã kết thúc
  if (callStatus === 'error') statusText = 'エラーが発生しました'; // Lỗi

  return (
    <div className="call-driver-page">
      <DailyAudio />
      <div className="call-driver-map-bg">
        <MapView 
          position={{ lat: 21.0285, lng: 105.8542 }} 
          showZoomControl={false}
        />
      </div>

      <div className="call-content">
        <div className="call-header">
          <div className="call-avatar-container">
            <img src={targetDriver?.avatar} alt={targetDriver?.name} className="call-avatar" />
            <div className="call-badge">
              <BadgeCheck size={18} color="#519A64" fill="white" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="call-name">{targetDriver?.name || 'Đang tải...'}</h2>
          <p className="call-status">{statusText}</p>
        </div>

        <div className="call-actions">
          <div className="call-action-group">
            <button 
              className={`call-action-btn ${isMuted ? 'active' : ''}`}
              onClick={toggleMute}
            >
              {!isMuted ? (
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

const CallDriver = () => {
  const [callObject, setCallObject] = useState<ReturnType<typeof DailyIframe.createCallObject> | null>(null);

  useEffect(() => {
    let obj = DailyIframe.getCallInstance();
    
    if (!obj) {
      obj = DailyIframe.createCallObject({
        audioSource: true,
        videoSource: false,
      });
    }
    
    setCallObject(obj);
  }, []);

  if (!callObject) return null;

  return (
    <DailyProvider callObject={callObject}>
      <CallDriverUI />
    </DailyProvider>
  );
};

export default CallDriver;