import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { login, register, getMe, updateProfile, updatePaymentMethod } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop())
  }
})

const upload = multer({ storage: storage });

router.post('/login', login);
router.post('/register', upload.any(), register);
router.get('/me', authMiddleware as any, getMe);
router.put('/profile/update', authMiddleware as any, upload.any(), updateProfile);
router.put('/profile/payment-method', authMiddleware as any, express.json(), updatePaymentMethod);

export default router;
