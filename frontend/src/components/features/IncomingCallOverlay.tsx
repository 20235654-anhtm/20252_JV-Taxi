import { useState, useEffect, useCallback } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { DailyProvider, DailyAudio } from '@daily-co/daily-react';
import { useCallManager } from '../../hooks/useCallManager';
import { socketService } from '../../services/socketService';
import type { IncomingCallData } from '../../services/socketService';
import { Phone, PhoneOff, Mic, MicOff, Wifi, WifiOff, X, BadgeCheck } from 'lucide-react';
import { MapView } from './MapView';
import { Avatar } from '../ui/Avatar';
import '../../pages/passenger/CallDriver.css';

const formatVehicleText = (infoStr: string | null) => {
    if (!infoStr) return '';
    try {
        const parsed = JSON.parse(infoStr);
        const model = parsed.model || '';
        const color = parsed.color || '';
        const plate = parsed.plate || '';
        
        let parts = [];
        if (model) parts.push(model);
        if (color) parts.push(color);
        if (plate) parts.push(plate);
        
        return parts.join(' • ');
    } catch (e) {
        return infoStr;
    }
};

// ============ Màn hình đang nghe (sau khi chấp nhận) ============
// Nằm trong DailyProvider → dùng được useCallManager
function InCallScreen({ callerData, userId, onEnd }: {
    callerData: IncomingCallData;
    userId: string;
    onEnd: () => void;
}) {
    const { callStatus, isMuted, networkQuality, callDuration, acceptCall, endCall, toggleMute } = useCallManager();
    const [isSpeakerOpen, setIsSpeakerOpen] = useState(false);

    // Tự động join phòng khi mount
    useEffect(() => {
        acceptCall(callerData.roomName, callerData.roomUrl, userId);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const mins = Math.floor(callDuration / 60).toString().padStart(2, '0');
    const secs = (callDuration % 60).toString().padStart(2, '0');

    let statusText = '接続中...'; // Đang kết nối...
    if (callStatus === 'connecting') statusText = '接続中...';
    if (callStatus === 'ringing') statusText = '呼び出し中...';
    if (callStatus === 'in-call') statusText = `${mins}:${secs}`;
    if (callStatus === 'reconnecting') statusText = '再接続中...';
    if (callStatus === 'ended') statusText = '終了しました';
    if (callStatus === 'error') statusText = 'エラーが発生しました';

    const handleHangup = async () => {
        if (callerData.callerId) {
            socketService.sendEndCall({ targetUserId: callerData.callerId });
        }
        await endCall();
        onEnd();
    };

    return (
        <div className="call-driver-page" style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
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
                        <Avatar 
                            src={callerData.callerAvatar} 
                            name={callerData.callerName} 
                            className="call-avatar text-4xl" 
                            borderColor="none" 
                        />
                        <div className="call-badge">
                            <BadgeCheck size={18} color="#519A64" fill="white" strokeWidth={2.5} />
                        </div>
                    </div>
                    <h2 className="call-name">{callerData.callerName || 'Đang tải...'}</h2>
                    <p className="call-status" style={{ color: callStatus === 'in-call' ? '#006D37' : '#3D4A3F' }}>{statusText}</p>
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
                    <button className="call-end-btn" onClick={handleHangup}>
                        <Phone size={36} className="phone-icon-end" style={{ transform: 'rotate(135deg)' }} />
                    </button>
                    <span className="call-end-label">終了</span>
                </div>
            </div>
        </div>
    );
}

// ============ Component chính — đặt trong App.tsx ============
// Chạy ngầm trên mọi trang, khi có cuộc gọi đến → hiện popup
import { useLocation } from 'react-router-dom';

export default function IncomingCallOverlay() {
    const location = useLocation(); // Lắng nghe thay đổi URL để re-render khi login/logout
    
    const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
    const [accepted, setAccepted] = useState(false);
    const [callObject, setCallObject] = useState<ReturnType<typeof DailyIframe.createCallObject> | null>(null);

    // Đọc thông tin auth từ sessionStorage (mỗi tab có session riêng)
    // Chỉ khi có cả authToken + user thì mới coi là đã đăng nhập
    const authToken = sessionStorage.getItem('authToken');
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id;
    const userRole = user?.role;
    const isAuthenticated = !!(authToken && userId);

    // Kết thúc cuộc gọi → reset state
    const handleCallEnd = useCallback(() => {
        console.log('[WebRTC-Debug] handleCallEnd invoked in IncomingCallOverlay');
        setIncomingCall(null);
        setAccepted(false);
        setCallObject(null);
    }, []);

    // Từ chối cuộc gọi
    const handleDecline = useCallback(() => {
        console.log('[WebRTC-Debug] handleDecline invoked in IncomingCallOverlay');
        if (incomingCall) {
            console.log('[WebRTC-Debug] sending end-call socket event to target callerId:', incomingCall.callerId);
            socketService.sendEndCall({ targetUserId: incomingCall.callerId });
        }
        handleCallEnd();
    }, [incomingCall, handleCallEnd]);

    // Chấp nhận cuộc gọi
    const handleAccept = useCallback(async () => {
        console.log('[WebRTC-Debug] handleAccept invoked in IncomingCallOverlay');
        if (!incomingCall) return;

        try {
            // Yêu cầu quyền mic ngay lập tức khi bấm Accept (bảo toàn user gesture)
            console.log('[WebRTC-Debug] Requesting audio user media permission...');
            await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('[WebRTC-Debug] Audio permission granted.');
        } catch (err) {
            console.error("[WebRTC-Debug] Mic permission denied:", err);
            // Có thể show toast lỗi ở đây
        }

        console.log('[WebRTC-Debug] Initializing Daily call object...');
        let obj = DailyIframe.getCallInstance();
        if (!obj) {
            obj = DailyIframe.createCallObject({
                startVideoOff: true,
                startAudioOff: false,
            });
            console.log('[WebRTC-Debug] Created new Daily call object instance.');
        } else {
            console.log('[WebRTC-Debug] Reusing existing Daily call object instance.');
        }
        setCallObject(obj);
        setAccepted(true);
    }, [incomingCall]);

    // Kết nối socket CHỈ KHI user đã đăng nhập (có token + userId)
    useEffect(() => {
        if (!isAuthenticated || !userId) {
            // Nếu chưa đăng nhập → đảm bảo socket đã ngắt
            socketService.disconnect();
            return;
        }

        // Kết nối socket + đăng ký userId
        socketService.connect(userId);

        // Lắng nghe cuộc gọi đến
        socketService.onIncomingCall((data: IncomingCallData) => {
            console.log('📞 Incoming call:', data);
            setIncomingCall(data);
        });

        // Lắng nghe cuộc gọi bị huỷ/tắt từ đối phương
        socketService.onEndCall(() => {
            console.log('📞 Cuộc gọi bị đối phương tắt/từ chối (từ overlay)');
            handleCallEnd();
        });

        return () => {
            socketService.offIncomingCall();
            socketService.offEndCall();
        };
    }, [isAuthenticated, userId, handleCallEnd]);

    // Không có user hoặc không có cuộc gọi → không render gì
    if (!userId || !incomingCall) return null;

    // Đã chấp nhận → hiện màn hình in-call (bọc DailyProvider)
    if (accepted && callObject) {
        return (
            <DailyProvider callObject={callObject}>
                <InCallScreen callerData={incomingCall} userId={userId} onEnd={handleCallEnd} />
            </DailyProvider>
        );
    }

    // Chưa chấp nhận → hiện popup "Cuộc gọi đến"
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.4)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            padding: '24px',
        }}>
            <div style={{
                width: '100%', maxWidth: 360, background: 'var(--color-bg-white)',
                borderRadius: '28px', padding: '28px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                animation: 'scaleIn 0.25s ease-out',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', width: '100%', marginBottom: '24px' }}>
                    <div style={{ fontSize: '15px', color: '#888', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
                        <span style={{ color: '#E11D48' }}>📞</span> 着信中...
                    </div>

                    {/* Avatar */}
                    <div style={{
                        width: 88, height: 88, borderRadius: '50%',
                        overflow: 'hidden', margin: '0 auto 16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Avatar 
                            src={incomingCall.callerAvatar} 
                            name={incomingCall.callerName} 
                            className="w-full h-full text-4xl" 
                            borderColor="none" 
                        />
                    </div>

                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#111', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                        {incomingCall.callerName}
                    </div>
                    {incomingCall.callerVehicle && (
                        <div style={{ fontSize: '14px', color: '#666', marginTop: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            {formatVehicleText(incomingCall.callerVehicle)}
                        </div>
                    )}
                </div>

                {/* Nút Chấp nhận / Từ chối */}
                <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                    <button onClick={handleDecline} style={{
                        flex: 1, height: 50, borderRadius: '18px', border: 'none', cursor: 'pointer',
                        background: '#FEE2E2', color: '#DC2626',
                        fontWeight: '700', fontSize: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        transition: 'transform 0.15s ease',
                    }}>
                        <X size={18} /> 拒否
                    </button>
                    <button onClick={handleAccept} style={{
                        flex: 1, height: 50, borderRadius: '18px', border: 'none', cursor: 'pointer',
                        background: '#065F46', color: 'white',
                        fontWeight: '700', fontSize: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        transition: 'transform 0.15s ease',
                    }}>
                        <Phone size={18} fill="white" color="white" /> 応答
                    </button>
                </div>
            </div>
        </div>
    );
}
