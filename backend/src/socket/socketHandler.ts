import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

interface JwtPayload {
  userId: string;
  role: string;
}

export function setupSocketHandlers(io: Server) {
  // Authenticate socket connections via JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      socket.data.userId = decoded.userId;
      socket.data.role = decoded.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const { userId, role } = socket.data;
    console.log(`[Socket] Connected: ${userId} (${role})`);

    // Join personal room to receive targeted events
    socket.join(`user:${userId}`);

    // Driver joins their own room to receive ride requests
    if (role === 'DRIVER') {
      socket.join(`driver:${userId}`);
    }

    // Join a ride room (for chat after acceptance)
    socket.on('join_ride', (rideId: string) => {
      socket.join(`ride:${rideId}`);
      console.log(`[Socket] ${userId} joined ride room: ${rideId}`);
    });

    // Send message in a ride room
    socket.on('send_message', async ({ rideId, content }: { rideId: string; content: string }) => {
      if (!rideId || !content?.trim()) return;

      try {
        // Persist to DB
        const message = await prisma.message.create({
          data: {
            rideId,
            senderId: userId,
            content: content.trim(),
          },
          include: {
            sender: {
              select: { id: true, fullName: true },
            },
          },
        });

        // Broadcast to all in ride room
        io.to(`ride:${rideId}`).emit('new_message', {
          id: message.id,
          rideId: message.rideId,
          senderId: message.senderId,
          senderName: message.sender.fullName,
          content: message.content,
          createdAt: message.createdAt,
        });
      } catch (err) {
        console.error('[Socket] send_message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ rideId }: { rideId: string }) => {
      socket.to(`ride:${rideId}`).emit('user_typing', { userId });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${userId}`);
    });
  });
}
