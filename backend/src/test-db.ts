import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
    try {
        await client.connect();
        console.log('Kết nối database thành công!');
        
        const res = await client.query('SELECT NOW()');
        console.log('Thời gian hiện tại từ DB:', res.rows[0].now);
        
        await client.end();
    } catch (err) {
        console.error('Lỗi kết nối database:', err);
    }
}

testConnection();
