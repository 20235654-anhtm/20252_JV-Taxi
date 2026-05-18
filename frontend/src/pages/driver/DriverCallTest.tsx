import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DailyIframe from '@daily-co/daily-js';
import { DailyProvider, DailyAudio } from '@daily-co/daily-react';
import { useCallManager } from '../../hooks/useCallManager';
import { Phone, PhoneOff, Mic, MicOff, Wifi, WifiOff, ArrowLeft } from 'lucide-react';

// ============ Danh sách passenger test (từ seed data) ============
const TEST_PASSENGERS = [
    {
        id: '22222222-2222-2222-2222-111111111111',
        name: 'Sinh Viên Bách Khoa',
        phone: '0988888888',
    },
    {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Giảng Viên HUST',
        phone: '0977777777',
    },
];

// ============ Component màn hình đang gọi ============
// Nằm trong DailyProvider → dùng được useCallManager
function CallingScreen({ targetName, targetPhone, callerId, targetUserId, onBack }: {
    targetName: string;
    targetPhone: string;
    callerId: string;
    targetUserId: string;
    onBack: () => void;
}) {
    const { callStatus, isMuted, networkQuality, callDuration, startCall, endCall, toggleMute } = useCallManager();

    // Tự động gọi khi mount
    useEffect(() => {
        startCall(callerId, targetUserId);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Format thời gian mm:ss
    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    // Hiện text trạng thái bằng tiếng Nhật
    const statusText: Record<string, string> = {
        connecting: '接続中...',
        ringing: '発信中...',
        'in-call': formatTime(callDuration),
        reconnecting: '再接続中...',
        ended: '通話終了',
        error: 'エラー',
    };

    const handleEnd = async () => {
        await endCall();
        onBack();
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: '100vh', background: 'var(--color-bg-primary)', padding: 'var(--spacing-6)',
            position: 'relative',
        }}>
            {/* DailyAudio BẮT BUỘC — phát âm thanh WebRTC của đối phương */}
            <DailyAudio />

            {/* Badge chất lượng mạng (Xử lý mạng kém) */}
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

            {/* Avatar + Tên + Trạng thái */}
            <div style={{
                width: 96, height: 96, borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '36px', color: 'white', marginBottom: 'var(--spacing-4)',
            }}>
                🧑
            </div>
            <div style={{
                fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)',
                color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)',
            }}>
                {targetName}
            </div>
            <div style={{
                fontSize: 'var(--text-md)', color: 'var(--color-text-secondary)',
                marginBottom: 'var(--spacing-1)',
            }}>
                {targetPhone}
            </div>
            <div style={{
                fontSize: 'var(--text-md)', color: 'var(--color-primary)',
                fontWeight: 'var(--font-semibold)', marginBottom: 'var(--spacing-10)',
            }}>
                {statusText[callStatus] || ''}
            </div>

            {/* Nút điều khiển */}
            <div style={{ display: 'flex', gap: 'var(--spacing-8)', alignItems: 'center' }}>
                {/* Nút Mute */}
                <button onClick={toggleMute} style={{
                    width: 56, height: 56, borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer',
                    background: isMuted ? 'var(--color-error-bg)' : 'var(--color-bg-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all var(--transition-fast)',
                }}>
                    {isMuted ? <MicOff size={24} color="var(--color-error)" /> : <Mic size={24} color="var(--color-text-secondary)" />}
                </button>

                {/* Nút Kết thúc */}
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

// ============ Trang chính — Danh sách passenger ============
export default function DriverCallTest() {
    const navigate = useNavigate();
    const [calling, setCalling] = useState<typeof TEST_PASSENGERS[0] | null>(null);
    const [callObject, setCallObject] = useState<ReturnType<typeof DailyIframe.createCallObject> | null>(null);

    // Lấy userId driver từ sessionStorage
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const driverId = user.id;

    const handleCall = (passenger: typeof TEST_PASSENGERS[0]) => {
        // Tạo call object Daily (audio only, không video)
        const obj = DailyIframe.createCallObject({
            audioSource: true,
            videoSource: false,
        });
        setCallObject(obj);
        setCalling(passenger);
    };

    const handleBack = () => {
        setCalling(null);
        setCallObject(null);
    };

    // Nếu đang gọi → hiện màn hình calling (bọc trong DailyProvider)
    if (calling && callObject) {
        return (
            <DailyProvider callObject={callObject}>
                <CallingScreen
                    targetName={calling.name}
                    targetPhone={calling.phone}
                    callerId={driverId}
                    targetUserId={calling.id}
                    onBack={handleBack}
                />
            </DailyProvider>
        );
    }

    // Danh sách passenger
    return (
        <div style={{
            minHeight: '100vh', background: 'var(--color-bg-primary)',
            padding: 'var(--spacing-6)', fontFamily: 'var(--font-primary)',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
                <button onClick={() => navigate('/driver')} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--spacing-2)',
                }}>
                    <ArrowLeft size={24} color="var(--color-text-primary)" />
                </button>
                <h1 style={{
                    fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)',
                    color: 'var(--color-text-primary)', margin: 0,
                }}>
                    📞 通話テスト
                </h1>
            </div>

            <p style={{ fontSize: 'var(--text-md)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-6)' }}>
                乗客を選んで通話をテストしてください
            </p>

            {/* Thẻ passenger */}
            {TEST_PASSENGERS.map((p) => (
                <div key={p.id} style={{
                    background: 'var(--color-bg-white)', borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-3)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 'var(--radius-full)',
                            background: 'var(--color-primary-lighter)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                        }}>
                            🧑
                        </div>
                        <div>
                            <div style={{
                                fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)',
                                color: 'var(--color-text-primary)',
                            }}>
                                {p.name}
                            </div>
                            <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)' }}>
                                {p.phone}
                            </div>
                        </div>
                    </div>

                    <button onClick={() => handleCall(p)} style={{
                        width: 48, height: 48, borderRadius: 'var(--radius-full)', border: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--color-primary)', boxShadow: 'var(--shadow-green)',
                    }}>
                        <Phone size={20} color="white" />
                    </button>
                </div>
            ))}
        </div>
    );
}
