import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

const SOCKET_URL = API_BASE_URL;

let socket: Socket | null = null;
let currentUserId: string | null = null;
let activeRideId: string | null = null;

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
        currentUserId = userId;

        if (socket) {
            if (!socket.connected) {
                socket.connect();
            } else {
                socket.emit('register', userId);
            }
            return;
        }

        socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('🔌 Socket connected:', socket?.id);
            if (currentUserId) {
                socket?.emit('register', currentUserId);
            }
            if (activeRideId) {
                socket?.emit('join-chat', activeRideId);
                console.log(`💬 Auto-rejoined chat room ${activeRideId} on socket connect`);
            }
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

    // Lắng nghe chấp nhận đặt xe
    onBookingAccepted: (callback: (data: any) => void) => {
        socket?.on('booking-accepted', callback);
    },

    offBookingAccepted: () => {
        socket?.off('booking-accepted');
    },

    // Lắng nghe từ chối đặt xe
    onBookingRejected: (callback: (data: any) => void) => {
        socket?.on('booking-rejected', callback);
    },

    offBookingRejected: () => {
        socket?.off('booking-rejected');
    },

    // Lắng nghe huỷ đặt xe (phía tài xế)
    onBookingCancelled: (callback: (data: any) => void) => {
        socket?.on('booking-cancelled', callback);
    },

    offBookingCancelled: () => {
        socket?.off('booking-cancelled');
    },

    // Lắng nghe yêu cầu đặt xe mới (phía tài xế)
    onIncomingBooking: (callback: (data: any) => void) => {
        socket?.on('incoming-booking', callback);
    },

    offIncomingBooking: () => {
        socket?.off('incoming-booking');
    },

    // Lắng nghe vị trí tài xế cập nhật real-time
    onDriverLocation: (callback: (data: { lat: number; lng: number }) => void) => {
        socket?.on('driver-location', callback);
    },

    offDriverLocation: () => {
        socket?.off('driver-location');
    // Chat logic
    joinChat: (rideId: string) => {
        activeRideId = rideId;
        socket?.emit('join-chat', rideId);
        console.log(`💬 Joined active chat room ${rideId}`);
    },

    sendMessage: (data: { rideId: string; senderId: string; text: string }) => {
        socket?.emit('send-message', data);
    },

    onReceiveMessage: (callback: (message: any) => void) => {
        socket?.on('receive-message', callback);
    },

    offReceiveMessage: () => {
        socket?.off('receive-message');
    },

    onRideCompleted: (callback: (data: any) => void) => {
        socket?.on('ride-completed', callback);
    },

    offRideCompleted: () => {
        socket?.off('ride-completed');
    },

    // Ngắt kết nối (khi user đăng xuất)
    disconnect: () => {
        socket?.disconnect();
        socket = null;
        currentUserId = null;
        activeRideId = null;
    },

    // Kiểm tra đang kết nối không
    isConnected: () => socket?.connected ?? false,
};
