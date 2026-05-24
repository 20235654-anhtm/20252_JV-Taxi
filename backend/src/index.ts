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
import prisma from './config/db';
import dotenv from 'dotenv';
import cors from 'cors';
import prisma from './config/db';

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
        try {
            const { rideId, senderId, text } = data;
            
            // Lưu tin nhắn vào CSDL
            // Lưu tin nhắn vào CSDL
            
            const message = await prisma.message.create({
                data: {
                    rideId,
                    senderId,
                    text
                }
            });

            // Gửi tin nhắn cho tất cả người trong phòng (bao gồm cả người gửi, hoặc frontend tự cập nhật UI)
            // Phát cho các client khác trong phòng
            socket.to(rideId).emit('receive-message', message);
            
            console.log(`💬 Message sent in room ${rideId}: ${text}`);
        } catch (error: any) {
            console.error('Error handling send-message:', error);
            socket.emit('chat-error', { message: 'Failed to send message', error: error.message });
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
app.get('/', (req: Request, res: Response) => {
    res.send('Backend Express Server is running');
});

httpServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    console.log(`Prisma client fully synchronized on port 5432.`);
    console.log(`🔌 Socket.io is ready for connections`);
});
