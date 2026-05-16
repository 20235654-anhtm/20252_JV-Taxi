import http from 'http';
import express, { Express, Request, Response } from 'express';
import { Server } from 'socket.io';
import driverRoutes from './routes/driver.routes';
import destinationRoutes from './routes/destination.routes';
import authRoutes from './routes/auth.routes';
import rideRoutes from './routes/ride.routes';
import messageRoutes from './routes/message.routes';
import { setupSocketHandlers } from './socket/socketHandler';
import { setIO } from './socket/io';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('JV-Taxi Backend Server is running');
});

// HTTP Server + Socket.io
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT'],
  },
});

setIO(io);
setupSocketHandlers(io);

httpServer.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  console.log(`🔌[socket]: Socket.io is ready`);
});
