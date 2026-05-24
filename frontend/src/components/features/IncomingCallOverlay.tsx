import { useState, useEffect, useCallback } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { DailyProvider, DailyAudio } from '@daily-co/daily-react';
import { useCallManager } from '../../hooks/useCallManager';
import { socketService } from '../../services/socketService';
import type { IncomingCallData } from '../../services/socketService';
import { Phone, PhoneOff, Mic, MicOff, Wifi, WifiOff, X } from 'lucide-react';

// ============ Màn hình đang nghe (sau khi chấp nhận) ============
// Nằm trong DailyProvider → dùng được useCallManager
function InCallScreen({ callerData, userId, onEnd }: {
    callerData: IncomingCallData;
    userId: string;
    onEnd: () => void;
}) {
    const { callStatus, isMuted, networkQuality, callDuration, acceptCall, endCall, toggleMute } = useCallManager();

    // Tự động join phòng khi mount
    useEffect(() => {
        acceptCall(callerData.roomName, callerData.roomUrl, userId);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const statusText: Record<string, string> = {
        connecting: '接続中...',
        'in-call': formatTime(callDuration),
        reconnecting: '再接続中...',
        ended: '通話終了',
        error: 'エラー',
    };

    const handleEnd = async () => {
        await endCall();
        onEnd();
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-bg-primary)',
        }}>
            {/* Phát audio WebRTC */}
            <DailyAudio />

            {/* Badge mạng */}
            <div style={{
                position: 'absolute', top: 16, right: 16,
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                background: networkQuality === 'good' ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)',
                color: networkQuality === 'good' ? 'var(--color-primary)' : 'var(--color-error)',
            }}>
                {networkQuality === 'good' ? <Wifi size={14} /> : <WifiOff size={14} />}
                {networkQuality === 'good' ? '良好' : networkQuality === 'low' ? '弱い' : '非常に弱い'}
            </div>

            {/* Avatar */}
            <div style={{
                width: 96, height: 96, borderRadius: 'var(--radius-full)',
                overflow: 'hidden', marginBottom: 'var(--spacing-4)',
                background: 'var(--color-primary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
            }}>
                {callerData.callerAvatar
                    ? <img src={callerData.callerAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 36, color: 'white' }}>🚗</span>
                }
            </div>

            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>
                {callerData.callerName}
            </div>
            {callerData.callerVehicle && (
                <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-1)' }}>
                    {callerData.callerVehicle}
                </div>
            )}
            <div style={{ fontSize: 'var(--text-md)', color: 'var(--color-primary)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--spacing-10)' }}>
                {statusText[callStatus] || ''}
            </div>

            {/* Nút điều khiển */}
            <div style={{ display: 'flex', gap: 'var(--spacing-8)', alignItems: 'center' }}>
                <button onClick={toggleMute} style={{
                    width: 56, height: 56, borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
                    background: isMuted ? 'var(--color-error-bg)' : 'var(--color-bg-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {isMuted ? <MicOff size={24} color="var(--color-error)" /> : <Mic size={24} color="var(--color-text-secondary)" />}
                </button>

                <button onClick={handleEnd} style={{
                    width: 64, height: 64, borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
                    background: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(186, 26, 26, 0.3)',
                }}>
                    <PhoneOff size={28} color="white" />
                </button>
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

        return () => {
            socketService.offIncomingCall();
        };
    }, [isAuthenticated, userId]);

    // Chấp nhận cuộc gọi
    const handleAccept = useCallback(async () => {
        if (!incomingCall) return;

        try {
            // Yêu cầu quyền mic ngay lập tức khi bấm Accept (bảo toàn user gesture)
            await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
            console.error("Mic permission denied:", err);
            // Có thể show toast lỗi ở đây
        }

        let obj = DailyIframe.getCallInstance();
        if (!obj) {
            obj = DailyIframe.createCallObject({
                audioSource: true,
                videoSource: false,
            });
        }
        setCallObject(obj);
        setAccepted(true);
    }, [incomingCall]);

    // Từ chối cuộc gọi
    const handleDecline = useCallback(() => {
        setIncomingCall(null);
    }, []);

    // Kết thúc cuộc gọi → reset state
    const handleEnd = useCallback(() => {
        setIncomingCall(null);
        setAccepted(false);
        setCallObject(null);
    }, []);

    // Không có user hoặc không có cuộc gọi → không render gì
    if (!userId || !incomingCall) return null;

    // Đã chấp nhận → hiện màn hình in-call (bọc DailyProvider)
    if (accepted && callObject) {
        return (
            <DailyProvider callObject={callObject}>
                <InCallScreen callerData={incomingCall} userId={userId} onEnd={handleEnd} />
            </DailyProvider>
        );
    }

    // Chưa chấp nhận → hiện popup "Cuộc gọi đến"
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'flex-end', justifyContent: 'center',
            padding: 'var(--spacing-4)',
        }}>
            <div style={{
                width: '100%', maxWidth: 400, background: 'var(--color-bg-white)',
                borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-6)',
                boxShadow: 'var(--shadow-xl)', animation: 'slideUp 0.3s ease-out',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-5)' }}>
                    <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)' }}>
                        📞 着信中...
                    </div>

                    {/* Avatar */}
                    <div style={{
                        width: 72, height: 72, borderRadius: 'var(--radius-full)',
                        overflow: 'hidden', margin: '0 auto var(--spacing-3)',
                        background: 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {incomingCall.callerAvatar
                            ? <img src={incomingCall.callerAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: 28, color: 'white' }}>🚗</span>
                        }
                    </div>

                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-primary)' }}>
                        {incomingCall.callerName}
                    </div>
                    {incomingCall.callerVehicle && (
                        <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)' }}>
                            {incomingCall.callerVehicle}
                        </div>
                    )}
                </div>

                {/* Nút Chấp nhận / Từ chối */}
                <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                    <button onClick={handleDecline} style={{
                        flex: 1, height: 48, borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
                        background: 'var(--color-error-bg)', color: 'var(--color-error)',
                        fontWeight: 'var(--font-bold)', fontSize: 'var(--text-md)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)',
                    }}>
                        <X size={18} /> 拒否
                    </button>
                    <button onClick={handleAccept} style={{
                        flex: 1, height: 48, borderRadius: 'var(--radius-lg)', border: 'none', cursor: 'pointer',
                        background: 'var(--color-primary)', color: 'white',
                        fontWeight: 'var(--font-bold)', fontSize: 'var(--text-md)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-2)',
                    }}>
                        <Phone size={18} /> 応答
                    </button>
                </div>
            </div>
        </div>
    );
}
