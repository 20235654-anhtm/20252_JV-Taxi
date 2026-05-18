import { Router } from 'express';
import { initiateCall, acceptCall } from '../controllers/call.controller';

const router = Router();

// Driver gọi cho passenger
// Body: { callerId: "driver-uuid", targetUserId: "passenger-uuid" }
router.post('/initiate', initiateCall);

// Passenger chấp nhận cuộc gọi
// Body: { roomName: "call-xxx-123", userId: "passenger-uuid" }
router.post('/accept', acceptCall);

export default router;
