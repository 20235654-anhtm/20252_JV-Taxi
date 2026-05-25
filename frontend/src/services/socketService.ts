import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

const SOCKET_URL = API_BASE_URL;

// Khởi tạo socket instance duy nhất ngay lập tức để tránh biến socket bị null lúc đăng ký listener
const socket: Socket = io(SOCKET_URL, { autoConnect: false });
let currentUserId: string | null = null;
let activeRideId: string | null = null;

socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
    if (currentUserId) {
        socket.emit('register', currentUserId);
    }
    if (activeRideId) {
        socket.emit('join-chat', activeRideId);
        console.log(`💬 Auto-rejoined chat room ${activeRideId} on socket connect`);
    }
});

socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
});

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
    connect: (userId: string) => {
        currentUserId = userId;

        if (!socket.connected) {
            socket.connect();
        } else {
            socket.emit('register', userId);
        }
    },

    // Gửi sự kiện yêu cầu notify cuộc gọi đến cho đối phương (sau khi người gọi đã kết nối thành công Daily)
    sendIncomingCall: (data: {
        targetUserId: string;
        roomName: string;
        roomUrl: string;
        callerId: string;
        callerName: string;
        callerPhone: string;
        callerAvatar: string | null;
        callerVehicle: string | null;
    }) => {
        socket.emit('notify-incoming-call', data);
    },

    // Lắng nghe cuộc gọi đến
    onIncomingCall: (callback: (data: IncomingCallData) => void) => {
        socket.on('incoming-call', callback);
    },

    // Bỏ lắng nghe
    offIncomingCall: () => {
        socket.off('incoming-call');
    },

    // Gửi sự kiện tắt cuộc gọi
    sendEndCall: (data: { targetUserId: string }) => {
        socket.emit('end-call', data);
    },

    // Lắng nghe sự kiện tắt cuộc gọi từ đối phương
    onEndCall: (callback: () => void) => {
        socket.on('end-call', callback);
    },

    // Bỏ lắng nghe
    offEndCall: () => {
        socket.off('end-call');
    },

    // Lắng nghe chấp nhận đặt xe
    onBookingAccepted: (callback: (data: any) => void) => {
        socket.on('booking-accepted', callback);
    },

    offBookingAccepted: () => {
        socket.off('booking-accepted');
    },

    // Lắng nghe từ chối đặt xe
    onBookingRejected: (callback: (data: any) => void) => {
        socket.on('booking-rejected', callback);
    },

    offBookingRejected: () => {
        socket.off('booking-rejected');
    },

    // Lắng nghe huỷ đặt xe (phía tài xế)
    onBookingCancelled: (callback: (data: any) => void) => {
        socket.on('booking-cancelled', callback);
    },

    offBookingCancelled: () => {
        socket.off('booking-cancelled');
    },

    // Lắng nghe yêu cầu đặt xe mới (phía tài xế)
    onIncomingBooking: (callback: (data: any) => void) => {
        socket.on('incoming-booking', callback);
    },

    offIncomingBooking: () => {
        socket.off('incoming-booking');
    },

    // Lắng nghe vị trí tài xế cập nhật real-time
    onDriverLocation: (callback: (data: { lat: number; lng: number }) => void) => {
        socket.on('driver-location', callback);
    },

    offDriverLocation: () => {
        socket.off('driver-location');
    },

    // Chat logic
    joinChat: (rideId: string) => {
        activeRideId = rideId;
        socket.emit('join-chat', rideId);
        console.log(`💬 Joined active chat room ${rideId}`);
    },

    sendMessage: (data: { rideId: string; senderId: string; text: string }) => {
        socket.emit('send-message', data);
    },

    onReceiveMessage: (callback: (message: any) => void) => {
        socket.on('receive-message', callback);
    },

    offReceiveMessage: () => {
        socket.off('receive-message');
    },

    onRideCompleted: (callback: (data: any) => void) => {
        socket.on('ride-completed', callback);
    },

    offRideCompleted: () => {
        socket.off('ride-completed');
    },

    // Ngắt kết nối (khi user đăng xuất)
    disconnect: () => {
        socket.disconnect();
        currentUserId = null;
        activeRideId = null;
    },

    // Kiểm tra đang kết nối không
    isConnected: () => socket.connected,
};
