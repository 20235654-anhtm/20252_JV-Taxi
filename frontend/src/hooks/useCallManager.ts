import { useCallback, useState, useRef, useEffect } from 'react';
import { useDaily, useDailyEvent } from '@daily-co/daily-react';
import { callService } from '../services/callService';
import { socketService } from '../services/socketService';

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
        console.log(`[WebRTC-Debug] startCall: callerId=${callerId}, targetUserId=${targetUserId}`);
        if (!daily) {
            console.error('[WebRTC-Debug] startCall failed: daily object is null');
            return;
        }
        setCallStatus('connecting');
        try {
            // Gọi backend → tạo room + gửi socket thông báo
            const data = await callService.initiateCall(callerId, targetUserId);
            console.log('[WebRTC-Debug] initiateCall API response:', data);
            if (data.error) throw new Error(data.error);

            // Join phòng Daily → WebRTC bắt đầu
            console.log('[WebRTC-Debug] Join Daily room with url:', data.roomUrl);
            await daily.join({
                url: data.roomUrl,
                token: data.token,
            });
            console.log('[WebRTC-Debug] Driver daily.join completed successfully.');

            // Khi join phòng thành công, người gọi mới chủ động gửi socket báo cuộc gọi đến
            console.log('[WebRTC-Debug] Sending incoming call notification via socket to targetUserId:', targetUserId);
            socketService.sendIncomingCall({
                targetUserId,
                roomName: data.roomName,
                roomUrl: data.roomUrl,
                callerId,
                callerName: data.callerInfo?.name || 'Driver',
                callerPhone: data.callerInfo?.phone || '',
                callerAvatar: data.callerInfo?.avatar || null,
                callerVehicle: data.callerInfo?.vehicle || null,
            });

            setCallStatus('ringing'); // Chờ passenger vào
        } catch (err) {
            console.error('[WebRTC-Debug] startCall error:', err);
            setCallStatus('error');
        }
    }, [daily]);

    // ============================================================
    // acceptCall — Passenger chấp nhận cuộc gọi
    // ============================================================
    // 1. Gọi API backend → lấy token
    // 2. daily.join() → join phòng đã có driver chờ sẵn
    const acceptCall = useCallback(async (roomName: string, roomUrl: string, userId: string) => {
        console.log(`[WebRTC-Debug] acceptCall: roomName=${roomName}, roomUrl=${roomUrl}, userId=${userId}`);
        if (!daily) {
            console.error('[WebRTC-Debug] acceptCall failed: daily object is null');
            return;
        }
        setCallStatus('connecting');
        try {
            const data = await callService.acceptCall(roomName, userId);
            console.log('[WebRTC-Debug] acceptCall API response:', data);
            if (data.error) throw new Error(data.error);

            console.log('[WebRTC-Debug] Passenger join Daily room with url:', roomUrl);
            await daily.join({
                url: roomUrl,
                token: data.token,
            });
            console.log('[WebRTC-Debug] Passenger daily.join completed successfully.');
        } catch (err) {
            console.error('[WebRTC-Debug] acceptCall error:', err);
            setCallStatus('error');
        }
    }, [daily]);

    // ============================================================
    // endCall — Kết thúc cuộc gọi
    // ============================================================
    const endCall = useCallback(async () => {
        console.log('[WebRTC-Debug] endCall invoked');
        if (!daily) {
            console.log('[WebRTC-Debug] endCall: daily object is null, nothing to end');
            return;
        }
        try {
            console.log('[WebRTC-Debug] leaving daily call...');
            await daily.leave();    // Ngắt kết nối WebRTC
            console.log('[WebRTC-Debug] destroying daily call...');
            daily.destroy();        // Giải phóng tài nguyên (mic, network)
            console.log('[WebRTC-Debug] Daily call ended and destroyed.');
        } catch (e) {
            console.error('[WebRTC-Debug] Error leaving/destroying daily:', e);
        }
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

    // Khi người kia (remote participant) join phòng → chuyển sang 'in-call'
    useDailyEvent('participant-joined', (ev: any) => {
        console.log('[WebRTC-Debug] Daily Event: participant-joined', ev);
        const isLocal = ev?.participant?.local;
        if (ev?.participant && !isLocal) {
            console.log('[WebRTC-Debug] Remote participant joined. Setting callStatus to in-call');
            setCallStatus('in-call');
        } else {
            console.log('[WebRTC-Debug] Local participant joined. Keeping current status.');
        }
    });

    // Khi người kia rời phòng → cuộc gọi kết thúc
    useDailyEvent('participant-left', (ev: any) => {
        console.log('[WebRTC-Debug] Daily Event: participant-left', ev);
        setCallStatus('ended');
    });

    // XỬ LÝ MẠNG KÉM: Mạng bị đứt → Daily tự reconnect
    // event.event = 'interrupted' → mạng đứt
    // event.event = 'connected'   → mạng khôi phục
    useDailyEvent('network-connection', (ev: any) => {
        console.log('[WebRTC-Debug] Daily Event: network-connection', ev);
        if (ev?.event === 'interrupted') {
            setCallStatus(prev => {
                if (prev === 'in-call') return 'reconnecting';
                return prev;
            });
        }
        if (ev?.event === 'connected') {
            setCallStatus(prev => {
                if (prev === 'reconnecting') return 'in-call';
                return prev;
            });
        }
    });

    // XỬ LÝ MẠNG KÉM: Chất lượng mạng thay đổi
    // threshold = 'good' | 'low' | 'very-low'
    useDailyEvent('network-quality-change', (ev: any) => {
        console.log('[WebRTC-Debug] Daily Event: network-quality-change', ev);
        const threshold = ev?.threshold;
        if (threshold === 'very-low') setNetworkQuality('very-low');
        else if (threshold === 'low') setNetworkQuality('low');
        else setNetworkQuality('good');
    });

    // Lỗi nghiêm trọng
    useDailyEvent('error', (ev: any) => {
        console.error('[WebRTC-Debug] Daily Event: error', ev);
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
