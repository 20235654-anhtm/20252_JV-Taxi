import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket: Socket | null = null;

// Dữ liệu cuộc gọi đến mà passenger sẽ nhận
export interface IncomingCallData {
    roomName: string;
    roomUrl: string;
    callerId: string;
    callerName: string;
    callerPhone: string;
    callerAvatar: string | null;
    callerVehicle: string | null;
}

export const socketService = {
    // Kết nối socket + đăng ký userId
    // Gọi hàm này khi user đăng nhập xong
    connect: (userId: string) => {
        if (socket) {
            // Nếu socket đã tồn tại (đang kết nối hoặc đã kết nối)
            // Đảm bảo register lại đúng userId nếu nó đã connected
            if (socket.connected) {
                socket.emit('register', userId);
            }
            return;
        }

        socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('🔌 Socket connected:', socket?.id);
            // Gửi userId lên server → server lưu mapping userId → socketId
            socket?.emit('register', userId);
        });

        socket.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
        });
    },

    // Lắng nghe cuộc gọi đến
    // Khi driver gọi → server gửi event 'incoming-call' đến đúng passenger này
    onIncomingCall: (callback: (data: IncomingCallData) => void) => {
        socket?.on('incoming-call', callback);
    },

    // Bỏ lắng nghe (cleanup khi component unmount)
    offIncomingCall: () => {
        socket?.off('incoming-call');
    },

    // Ngắt kết nối (khi user đăng xuất)
    disconnect: () => {
        socket?.disconnect();
        socket = null;
    },

    // Kiểm tra đang kết nối không
    isConnected: () => socket?.connected ?? false,
};
