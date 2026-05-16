
import express, { Express, Request, Response } from 'express';
import driverRoutes from './routes/driver.routes';
import destinationRoutes from './routes/destination.routes';
import authRoutes from './routes/auth.routes';
import reviewRoutes from './routes/review.routes';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/reviews', reviewRoutes);
app.get('/', (req: Request, res: Response) => {
    res.send('Backend Express Server is running');
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
