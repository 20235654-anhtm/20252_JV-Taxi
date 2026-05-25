import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MicOff, Mic, Phone, BadgeCheck } from 'lucide-react';
import { MapView } from '../../components/features/MapView';
import DailyIframe from '@daily-co/daily-js';
import { DailyProvider, DailyAudio, useDaily } from '@daily-co/daily-react';
import { useCallManager } from '../../hooks/useCallManager';
import { showToast } from '../../components/ui/Toast';
import { socketService } from '../../services/socketService';
import './CallPassenger.css';

const CallPassengerUI = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSpeakerOpen, setIsSpeakerOpen] = useState(false);

  // Lấy dữ liệu user hiện tại (Tài xế)
  const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Lấy dữ liệu hành khách từ state hoặc sessionStorage
  const passengerId = location.state?.passengerId || sessionStorage.getItem('active_passenger_id') || '';
  const passengerName = location.state?.passengerName || sessionStorage.getItem('active_passenger_name') || 'Hành khách';
  const passengerAvatar = location.state?.passengerAvatar || sessionStorage.getItem('active_passenger_avatar') || 'https://api.dicebear.com/7.x/avataaars/svg?seed=passenger';

  const { callStatus, isMuted, callDuration, startCall, endCall, toggleMute } = useCallManager();
  const daily = useDaily();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initCall = async () => {
      console.log('[WebRTC-Debug] Driver initCall started. passengerId:', passengerId);
      if (!user?.id || !daily || hasStarted) {
        console.log('[WebRTC-Debug] initCall skipped - user.id or daily object missing, or call already started.');
        return;
      }

      if (!passengerId) {
        console.error("[WebRTC-Debug] initCall error: passengerId is missing.");
        showToast("Không tìm thấy thông tin Hành khách để gọi!", "error");
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
          startCall(user.id, passengerId);
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
  }, [daily, hasStarted, user?.id, passengerId]);

  useEffect(() => {
    socketService.onEndCall(() => {
      console.log("[WebRTC-Debug] Socket event 'end-call' received in CallPassenger.tsx");
      endCall();
      navigate('/driver/chat', { state: location.state });
    });

    return () => {
      socketService.offEndCall();
    };
  }, [navigate, endCall, location.state]);

  const statusRef = useRef(callStatus);
  useEffect(() => {
    statusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    return () => {
      console.log('[WebRTC-Debug] CallPassenger unmounting, checking if we need to endCall. Current statusRef:', statusRef.current);
      if (statusRef.current !== 'ended' && statusRef.current !== 'idle') {
        endCall();
      }
    };
  }, [endCall]);

  const handleEndCall = () => {
    console.log('[WebRTC-Debug] handleEndCall clicked by driver');
    if (passengerId) {
      console.log('[WebRTC-Debug] sending end-call socket event to passengerId:', passengerId);
      socketService.sendEndCall({ targetUserId: passengerId });
    }
    endCall();
    navigate('/driver/chat', { state: location.state });
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
    <div className="call-passenger-page">
      <DailyAudio />
      <div className="call-passenger-map-bg">
        <MapView 
          position={{ lat: 21.0285, lng: 105.8542 }} 
          showZoomControl={false}
        />
      </div>

      <div className="call-content">
        <div className="call-header">
          <div className="call-avatar-container">
            <img src={passengerAvatar} alt={passengerName} className="call-avatar" />
            <div className="call-badge">
              <BadgeCheck size={18} color="#519A64" fill="white" strokeWidth={2.5} />
            </div>
          </div>
          <h2 className="call-name">{passengerName}</h2>
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

const CallPassenger = () => {
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
      <CallPassengerUI />
    </DailyProvider>
  );
};

export default CallPassenger;
