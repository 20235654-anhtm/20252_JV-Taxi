import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MicOff, Mic, Phone, BadgeCheck } from 'lucide-react';
import { MapView } from '../../components/features/MapView';
import DailyIframe from '@daily-co/daily-js';
import { DailyProvider, DailyAudio, useDaily } from '@daily-co/daily-react';
import { useCallManager } from '../../hooks/useCallManager';
import { showToast } from '../../components/ui/Toast';
import { socketService } from '../../services/socketService';
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
    name: '...',
    avatar: ''
  });

  const { callStatus, isMuted, callDuration, startCall, endCall, toggleMute } = useCallManager();
  const daily = useDaily();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initCall = async () => {
      console.log('[WebRTC-Debug] Passenger initCall started. targetDriver:', targetDriver);
      if (!user?.id || !daily || hasStarted) {
        console.log('[WebRTC-Debug] initCall skipped - user.id or daily object missing, or call already started.');
        return;
      }
      
      if (!targetDriver || !targetDriver.id) {
        console.error("[WebRTC-Debug] initCall error: targetDriver or targetDriver.id is missing.");
        showToast("Không tìm thấy thông tin Tài xế để gọi!", "error");
        if (isMounted) navigate(-1);
        return;
      }

      try {
        console.log('[WebRTC-Debug] Requesting microphone permission...');
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('[WebRTC-Debug] Microphone permission granted.');
        if (isMounted) {
          setHasStarted(true);
          console.log('[WebRTC-Debug] Invoking startCall...');
          startCall(user.id, targetDriver.id);
        }
      } catch (err) {
        console.error("[WebRTC-Debug] Microphone permission error:", err);
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
    socketService.onEndCall(() => {
      console.log("[WebRTC-Debug] Socket event 'end-call' received in CallDriver.tsx");
      endCall();
      navigate(-1);
    });

    return () => {
      socketService.offEndCall();
    };
  }, [navigate, endCall]);

  const statusRef = useRef(callStatus);
  useEffect(() => {
    statusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    return () => {
      console.log('[WebRTC-Debug] CallDriver unmounting, checking if we need to endCall. Current statusRef:', statusRef.current);
      if (statusRef.current !== 'ended' && statusRef.current !== 'idle') {
        endCall();
      }
    };
  }, [endCall]);

  const handleEndCall = () => {
    console.log('[WebRTC-Debug] handleEndCall clicked by passenger');
    if (targetDriver?.id) {
      console.log('[WebRTC-Debug] sending end-call socket event to targetDriver.id:', targetDriver.id);
      socketService.sendEndCall({ targetUserId: targetDriver.id });
    }
    // Luôn phải kết thúc cuộc gọi thực tế trước khi điều hướng
    endCall();
    navigate(-1);
  };

  // Tính số phút / giây
  const mins = Math.floor(callDuration / 60).toString().padStart(2, '0');
  const secs = (callDuration % 60).toString().padStart(2, '0');

  let statusText = '発信中...'; // Đang gọi...
  if (callStatus === 'connecting') statusText = '接続中...'; // Đang kết nối
  if (callStatus === 'ringing') statusText = '呼び出し中...'; // Đang đổ chuông...
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
                <Mic size={28} color="#064E3B" />
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
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#064E3B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="#064E3B" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2V15H6L11 19V5Z" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
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
        startVideoOff: true,
        startAudioOff: false,
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