import { useCallback, useState, useRef, useEffect } from 'react';
import { useDaily, useDailyEvent } from '@daily-co/daily-react';
import { callService } from '../services/callService';

// ============ Các trạng thái cuộc gọi ============
export type CallStatus =
    | 'idle'          // Chưa gọi
    | 'connecting'    // Đang kết nối (đang join phòng Daily)
    | 'ringing'       // Đang đổ chuông (chờ đối phương chấp nhận)
    | 'in-call'       // Đang trong cuộc gọi
    | 'reconnecting'  // Mạng đứt, đang kết nối lại (Daily tự xử lý)
    | 'ended'         // Cuộc gọi kết thúc
    | 'error';        // Lỗi

export type NetworkQuality = 'good' | 'low' | 'very-low';

export function useCallManager() {
    // ============ Lấy call object từ DailyProvider ============
    // useDaily() chỉ hoạt động khi component nằm trong <DailyProvider>
    const daily = useDaily();

    // ============ State ============
    const [callStatus, setCallStatus] = useState<CallStatus>('idle');
    const [isMuted, setIsMuted] = useState(false);
    const [networkQuality, setNetworkQuality] = useState<NetworkQuality>('good');
    const [callDuration, setCallDuration] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ============ Đếm thời gian cuộc gọi ============
    useEffect(() => {
        if (callStatus === 'in-call') {
            timerRef.current = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            if (callStatus === 'idle' || callStatus === 'ended') setCallDuration(0);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [callStatus]);

    // ============================================================
    // startCall — Driver gọi cho Passenger
    // ============================================================
    // 1. Gọi API backend → tạo Daily room + gửi socket đến passenger
    // 2. daily.join() → bắt đầu WebRTC handshake
    //    → Daily tự dùng STUN/TURN để thiết lập kết nối
    // 3. Set status 'ringing' → chờ passenger join
    const startCall = useCallback(async (callerId: string, targetUserId: string) => {
        if (!daily) return;
        setCallStatus('connecting');
        try {
            // Gọi backend → tạo room + gửi socket thông báo
            const data = await callService.initiateCall(callerId, targetUserId);
            if (data.error) throw new Error(data.error);

            // Join phòng Daily → WebRTC bắt đầu
            await daily.join({
                url: data.roomUrl,
                token: data.token,
                videoSource: false,  // TẮT VIDEO → audio only
                audioSource: true,   // BẬT MIC
            });

            setCallStatus('ringing'); // Chờ passenger vào
        } catch (err) {
            console.error('startCall error:', err);
            setCallStatus('error');
        }
    }, [daily]);

    // ============================================================
    // acceptCall — Passenger chấp nhận cuộc gọi
    // ============================================================
    // 1. Gọi API backend → lấy token
    // 2. daily.join() → join phòng đã có driver chờ sẵn
    const acceptCall = useCallback(async (roomName: string, roomUrl: string, userId: string) => {
        if (!daily) return;
        setCallStatus('connecting');
        try {
            const data = await callService.acceptCall(roomName, userId);
            if (data.error) throw new Error(data.error);

            await daily.join({
                url: roomUrl,
                token: data.token,
                videoSource: false,
                audioSource: true,
            });

            setCallStatus('in-call');
        } catch (err) {
            console.error('acceptCall error:', err);
            setCallStatus('error');
        }
    }, [daily]);

    // ============================================================
    // endCall — Kết thúc cuộc gọi
    // ============================================================
    const endCall = useCallback(async () => {
        if (!daily) return;
        await daily.leave();    // Ngắt kết nối WebRTC
        daily.destroy();        // Giải phóng tài nguyên (mic, network)
        setCallStatus('ended');
        setIsMuted(false);
        setNetworkQuality('good');
    }, [daily]);

    // ============================================================
    // toggleMute — Tắt/bật mic
    // ============================================================
    const toggleMute = useCallback(() => {
        if (!daily) return;
        const newMuted = !isMuted;
        daily.setLocalAudio(!newMuted); // true = bật mic, false = tắt mic
        setIsMuted(newMuted);
    }, [daily, isMuted]);

    // ============================================================
    // EVENTS — Lắng nghe sự kiện từ Daily (Xử lý mạng kém)
    // ============================================================

    // Khi người kia join phòng → chuyển sang 'in-call'
    useDailyEvent('participant-joined', () => {
        setCallStatus('in-call');
    });

    // Khi người kia rời phòng → cuộc gọi kết thúc
    useDailyEvent('participant-left', () => {
        setCallStatus('ended');
    });

    // XỬ LÝ MẠNG KÉM: Mạng bị đứt → Daily tự reconnect
    // event.event = 'interrupted' → mạng đứt
    // event.event = 'connected'   → mạng khôi phục
    useDailyEvent('network-connection', (ev: any) => {
        if (ev?.event === 'interrupted') {
            setCallStatus('reconnecting');
        }
        if (ev?.event === 'connected') {
            setCallStatus('in-call');
        }
    });

    // XỬ LÝ MẠNG KÉM: Chất lượng mạng thay đổi
    // threshold = 'good' | 'low' | 'very-low'
    useDailyEvent('network-quality-change', (ev: any) => {
        const threshold = ev?.threshold;
        if (threshold === 'very-low') setNetworkQuality('very-low');
        else if (threshold === 'low') setNetworkQuality('low');
        else setNetworkQuality('good');
    });

    // Lỗi nghiêm trọng
    useDailyEvent('error', () => {
        setCallStatus('error');
    });

    return {
        callStatus,
        isMuted,
        networkQuality,
        callDuration,
        startCall,
        acceptCall,
        endCall,
        toggleMute,
    };
}
