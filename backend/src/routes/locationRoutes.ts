import { Router, Request, Response } from 'express';

const router = Router();

// API GET /api/locations/search?q=keyword
router.get('/search', async (req: Request, res: Response) => {
    try {
        const { q } = req.query;

        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Thiếu tham số tìm kiếm (q)' });
        }

        // Gọi API Nominatim từ Backend
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=vn,jp`;
        
        const response = await fetch(nominatimUrl, {
            headers: {
                // Nominatim yêu cầu User-Agent hợp lệ
                'User-Agent': 'JV-Taxi-Backend/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim API lỗi: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Trả dữ liệu về cho Frontend
        res.json(data);
    } catch (error) {
        console.error('Lỗi khi gọi Map API:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy gợi ý địa điểm.' });
    }
});

export default router;
