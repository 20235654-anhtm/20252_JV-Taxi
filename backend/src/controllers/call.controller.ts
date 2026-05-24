import { Request, Response } from 'express';
import prisma from '../config/db';
import { io, userSocketMap } from '../index';

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';

// ============================================================
// HÀM 1: initiateCall — Driver gọi cho Passenger
// ============================================================
// Luồng:
//   1. Nhận callerId (driver) + targetUserId (passenger)
//   2. Query DB lấy thông tin driver (tên, SĐT, avatar, xe)
//   3. Tạo phòng Daily.co (private, audio only, 2 người)
//      → Daily tự cấu hình STUN/TURN cho phòng này
//   4. Tạo token cho driver join phòng
//      → Token xác thực qua Signaling server của Daily
//   5. Gửi socket 'incoming-call' đến đúng passenger
//   6. Trả về roomName + token cho driver
// ============================================================
export const initiateCall = async (req: Request, res: Response) => {
    const { callerId, targetUserId } = req.body;

    try {
        // 1. Query thông tin người gọi (driver) từ DB
        const callerProfile = await prisma.profile.findUnique({
            where: { id: callerId },
            include: { driverProfile: true },
        });

        if (!callerProfile) {
            return res.status(404).json({ error: 'Không tìm thấy người gọi' });
        }

        // 2. Tạo phòng trên Daily.co
        //    → privacy: 'private' = bắt buộc có token mới join được (STUN/TURN bảo mật)
        //    → max_participants: 2 = chỉ driver + passenger
        // Dùng chung 1 phòng duy nhất cho toàn bộ hệ thống (tiết kiệm room và dễ test)
        const roomName = `global-test-room`;
        let roomUrl = '';

        const roomResponse = await fetch(`${DAILY_API_URL}/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${DAILY_API_KEY}`,
            },
            body: JSON.stringify({
                name: roomName,
                privacy: 'private',
                properties: {
                    max_participants: 2,
                    start_video_off: true,
                    start_audio_off: false,
                },
            }),
        });

        if (!roomResponse.ok) {
            const err = await roomResponse.json();
            // Nếu lỗi do phòng đã tồn tại (Daily trả về 400)
            if (err.info?.includes('already exists') || err.error === 'invalid-request') {
                const getRoomRes = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
                    headers: { Authorization: `Bearer ${DAILY_API_KEY}` }
                });
                const existingRoom = await getRoomRes.json();
                roomUrl = existingRoom.url;
            } else {
                return res.status(500).json({ error: 'Không tạo được phòng Daily', details: err });
            }
        } else {
            const roomData = await roomResponse.json();
            roomUrl = roomData.url;
        }

        // 3. Tạo token cho driver (Signaling auth)
        const tokenResponse = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${DAILY_API_KEY}`,
            },
            body: JSON.stringify({
                properties: {
                    room_name: roomName,
                    user_name: callerProfile.fullName || 'Driver',
                    exp: Math.floor(Date.now() / 1000) + 3600,
                },
            }),
        });
        
        if (!tokenResponse.ok) {
            const err = await tokenResponse.json();
            return res.status(500).json({ error: 'Không tạo được Token Driver', details: err });
        }

        const tokenData = await tokenResponse.json();

        // 4. Gửi socket 'incoming-call' đến đúng passenger
        //    → Tra map userId → socketId → gửi event chỉ đến socket đó
        const targetSocketId = userSocketMap.get(targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit('incoming-call', {
                roomName,
                roomUrl: roomUrl,
                callerId,
                callerName: callerProfile.fullName,
                callerPhone: callerProfile.phone,
                callerAvatar: callerProfile.driverProfile?.avatarPicture || null,
                callerVehicle: callerProfile.driverProfile?.vehicleInfor || null,
            });
            console.log(`📞 Cuộc gọi từ ${callerProfile.fullName} → gửi đến userId=${targetUserId}`);
        } else {
            console.log(`⚠️ User ${targetUserId} không online (không tìm thấy socketId)`);
        }

        // 5. Trả về roomName + token cho driver để join phòng
        res.json({
            roomName,
            roomUrl: roomUrl,
            token: tokenData.token,
            targetOnline: !!targetSocketId, // Cho driver biết passenger có online không
        });

    } catch (error: any) {
        console.error('initiateCall error:', error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================================
// HÀM 2: acceptCall — Passenger chấp nhận cuộc gọi
// ============================================================
// Luồng:
//   1. Nhận roomName + userId (passenger)
//   2. Tạo token Daily cho passenger
//   3. Trả về token để passenger join phòng
// ============================================================
export const acceptCall = async (req: Request, res: Response) => {
    const { roomName, userId } = req.body;

    try {
        // Query tên passenger để hiện trong phòng
        const profile = await prisma.profile.findUnique({
            where: { id: userId },
        });

        // Tạo token cho passenger (Signaling auth)
        const tokenResponse = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${DAILY_API_KEY}`,
            },
            body: JSON.stringify({
                properties: {
                    room_name: roomName,
                    user_name: profile?.fullName || 'Passenger',
                    exp: Math.floor(Date.now() / 1000) + 3600,
                },
            }),
        });

        if (!tokenResponse.ok) {
            const err = await tokenResponse.json();
            return res.status(500).json({ error: 'Không tạo được Token Passenger', details: err });
        }

        const tokenData = await tokenResponse.json();

        res.json({ token: tokenData.token });

    } catch (error: any) {
        console.error('acceptCall error:', error);
        res.status(500).json({ error: error.message });
    }
};
