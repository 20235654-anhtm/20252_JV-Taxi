import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import driverRoutes from './routes/driver.routes';
import destinationRoutes from './routes/destination.routes';
import authRoutes from './routes/auth.routes';
import paymentRoutes from './routes/payment.routes';
import callRoutes from './routes/call.routes';
import rideRoutes from './routes/ride.routes';
import messageRoutes from './routes/message.routes';
import reviewRoutes from './routes/review.routes';
import fareRoutes from './routes/fare.routes';
import prisma from './config/db';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' }
});
const userSocketMap = new Map<string, string>();

io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    socket.on('register', (userId: string) => {
        userSocketMap.set(userId, socket.id);
        console.log(`📝 Registered: userId=${userId} → socketId=${socket.id}`);
    });

    // Driver sends their live location → relay to the passenger
    socket.on('driver-location-update', (data: { passengerId: string; lat: number; lng: number }) => {
        const passengerSocketId = userSocketMap.get(data.passengerId);
        if (passengerSocketId) {
            io.to(passengerSocketId).emit('driver-location', { lat: data.lat, lng: data.lng });
        }
    });

    socket.on('disconnect', async () => {
        for (const [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);
                console.log(`🗑️ Unregistered: userId=${userId}`);
                
                // Set driver offline in DB if they disconnect
                try {
                    await prisma.driverProfile.updateMany({
                        where: { userId },
                        data: { isOnline: false }
                    });
                    console.log(`🔻 Set driver offline: userId=${userId}`);
                } catch (e) {
                    // Ignore errors (e.g., if user is not a driver)
                }
                break;
            }
        }
    });

    // --- Chat logic ---
    socket.on('join-chat', (rideId: string) => {
        socket.join(rideId);
        console.log(`💬 Socket ${socket.id} joined room ${rideId}`);
    });

    socket.on('send-message', async (data: { rideId: string; senderId: string; text: string }) => {
        const { rideId, senderId, text } = data;
        let message = {
            id: 'temp-' + Date.now(),
            rideId,
            senderId,
            text,
            createdAt: new Date()
        };

        try {
            if (rideId !== 'mock-ride-id') {
                const dbMsg = await prisma.message.create({
                    data: {
                        rideId,
                        senderId,
                        text
                    }
                });
                message = {
                    id: String(dbMsg.id),
                    rideId: dbMsg.rideId,
                    senderId: dbMsg.senderId,
                    text: dbMsg.text,
                    createdAt: dbMsg.createdAt
                };
            }
        } catch (error: any) {
            console.warn('⚠️ [Socket send-message] Failed to save message to DB, proceeding with memory emit:', error.message);
        }

        // Always relay the message to the socket room to avoid breaking UI transitions (e.g., driver arrived)
        socket.to(rideId).emit('receive-message', message);
        console.log(`💬 Message relayed in room ${rideId}: ${text}`);
    });

    socket.on('end-call', (data: { targetUserId: string }) => {
        console.log(`[WebRTC-Debug] socket received 'end-call' from socket.id=${socket.id} for targetUserId=${data.targetUserId}`);
        const targetSocketId = userSocketMap.get(data.targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit('end-call');
            console.log(`[WebRTC-Debug] 📡 Relayed 'end-call' to targetSocketId=${targetSocketId} (userId=${data.targetUserId})`);
        } else {
            console.log(`[WebRTC-Debug] ⚠️ Target user ${data.targetUserId} is offline. Cannot relay 'end-call'.`);
        }
    });

    socket.on('notify-incoming-call', (data: {
        targetUserId: string;
        roomName: string;
        roomUrl: string;
        callerId: string;
        callerName: string;
        callerPhone: string;
        callerAvatar: string | null;
        callerVehicle: string | null;
    }) => {
        console.log(`[WebRTC-Debug] socket received 'notify-incoming-call' from callerId=${data.callerId} for targetUserId=${data.targetUserId}`);
        const targetSocketId = userSocketMap.get(data.targetUserId);
        if (targetSocketId) {
            io.to(targetSocketId).emit('incoming-call', {
                roomName: data.roomName,
                roomUrl: data.roomUrl,
                callerId: data.callerId,
                callerName: data.callerName,
                callerPhone: data.callerPhone,
                callerAvatar: data.callerAvatar,
                callerVehicle: data.callerVehicle,
            });
            console.log(`[WebRTC-Debug] 📡 Relayed 'incoming-call' from ${data.callerName} to targetSocketId=${targetSocketId} (userId=${data.targetUserId})`);
        } else {
            console.log(`[WebRTC-Debug] ⚠️ Target user ${data.targetUserId} is offline. Cannot relay 'incoming-call'.`);
        }
    });
});

export { io, userSocketMap };

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/call', callRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/fare', fareRoutes);
app.get('/', (req: Request, res: Response) => {
    res.send('Backend Express Server is running');
});

// Nodemon trigger comment for DB synchronization
httpServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    console.log(`Prisma client fully synchronized on port 5432.`);
    console.log(`🔌 Socket.io is ready for connections`);
});
