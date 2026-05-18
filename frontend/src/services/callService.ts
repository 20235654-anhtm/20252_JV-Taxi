import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/api/call`;

export const callService = {
    // Driver gọi cho passenger
    // → Backend sẽ: tạo Daily room + gửi socket đến passenger
    // → Trả về: roomName, roomUrl, token (cho driver join), targetOnline
    initiateCall: async (callerId: string, targetUserId: string) => {
        const res = await fetch(`${API_URL}/initiate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callerId, targetUserId }),
        });
        return res.json();
    },

    // Passenger chấp nhận cuộc gọi
    // → Backend sẽ: tạo Daily token cho passenger
    // → Trả về: token, roomUrl (cho passenger join)
    acceptCall: async (roomName: string, userId: string) => {
        const res = await fetch(`${API_URL}/accept`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomName, userId }),
        });
        return res.json();
    },
};
